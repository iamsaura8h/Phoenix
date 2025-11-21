// File: src/app/components/dashboard/Metric.tsx
import { ReactNode } from "react";

type MetricProps = {
  label: string;
  value: string | ReactNode;
};

export default function Metric({ label, value }: MetricProps) {
  return (
    <div className="p-3 rounded bg-secondary flex flex-col">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
