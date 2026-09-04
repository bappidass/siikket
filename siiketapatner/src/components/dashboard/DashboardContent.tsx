import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DataCharts } from "@/components/dashboard/DataCharts";
import useDashboardStore from "@/store/dashboardStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const DashboardContent = () => {
  const fetchData = useDashboardStore((state) => state.fetchData);
  const data = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {data.partner?.name
              ? `Welcome back, ${data.partner.name}! Here's an overview of your crew.`
              : "Welcome back! Here's an overview of your account."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <>
              <StatsCards data={data} />

              <div className="grid grid-cols-1 gap-4">
                <DataCharts record={data} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};