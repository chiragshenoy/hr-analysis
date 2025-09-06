'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface TurnoverChartProps {
  employees: Employee[];
}

export default function TurnoverChart({ employees }: TurnoverChartProps) {
  // Group exits by month for the last 24 months
  const currentDate = new Date();
  const monthlyData: { [key: string]: { joins: number; exits: number; month: string } } = {};

  // Initialize last 24 months
  for (let i = 23; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthlyData[monthKey] = { joins: 0, exits: 0, month: monthName };
  }

  // Count joins
  employees.forEach(employee => {
    const joinDate = new Date(employee['Date of Joining']);
    const monthKey = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].joins++;
    }
  });

  // Count exits
  employees.forEach(employee => {
    if (employee['Date of Exit']) {
      const exitDate = new Date(employee['Date of Exit']);
      const monthKey = `${exitDate.getFullYear()}-${String(exitDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].exits++;
      }
    }
  });

  const chartData = Object.values(monthlyData);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring vs Turnover Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="joins" stroke="#00C49F" strokeWidth={2} name="New Hires" />
          <Line type="monotone" dataKey="exits" stroke="#FF8042" strokeWidth={2} name="Exits" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
