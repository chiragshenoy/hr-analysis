'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

interface MonthlyExitTrendsProps {
  employees: Employee[];
}

export default function MonthlyExitTrends({ employees }: MonthlyExitTrendsProps) {
  // Group exits by month for the last 24 months
  const currentDate = new Date();
  const monthlyData: { [key: string]: { month: string; voluntary: number; involuntary: number; total: number } } = {};

  // Initialize last 24 months
  for (let i = 23; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthlyData[monthKey] = { month: monthName, voluntary: 0, involuntary: 0, total: 0 };
  }

  // Count exits by month and type
  employees
    .filter(emp => emp['Date of Exit'])
    .forEach(employee => {
      const exitDate = new Date(employee['Date of Exit']);
      const monthKey = `${exitDate.getFullYear()}-${String(exitDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        const exitType = employee['Exit Type'];
        if (exitType === 'Voluntary') {
          monthlyData[monthKey].voluntary++;
        } else if (exitType === 'Involuntary') {
          monthlyData[monthKey].involuntary++;
        }
        monthlyData[monthKey].total++;
      }
    });

  const chartData = Object.values(monthlyData);

  // Calculate moving average for trend analysis
  const movingAverage = (data: number[], windowSize: number = 3) => {
    return data.map((_, index, array) => {
      const start = Math.max(0, index - Math.floor(windowSize / 2));
      const end = Math.min(array.length, start + windowSize);
      const slice = array.slice(start, end);
      return slice.reduce((sum, val) => sum + val, 0) / slice.length;
    });
  };

  const totalExits = chartData.map(d => d.total);
  const trendData = movingAverage(totalExits);

  const chartDataWithTrend = chartData.map((data, index) => ({
    ...data,
    trend: Math.round(trendData[index] * 10) / 10,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Exit Trends (24 Months)</h3>
      <div className="text-sm text-gray-600 mb-4">
        Track exit patterns and identify seasonal trends
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartDataWithTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={2}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="voluntary" 
            stroke="#00C49F" 
            strokeWidth={2} 
            name="Voluntary Exits"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="involuntary" 
            stroke="#FF8042" 
            strokeWidth={2} 
            name="Involuntary Exits"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#8884d8" 
            strokeWidth={2} 
            name="Total Exits"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="trend" 
            stroke="#666666" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            name="Trend (3-month avg)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
