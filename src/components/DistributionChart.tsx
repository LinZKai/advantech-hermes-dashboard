import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from './AsyncState'
import styles from './DistributionChart.module.css'

interface DistributionChartProps {
  title: string
  data: Record<string, number>
  color?: string
}

export function DistributionChart({ title, data, color = 'var(--color-primary-light)' }: DistributionChartProps) {
  const entries = Object.entries(data)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return (
    <div className={`surface-card ${styles.card}`}>
      <p className="section-title">{title}</p>
      {entries.length === 0 ? (
        <EmptyState title="目前尚無資料" />
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={Math.max(160, entries.length * 36)}>
            <BarChart data={entries} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-bg)' }}
                contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 12.5 }}
              />
              <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
