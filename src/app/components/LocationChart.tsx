'use client';

import { useState, useMemo } from 'react';
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
  const [activeOnly, setActiveOnly] = useState(true);

  const chartData = useMemo(() => {
    // Filter employees based on active status
    const filteredEmployees = activeOnly 
      ? employees.filter(emp => !emp['Date of Exit'])
      : employees;

    const locationData = filteredEmployees.reduce((acc, employee) => {
      const location = employee.Location;
      if (location) {
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationData)
      .map(([location, count]) => ({
        name: location,
        employees: count,
      }))
      .sort((a, b) => b.employees - a.employees);
  }, [employees, activeOnly]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Employees by Location</h3>
        <label className="flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Active only
        </label>
      </div>
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
