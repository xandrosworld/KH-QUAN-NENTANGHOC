import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function ChartCard({ title, children, actions }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
