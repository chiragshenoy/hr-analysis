'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

interface TenureExitAnalysisProps {
  employees: Employee[];
}

export default function TenureExitAnalysis({ employees }: TenureExitAnalysisProps) {
  // Calculate tenure for exited employees
  const exitedEmployees = employees
    .filter(emp => emp['Date of Exit'])
    .map(employee => {
      const joinDate = new Date(employee['Date of Joining']);
      const exitDate = new Date(employee['Date of Exit']);
      const tenureYears = (exitDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      return {
        name: employee['Employee Full Name'],
        tenure: Math.round(tenureYears * 10) / 10,
        exitType: employee['Exit Type'] || 'Unknown',
        department: employee.Department,
        designation: employee.Designation,
      };
    });

  // Group by tenure ranges for better visualization
  const tenureRanges = exitedEmployees.reduce((acc, employee) => {
    let range;
    if (employee.tenure < 0.5) range = '0-6 months';
    else if (employee.tenure < 1) range = '6-12 months';
    else if (employee.tenure < 2) range = '1-2 years';
    else if (employee.tenure < 3) range = '2-3 years';
    else if (employee.tenure < 5) range = '3-5 years';
    else range = '5+ years';

    if (!acc[range]) {
      acc[range] = { range, voluntary: 0, involuntary: 0, unknown: 0, total: 0 };
    }

    if (employee.exitType === 'Voluntary') acc[range].voluntary++;
    else if (employee.exitType === 'Involuntary') acc[range].involuntary++;
    else acc[range].unknown++;
    
    acc[range].total++;
    return acc;
  }, {} as Record<string, { range: string; voluntary: number; involuntary: number; unknown: number; total: number }>);

  const chartData = Object.values(tenureRanges);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{data.range}</p>
          <p className="text-green-600">Voluntary: {data.voluntary}</p>
          <p className="text-red-600">Involuntary: {data.involuntary}</p>
          <p className="text-yellow-600">Unknown: {data.unknown}</p>
          <p className="text-gray-600">Total: {data.total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Analysis by Tenure</h3>
      <div className="text-sm text-gray-600 mb-4">
        Understanding when employees typically leave the organization
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {exitedEmployees.filter(emp => emp.tenure < 1).length}
          </div>
          <div className="text-sm text-gray-600">Left within 1 year</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {exitedEmployees.filter(emp => emp.tenure >= 1 && emp.tenure < 3).length}
          </div>
          <div className="text-sm text-gray-600">Left in 1-3 years</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {exitedEmployees.filter(emp => emp.tenure >= 3).length}
          </div>
          <div className="text-sm text-gray-600">Left after 3+ years</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {(exitedEmployees.reduce((sum, emp) => sum + emp.tenure, 0) / exitedEmployees.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg tenure at exit</div>
        </div>
      </div>

      {/* Chart showing tenure ranges */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="total" fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
