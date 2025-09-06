'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface LocationChartProps {
  employees: Employee[];
}

export default function LocationChart({ employees }: LocationChartProps) {
  const locationData = employees.reduce((acc, employee) => {
    const location = employee.Location;
    if (location) {
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(locationData)
    .map(([location, count]) => ({
      name: location,
      employees: count,
    }))
    .sort((a, b) => b.employees - a.employees);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees by Location</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="employees" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
