import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

const PaymentModeChart = ({ data }: dataProps) => {
  const [paymentModeData, setPaymentModeData] = useState([
    { name: "UPI", value: 0, color: "#8B5CF6" },
    { name: "Cash", value: 0, color: "#10B981" },
    { name: "Net Banking", value: 0, color: "#F59E0B" },
    { name: "Card", value: 0, color: "#EF4444" },
    { name: "Mixed", value: 0, color: "#3B82F6" },
    { name: "Partial", value: 0, color: "#8be1d4" },
    { name: "Online", value: 0, color: "#656b6e" },
  ]);
  useEffect(() => {
    if (data && Array.isArray(data.mode)) {
      const apiMap = new Map(
        data.mode.map((item: any) => [
          item.payment_mode.toLowerCase(),
          parseFloat(item.total_amount),
        ])
      );

      const updated: any = [...paymentModeData].map((mode) => ({
        ...mode,
        value: apiMap.get(mode.name.toLowerCase()) || 0,
      }));

      setPaymentModeData(updated);
    }
  }, [data]);
  return (
    <div className="w-full sm:w-1/2 md:w-1/2 h-80">
      <Label>1. Payment Modes</Label>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={paymentModeData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {paymentModeData.map((entry, index) => (
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

export default PaymentModeChart;
