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

const ExpenseChart = ({ data }: dataProps) => {
  const [expenseData, setExpenseData] = useState([
    { name: "Misc", value: 0, color: "#8B5CF6" },
    { name: "Raw Material Purchases", value: 0, color: "#10B981" },
    { name: "Human Resource", value: 0, color: "#F59E0B" },
    { name: "Rent", value: 0, color: "#EF4444" },
    { name: "Gas/Fuel", value: 0, color: "#3B82F6" },
    { name: "Electricity", value: 0, color: "#8be1d4" }
  ]);
  useEffect(() => {
    if (data && Array.isArray(data.expenseType)) {
      const apiMap = new Map(
        data.expenseType.map((item: any) => [
          item.type.toLowerCase(),
          parseFloat(item.total_expense),
        ])
      );

      const updated: any = [...expenseData].map((expense) => ({
        ...expense,
        value: apiMap.get(expense.name.toLowerCase()) || 0,
      }));

      setExpenseData(updated);
    }
  }, [data]);
  return (
    <div className="w-full sm:w-1/2 md:w-1/2 h-80">
      <Label>4. Expense Types</Label>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {expenseData.map((entry, index) => (
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

export default ExpenseChart;
