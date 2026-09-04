import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DashboardData } from "@/store/dashboardStore";

type DataChartsProps = {
  record: DashboardData;
};

const STATUS_COLORS: Record<string, string> = {
  approved: "#16a34a",
  pending: "#ca8a04",
  rejected: "#dc2626",
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#a855f7",
  "#ef4444",
];

export const DataCharts = ({ record }: DataChartsProps) => {
  const statusPieData = [
    { name: "Approved", value: record.approved_crew, key: "approved" },
    { name: "Pending", value: record.pending_crew, key: "pending" },
    { name: "Rejected", value: record.rejected_crew, key: "rejected" },
  ].filter((d) => d.value > 0);

  const hasTrend = record.monthly_trend?.length > 0;
  const hasCategoryData = record.category_breakdown?.length > 0;
  const hasStatusData = statusPieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Crew Registrations (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {hasTrend ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={record.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke={STATUS_COLORS.approved}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke={STATUS_COLORS.pending}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  name="Rejected"
                  stroke={STATUS_COLORS.rejected}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
              No registrations in the last 6 months
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {hasStatusData ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusPieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={STATUS_COLORS[entry.key]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
              No crew data yet
            </div>
          )}
        </CardContent>
      </Card>

      {hasCategoryData && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Crew by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={record.category_breakdown}
                  dataKey="count"
                  nameKey="category"
                  outerRadius={90}
                  label={(entry) => `${entry.category}: ${entry.count}`}
                >
                  {record.category_breakdown.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};