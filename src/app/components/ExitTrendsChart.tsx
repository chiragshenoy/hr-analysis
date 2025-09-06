'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

interface ExitTrendsChartProps {
  employees: Employee[];
}

export default function ExitTrendsChart({ employees }: ExitTrendsChartProps) {
  // Group exits by year and exit type
  const exitData = employees
    .filter(emp => emp['Date of Exit'])
    .reduce((acc, employee) => {
      const exitDate = new Date(employee['Date of Exit']);
      const year = exitDate.getFullYear();
      const exitType = employee['Exit Type'];
      
      // Only process exits with known types
      if (exitType === 'Voluntary' || exitType === 'Involuntary') {
        if (!acc[year]) {
          acc[year] = { year: year.toString(), Voluntary: 0, Involuntary: 0, total: 0 };
        }
        
        acc[year][exitType as keyof typeof acc[typeof year]]++;
        acc[year].total++;
      }
      
      return acc;
    }, {} as Record<number, { year: string; Voluntary: number; Involuntary: number; total: number }>);

  const chartData = Object.values(exitData).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Trends by Year & Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Voluntary" stackId="a" fill="#00C49F" name="Voluntary" />
          <Bar dataKey="Involuntary" stackId="a" fill="#FF8042" name="Involuntary" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
