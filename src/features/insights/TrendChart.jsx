import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function TrendChart({ data, labels }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="mood" name={labels.mood} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="energy" name={labels.energy} stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="sleep" name={labels.sleep} stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="stress" name={labels.stress} stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}