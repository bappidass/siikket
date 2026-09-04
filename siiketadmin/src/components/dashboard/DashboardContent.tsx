import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/dashboard/StatsCards";
import useDashboardStore from "@/store/dashboardStore";
import { useEffect } from "react";

export const DashboardContent = () => {
  const fetchData = useDashboardStore((state) => state.fetchData);
  const data = useDashboardStore((state) => state.data);
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StatsCards data={data} />
        </TabsContent>
      </Tabs>
    </main>
  );
};