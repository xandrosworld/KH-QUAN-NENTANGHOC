'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  green: { bg: 'bg-green-50', iconBg: 'bg-green-100', text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', text: 'text-yellow-600' },
  blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', text: 'text-orange-600' },
  red: { bg: 'bg-red-50', iconBg: 'bg-red-100', text: 'text-red-600' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-600' },
};

interface MetricCardProps {
  title: string;
  value: string;
  changeLabel: string;
  change: number;
  icon: string;
  color: string;
  sparklineData?: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 140;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = padding + (height - 2 * padding) - ((v - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  // Area fill path
  const firstX = padding;
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - 2 * padding);
  const areaPoints = `${firstX},${height} ${points} ${lastX},${height}`;

  const strokeColor = color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : color === 'blue' ? '#3b82f6' : color === 'orange' ? '#f97316' : color === 'red' ? '#ef4444' : '#a855f7';
  const fillColor = color === 'green' ? '#22c55e15' : color === 'yellow' ? '#eab30815' : color === 'blue' ? '#3b82f615' : color === 'orange' ? '#f9731615' : color === 'red' ? '#ef444415' : '#a855f715';

  return (
    <svg width={width} height={height} className="mt-1">
      <polygon fill={fillColor} points={areaPoints} />
      <polyline fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function MetricCard({ title, value, changeLabel, change, icon, color, sparklineData }: MetricCardProps) {
  const colors = colorMap[color] || colorMap.green;
  const IconComponent = (icons as unknown as Record<string, LucideIcon>)[icon];
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${colors.iconBg} ${colors.text} flex items-center justify-center`}>
              {IconComponent && <IconComponent size={18} />}
            </div>
            <span className="text-sm text-gray-500 font-medium">{title}</span>
          </div>
        </div>

        {/* Value */}
        <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>

        {/* Change indicator */}
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <ArrowUpRight size={14} className="text-green-500" />
          ) : (
            <ArrowDownRight size={14} className="text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-400">{changeLabel}</span>
        </div>

        {/* Sparkline */}
        {sparklineData && <Sparkline data={sparklineData} color={color} />}
      </div>
    </div>
  );
}
