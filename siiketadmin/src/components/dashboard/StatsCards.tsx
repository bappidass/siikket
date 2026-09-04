import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CalendarRange, IndianRupee, Wallet } from "lucide-react";

type StatsCardsProps = {
  data: {
    today_revenue?: number;
    weekly_revenue?: number;
    monthly_revenue?: number;
    total_revenue?: number;
  } | null;
};

const formatCurrency = (value?: number) =>
  `₹${(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export const StatsCards = ({ data }: StatsCardsProps) => {
  const stats = [
    {
      label: "Today's Revenue",
      value: data?.today_revenue,
      icon: IndianRupee,
    },
    {
      label: "Weekly Revenue",
      value: data?.weekly_revenue,
      icon: CalendarDays,
    },
    {
      label: "Monthly Revenue",
      value: data?.monthly_revenue,
      icon: CalendarRange,
    },
    {
      label: "Total Revenue",
      value: data?.total_revenue,
      icon: Wallet,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>

            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stat.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};