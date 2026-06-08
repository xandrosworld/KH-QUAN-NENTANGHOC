import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { QueryResultRow } from 'pg';
import { isDatabaseEnabled, query, withTransaction } from './db';
import { sendOtpEmail } from './email';

const dataDir = process.env.TRONX_DATA_DIR ?? path.join(process.cwd(), '.runtime-data');
const accountFile = path.join(dataDir, 'account.json');

const defaultEmail = process.env.TRONX_ADMIN_EMAIL ?? 'admin@tronx.vn';
const defaultPassword = process.env.TRONX_ADMIN_PASSWORD ?? 'admin123';
const defaultProfile: AdminProfile = {
  id: 'default-admin',
  name: 'TronX Admin',
  email: defaultEmail,
  role: 'Admin',
};

export type AdminProfile = {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatarDataUrl?: string;
  updatedAt?: string;
  emailVerifiedAt?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

type AccountState = {
  profile: AdminProfile;
  passwordHash?: string;
  passwordSalt?: string;
};

type StoredUser = AdminProfile & {
  id: string;
  passwordHash: string;
  passwordSalt: string;
};

type OtpPurpose = 'register' | 'reset_password';

type UserRow = QueryResultRow & {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_data_url: string | null;
  password_hash: string;
  password_salt: string;
  email_verified_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  last_login_at: Date | string | null;
};

type OtpRow = QueryResultRow & {
  id: string;
  email: string;
  purpose: OtpPurpose;
  otp_hash: string;
  otp_salt: string;
  metadata: Record<string, unknown>;
  expires_at: Date | string;
  consumed_at: Date | string | null;
  attempts: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toIso(value?: Date | string | null) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readAccount(): Promise<AccountState> {
  try {
    const content = await fs.readFile(accountFile, 'utf8');
    const parsed = JSON.parse(content) as Partial<AccountState>;

    return {
      profile: {
        ...defaultProfile,
        ...(parsed.profile ?? {}),
      },
      passwordHash: parsed.passwordHash,
      passwordSalt: parsed.passwordSalt,
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return { profile: defaultProfile };
    throw error;
  }
}

async function writeAccount(state: AccountState) {
  await ensureDataDir();
  const tmpPath = `${accountFile}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(state, null, 2), 'utf8');
  await fs.rename(tmpPath, accountFile);
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  return {
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
  };
}

function verifyHash(secret: string, hash: string, salt: string) {
  const incoming = Buffer.from(hashPassword(secret, salt), 'hex');
  const stored = Buffer.from(hash, 'hex');

  if (incoming.length !== stored.length) return false;
  return timingSafeEqual(incoming, stored);
}

function generateOtp() {
  return randomInt(0, 100_000).toString().padStart(5, '0');
}

function mapUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarDataUrl: row.avatar_data_url ?? undefined,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    emailVerifiedAt: toIso(row.email_verified_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    lastLoginAt: toIso(row.last_login_at),
  };
}

async function ensureDefaultAdminUser() {
  if (!isDatabaseEnabled()) return;

  const existing = await query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [defaultEmail]);
  if (existing.rowCount) return;

  const password = createPasswordHash(defaultPassword);
  await query(
    `
      INSERT INTO users (
        id, email, name, role, password_hash, password_salt, email_verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO NOTHING
    `,
    [randomUUID(), defaultEmail, defaultProfile.name, defaultProfile.role, password.passwordHash, password.passwordSalt],
  );
}

async function getUserByEmail(email: string) {
  await ensureDefaultAdminUser();
  const result = await query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function getUserById(userId: string) {
  await ensureDefaultAdminUser();
  const result = await query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function getFirstAdminUser() {
  await ensureDefaultAdminUser();
  const result = await query<UserRow>('SELECT * FROM users ORDER BY created_at ASC LIMIT 1');
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

function publicProfile(user: StoredUser): AdminProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarDataUrl: user.avatarDataUrl,
    updatedAt: user.updatedAt,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function getAdminProfile(): Promise<AdminProfile> {
  if (isDatabaseEnabled()) {
    const user = await getFirstAdminUser();
    return user ? publicProfile(user) : defaultProfile;
  }

  const account = await readAccount();
  return account.profile;
}

export async function getUserProfile(userId?: string): Promise<AdminProfile> {
  if (isDatabaseEnabled() && userId) {
    const user = await getUserById(userId);
    if (user) return publicProfile(user);
  }

  return getAdminProfile();
}

export async function updateAdminProfile(profile: Partial<AdminProfile>): Promise<AdminProfile> {
  return updateUserProfile(undefined, profile);
}

export async function updateUserProfile(userId: string | undefined, profile: Partial<AdminProfile>): Promise<AdminProfile> {
  if (isDatabaseEnabled()) {
    const currentUser = userId ? await getUserById(userId) : await getFirstAdminUser();
    if (!currentUser) throw new Error('User not found.');

    const nextProfile = {
      name: profile.name?.trim() || currentUser.name,
      email: normalizeEmail(profile.email || currentUser.email),
      role: profile.role?.trim() || currentUser.role,
      avatarDataUrl: profile.avatarDataUrl,
    };

    const existingEmail = await query<UserRow>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND id <> $2 LIMIT 1',
      [nextProfile.email, currentUser.id],
    );
    if (existingEmail.rowCount) {
      throw new Error('Email nay da co tai khoan.');
    }

    const result = await query<UserRow>(
      `
        UPDATE users
        SET name = $1,
            email = $2,
            role = $3,
            avatar_data_url = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `,
      [nextProfile.name, nextProfile.email, nextProfile.role, nextProfile.avatarDataUrl ?? null, currentUser.id],
    );

    return publicProfile(mapUser(result.rows[0]));
  }

  const account = await readAccount();
  const nextProfile: AdminProfile = {
    ...account.profile,
    name: profile.name?.trim() || account.profile.name,
    email: profile.email?.trim() || account.profile.email,
    role: profile.role?.trim() || account.profile.role,
    avatarDataUrl: profile.avatarDataUrl,
    updatedAt: new Date().toISOString(),
  };

  await writeAccount({ ...account, profile: nextProfile });
  return nextProfile;
}

export async function verifyAdminCredential(email: string, password: string): Promise<StoredUser | false> {
  const normalizedEmail = normalizeEmail(email);

  if (isDatabaseEnabled()) {
    const lookupEmail = normalizedEmail === 'admin' ? defaultEmail : normalizedEmail;
    const user = await getUserByEmail(lookupEmail);
    if (!user || !user.emailVerifiedAt) return false;
    if (!verifyHash(password, user.passwordHash, user.passwordSalt)) return false;

    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    return user;
  }

  const account = await readAccount();
  const matchesEmail =
    normalizedEmail === 'admin' ||
    normalizedEmail === account.profile.email.toLowerCase() ||
    normalizedEmail === defaultEmail.toLowerCase();

  if (!matchesEmail) return false;

  if (account.passwordHash && account.passwordSalt) {
    if (!verifyHash(password, account.passwordHash, account.passwordSalt)) return false;
  } else if (password !== defaultPassword) {
    return false;
  }

  return {
    id: account.profile.id ?? 'default-admin',
    ...account.profile,
    passwordHash: account.passwordHash ?? hashPassword(defaultPassword, 'default'),
    passwordSalt: account.passwordSalt ?? 'default',
  };
}

export async function changeAdminPassword(currentPassword: string, newPassword: string, userId?: string) {
  if (newPassword.length < 8) {
    return { ok: false, error: 'Mat khau moi can toi thieu 8 ky tu.' };
  }

  if (isDatabaseEnabled()) {
    const user = userId ? await getUserById(userId) : await getFirstAdminUser();
    if (!user) return { ok: false, error: 'Khong tim thay tai khoan.' };

    if (!verifyHash(currentPassword, user.passwordHash, user.passwordSalt)) {
      return { ok: false, error: 'Mat khau hien tai khong dung.' };
    }

    const password = createPasswordHash(newPassword);
    await query(
      'UPDATE users SET password_hash = $1, password_salt = $2, updated_at = NOW() WHERE id = $3',
      [password.passwordHash, password.passwordSalt, user.id],
    );

    return { ok: true };
  }

  const account = await readAccount();
  const currentEmail = account.profile.email || defaultEmail;
  const validCurrentPassword = await verifyAdminCredential(currentEmail, currentPassword);

  if (!validCurrentPassword) {
    return { ok: false, error: 'Mat khau hien tai khong dung.' };
  }

  const password = createPasswordHash(newPassword);
  await writeAccount({
    ...account,
    passwordSalt: password.passwordSalt,
    passwordHash: password.passwordHash,
  });

  return { ok: true };
}

async function createOtp(email: string, purpose: OtpPurpose, metadata: Record<string, unknown>) {
  const otp = generateOtp();
  const otpHash = createPasswordHash(otp);

  await withTransaction(async (tx) => {
    await tx(
      `
        UPDATE email_otps
        SET consumed_at = NOW()
        WHERE LOWER(email) = LOWER($1)
          AND purpose = $2
          AND consumed_at IS NULL
      `,
      [email, purpose],
    );

    await tx(
      `
        INSERT INTO email_otps (
          id, email, purpose, otp_hash, otp_salt, metadata, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW() + INTERVAL '10 minutes')
      `,
      [randomUUID(), email, purpose, otpHash.passwordHash, otpHash.passwordSalt, JSON.stringify(metadata)],
    );
  });

  const mail = await sendOtpEmail({ to: email, otp, purpose });
  return {
    sent: mail.sent,
    devOtp: mail.sent || process.env.NODE_ENV === 'production' ? undefined : otp,
  };
}

async function consumeOtp(email: string, purpose: OtpPurpose, otp: string) {
  const result = await query<OtpRow>(
    `
      SELECT *
      FROM email_otps
      WHERE LOWER(email) = LOWER($1)
        AND purpose = $2
        AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [email, purpose],
  );
  const row = result.rows[0];

  if (!row) return { ok: false as const, error: 'Ma OTP khong hop le hoac da het han.' };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false as const, error: 'Ma OTP da het han. Vui long gui lai ma moi.' };
  }
  if (row.attempts >= 5) {
    return { ok: false as const, error: 'Ma OTP da vuot qua so lan thu. Vui long gui lai ma moi.' };
  }

  const validOtp = verifyHash(otp, row.otp_hash, row.otp_salt);
  if (!validOtp) {
    await query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1', [row.id]);
    return { ok: false as const, error: 'Ma OTP khong dung.' };
  }

  await query('UPDATE email_otps SET consumed_at = NOW(), attempts = attempts + 1 WHERE id = $1', [row.id]);
  return { ok: true as const, metadata: row.metadata };
}

export async function requestRegistrationOtp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  if (!isDatabaseEnabled()) {
    return { ok: false, error: 'Can cau hinh DATABASE_URL truoc khi bat luong dang ky.' };
  }

  const normalizedEmail = normalizeEmail(email);
  const displayName = name.trim();

  if (displayName.length < 2) return { ok: false, error: 'Ten hien thi can toi thieu 2 ky tu.' };
  if (!isValidEmail(normalizedEmail)) return { ok: false, error: 'Email khong hop le.' };
  if (password.length < 8) return { ok: false, error: 'Mat khau can toi thieu 8 ky tu.' };

  await ensureDefaultAdminUser();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing?.emailVerifiedAt) {
    return { ok: false, error: 'Email nay da co tai khoan.' };
  }

  const passwordHash = createPasswordHash(password);
  const otp = await createOtp(normalizedEmail, 'register', {
    name: displayName,
    role: 'User',
    passwordHash: passwordHash.passwordHash,
    passwordSalt: passwordHash.passwordSalt,
  });

  if (!otp.sent && process.env.NODE_ENV === 'production') {
    return { ok: false, error: 'Chua cau hinh SMTP de gui OTP.' };
  }

  return { ok: true, devOtp: otp.devOtp };
}

export async function verifyRegistrationOtp(email: string, otp: string) {
  if (!isDatabaseEnabled()) {
    return { ok: false, error: 'Can cau hinh DATABASE_URL truoc khi bat luong dang ky.' };
  }

  const normalizedEmail = normalizeEmail(email);
  const consumed = await consumeOtp(normalizedEmail, 'register', otp);
  if (!consumed.ok) return consumed;

  const metadata = consumed.metadata as {
    name?: string;
    role?: string;
    passwordHash?: string;
    passwordSalt?: string;
  };

  if (!metadata.passwordHash || !metadata.passwordSalt) {
    return { ok: false, error: 'Du lieu dang ky khong hop le. Vui long gui lai OTP.' };
  }

  const result = await query<UserRow>(
    `
      INSERT INTO users (
        id, email, name, role, password_hash, password_salt, email_verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          email_verified_at = COALESCE(users.email_verified_at, NOW()),
          updated_at = NOW()
      RETURNING *
    `,
    [
      randomUUID(),
      normalizedEmail,
      metadata.name || normalizedEmail,
      metadata.role || 'User',
      metadata.passwordHash,
      metadata.passwordSalt,
    ],
  );

  return { ok: true, profile: publicProfile(mapUser(result.rows[0])) };
}

export async function requestPasswordResetOtp(email: string) {
  if (!isDatabaseEnabled()) {
    return { ok: false, error: 'Can cau hinh DATABASE_URL truoc khi dung quen mat khau.' };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) return { ok: false, error: 'Email khong hop le.' };

  const user = await getUserByEmail(normalizedEmail);
  if (!user || !user.emailVerifiedAt) {
    return { ok: true };
  }

  const otp = await createOtp(normalizedEmail, 'reset_password', { userId: user.id });
  if (!otp.sent && process.env.NODE_ENV === 'production') {
    return { ok: false, error: 'Chua cau hinh SMTP de gui OTP.' };
  }

  return { ok: true, devOtp: otp.devOtp };
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
  if (!isDatabaseEnabled()) {
    return { ok: false, error: 'Can cau hinh DATABASE_URL truoc khi dung quen mat khau.' };
  }

  if (newPassword.length < 8) {
    return { ok: false, error: 'Mat khau moi can toi thieu 8 ky tu.' };
  }

  const normalizedEmail = normalizeEmail(email);
  const consumed = await consumeOtp(normalizedEmail, 'reset_password', otp);
  if (!consumed.ok) return consumed;

  const user = await getUserByEmail(normalizedEmail);
  if (!user) return { ok: false, error: 'Khong tim thay tai khoan.' };

  const password = createPasswordHash(newPassword);
  await query(
    'UPDATE users SET password_hash = $1, password_salt = $2, updated_at = NOW() WHERE id = $3',
    [password.passwordHash, password.passwordSalt, user.id],
  );

  return { ok: true };
}
