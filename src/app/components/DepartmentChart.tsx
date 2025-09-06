'use client';

import { useState, useMemo } from 'react';
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

interface DepartmentChartProps {
  employees: Employee[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DepartmentChart({ employees }: DepartmentChartProps) {
  const [activeOnly, setActiveOnly] = useState(true);

  const chartData = useMemo(() => {
    // Filter employees based on active status
    const filteredEmployees = activeOnly 
      ? employees.filter(emp => !emp['Date of Exit'])
      : employees;

    const departmentData = filteredEmployees.reduce((acc, employee) => {
      const dept = employee.Department;
      if (dept) {
        acc[dept] = (acc[dept] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(departmentData).map(([department, count]) => ({
      name: department,
      value: count,
    }));
  }, [employees, activeOnly]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Employees by Department</h3>
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
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
