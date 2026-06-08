type ChartDatum = {
  date: string;
};

type ChartSeries = {
  key: string;
  color: string;
  dashed?: boolean;
};

interface SvgLineChartProps {
  data: ChartDatum[];
  series: ChartSeries[];
  viewBoxWidth?: number;
}

function buildPath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function getValue(item: ChartDatum, key: string) {
  return Number((item as unknown as Record<string, unknown>)[key] ?? 0);
}

export default function SvgLineChart({ data, series, viewBoxWidth = 620 }: SvgLineChartProps) {
  const width = viewBoxWidth;
  const height = 260;
  const padding = { top: 16, right: 18, bottom: 34, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.flatMap((item) => series.map((line) => getValue(item, line.key)));
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  const range = rawMax - rawMin || 1;
  const paddingValue = range * 0.08;
  const yMin = rawMin - paddingValue;
  const yMax = rawMax + paddingValue;
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, index) => yMin + ((yMax - yMin) * index) / (tickCount - 1));
  const targetLabelWidth = 56;
  const maxVisibleLabels = Math.max(2, Math.floor(chartWidth / targetLabelWidth));
  const showAllLabels = data.length <= maxVisibleLabels;
  const step = showAllLabels ? 1 : Math.ceil((data.length - 1) / Math.max(maxVisibleLabels - 1, 1));
  const xTickIndexes = showAllLabels
    ? data.map((_, index) => index)
    : data
      .map((_, index) => index)
      .filter((index) => index === 0 || index === data.length - 1 || index % step === 0);

  const getX = (index: number) => padding.left + (chartWidth * index) / Math.max(data.length - 1, 1);
  const getY = (value: number) => {
    const normalized = (value - yMin) / (yMax - yMin);
    return padding.top + chartHeight - chartHeight * normalized;
  };
  const zeroLineY = yMin < 0 && yMax > 0 ? getY(0) : null;
  const formatTick = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

  return (
    <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      {yTicks.map((tick) => {
        const y = getY(tick);

        return (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="12">
              {formatTick(tick)}
            </text>
          </g>
        );
      })}

      {zeroLineY !== null && (
        <line
          x1={padding.left}
          y1={zeroLineY}
          x2={width - padding.right}
          y2={zeroLineY}
          stroke="#cbd5e1"
          strokeWidth="1.25"
        />
      )}

      {xTickIndexes.map((index) => (
        <text
          key={data[index].date}
          x={getX(index)}
          y={height - 10}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontWeight="500"
        >
          {data[index].date}
        </text>
      ))}

      {series.map((line) => {
        const points = data.map((item, index) => ({
          x: getX(index),
          y: getY(getValue(item, line.key)),
        }));

        return (
          <g key={line.key}>
            <path
              d={buildPath(points)}
              fill="none"
              stroke={line.color}
              strokeDasharray={line.dashed ? '6 5' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((point, index) => (
              <circle
                key={`${line.key}-${data[index].date}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={line.color}
                stroke="#fff"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
