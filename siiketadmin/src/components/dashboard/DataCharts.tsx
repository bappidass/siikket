import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface dataProps {
  record: any;
}
export const DataCharts = ({ record }: dataProps) => {
  const [revenuData, setRevenueData] = useState([]);
  useEffect(() => {
    if (record) {
      setRevenueData(record?.saleStats ?? []);
    }
  }, [record]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Monthly Revenue, Expenses and Sales.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="sales">Total Task</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenuData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis
                  width={80}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                  tickCount={6}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Total"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{
                    stroke: "hsl(var(--primary))",
                    fill: "white",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="sales" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenuData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `${value}`}
                  tickLine={false}
                  axisLine={false}
                  tickCount={1}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Total Tasks"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "none",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
