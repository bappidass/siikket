import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm text-gray-600">₹{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

interface StatsCardsProps {
  data: any;
}

const PlatformChart = ({ data }: StatsCardsProps) => {
  const [platformData, setPlatformData] = useState([
    { name: "POS", value: 30, color: "#06B6D4" },
    { name: "Website", value: 25, color: "#8B5CF6" },
    { name: "Zomato", value: 20, color: "#EF4444" },
    { name: "Swiggy", value: 15, color: "#F97316" },
    { name: "Other", value: 10, color: "#6B7280" },
  ]);

  useEffect(() => {
    if (data && Array.isArray(data.platform)) {
      const apiMap = new Map(
        data.platform.map((item: any) => [
          item.platform.toLowerCase(),
          parseFloat(item.total_amount),
        ])
      );

      const updated: any = [...platformData].map((platform) => ({
        ...platform,
        value: apiMap.get(platform.name.toLowerCase()) || 0,
      }));

      setPlatformData(updated);
    }
  }, [data]);
  return (
    <div className="w-full sm:w-1/2 md:w-1/2 h-80">
      <Label>2. Platforms</Label>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={platformData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {platformData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ outline: "none" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlatformChart;
