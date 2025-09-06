'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Employee {
  'Employee ID': string;
  'Employee Full Name': string;
  'Date of Joining': string;
  'Gender': string;
  'Designation': string;
  'Department': string;
  'Location': string;
  'Reporting Manager Full Name': string;
  'Reporting Manager ID': string;
  'Date of Exit': string;
  'Exit Type': string;
}

interface ExitTypeChartProps {
  employees: Employee[];
}

const COLORS = ['#00C49F', '#FF8042', '#FFBB28'];

export default function ExitTypeChart({ employees }: ExitTypeChartProps) {
  const exitedEmployees = employees.filter(emp => emp['Date of Exit']);
  
  const exitTypeData = exitedEmployees.reduce((acc, employee) => {
    const exitType = employee['Exit Type'] || 'Unknown';
    acc[exitType] = (acc[exitType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(exitTypeData).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / exitedEmployees.length) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-blue-600">Count: {data.value}</p>
          <p className="text-gray-600">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Type Distribution</h3>
      <div className="text-sm text-gray-600 mb-4">
        Total Exits: {exitedEmployees.length} employees
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
