import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = process.env.TRONX_DATA_DIR ?? path.join(process.cwd(), '.runtime-data');
const accountFile = path.join(dataDir, 'account.json');

export type AdminProfile = {
  name: string;
  email: string;
  role: string;
  avatarDataUrl?: string;
  updatedAt?: string;
};

type AccountState = {
  profile: AdminProfile;
  passwordHash?: string;
  passwordSalt?: string;
};

const defaultEmail = process.env.TRONX_ADMIN_EMAIL ?? 'admin@tronx.vn';
const defaultPassword = process.env.TRONX_ADMIN_PASSWORD ?? 'admin123';

const defaultProfile: AdminProfile = {
  name: 'Nguyễn Văn A',
  email: defaultEmail,
  role: 'Admin',
};

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

function verifyHash(password: string, hash: string, salt: string) {
  const incoming = Buffer.from(hashPassword(password, salt), 'hex');
  const stored = Buffer.from(hash, 'hex');

  if (incoming.length !== stored.length) return false;
  return timingSafeEqual(incoming, stored);
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const account = await readAccount();
  return account.profile;
}

export async function updateAdminProfile(profile: Partial<AdminProfile>): Promise<AdminProfile> {
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

export async function verifyAdminCredential(email: string, password: string) {
  const account = await readAccount();
  const normalizedEmail = email.trim().toLowerCase();
  const matchesEmail =
    normalizedEmail === 'admin' ||
    normalizedEmail === account.profile.email.toLowerCase() ||
    normalizedEmail === defaultEmail.toLowerCase();

  if (!matchesEmail) return false;

  if (account.passwordHash && account.passwordSalt) {
    return verifyHash(password, account.passwordHash, account.passwordSalt);
  }

  return password === defaultPassword;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const account = await readAccount();
  const currentEmail = account.profile.email || defaultEmail;
  const validCurrentPassword = await verifyAdminCredential(currentEmail, currentPassword);

  if (!validCurrentPassword) {
    return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
  }

  if (newPassword.length < 8) {
    return { ok: false, error: 'Mật khẩu mới cần tối thiểu 8 ký tự.' };
  }

  const salt = randomBytes(16).toString('hex');
  await writeAccount({
    ...account,
    passwordSalt: salt,
    passwordHash: hashPassword(newPassword, salt),
  });

  return { ok: true };
}
