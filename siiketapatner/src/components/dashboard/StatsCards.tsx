import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DashboardData } from "@/store/dashboardStore";

type StatsCardsProps = {
  data: DashboardData;
};

const STAT_CONFIG = [
  {
    key: "total_crew" as const,
    label: "Total Crew",
    icon: Users,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    key: "approved_crew" as const,
    label: "Approved",
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-600",
  },
  {
    key: "pending_crew" as const,
    label: "Pending",
    icon: Clock,
    iconClass: "bg-yellow-100 text-yellow-600",
  },
  {
    key: "rejected_crew" as const,
    label: "Rejected",
    icon: XCircle,
    iconClass: "bg-red-100 text-red-600",
  },
];

export const StatsCards = ({ data }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CONFIG.map(({ key, label, icon: Icon, iconClass }) => (
        <Card key={key}>
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold tracking-tight">
                {data[key] ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};