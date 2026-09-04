import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          ₹{payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

interface dataProps {
  data: any;
}

const TypeChart = ({ data }: dataProps) => {

  const [typeData, setTypeData] = useState([
      { name: "Dine In",name_alias: "dine_in", value: 0, color: "#8B5CF6" },
      { name: "Dine Out",name_alias: "takeaway", value: 0, color: "#10B981" },
      { name: "Delivery",name_alias: "delivery", value: 0, color: "#F59E0B" }
    ]);
    useEffect(() => {
      if (data && Array.isArray(data.saleType)) {
        const apiMap = new Map(
          data.saleType.map((item: any) => [
            item.type.toLowerCase(),
            parseFloat(item.total_amount),
          ])
        );
  
        const updated: any = [...typeData].map((mode) => ({
          ...mode,
          value: apiMap.get(mode.name_alias.toLowerCase()) || 0,
        }));
  
        setTypeData(updated);
      }
    }, [data]);
  return (
    <div className="w-full sm:w-1/2 md:w-1/2 h-80">
      <Label>3. Order Types</Label>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={typeData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {typeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }}/>
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TypeChart;
