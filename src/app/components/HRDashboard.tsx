'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Building, MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import DepartmentChart from './DepartmentChart';
import LocationChart from './LocationChart';
import GenderChart from './GenderChart';
import TurnoverChart from './TurnoverChart';
import ExitTrendsChart from './ExitTrendsChart';
import ExitTypeChart from './ExitTypeChart';
import TenureExitAnalysis from './TenureExitAnalysis';
import MonthlyExitTrends from './MonthlyExitTrends';
import ManagerFilter from './ManagerFilter';
import EmployeeTable from './EmployeeTable';

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

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  exitedEmployees: number;
  totalDepartments: number;
  totalLocations: number;
  avgTenure: number;
  attritionRate: number;
  newHires: number;
  voluntaryExits: number;
  involuntaryExits: number;
  avgTenureAtExit: number;
  recentExits: number;
}

export default function HRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    exitedEmployees: 0,
    totalDepartments: 0,
    totalLocations: 0,
    avgTenure: 0,
    attritionRate: 0,
    newHires: 0,
    voluntaryExits: 0,
    involuntaryExits: 0,
    avgTenureAtExit: 0,
    recentExits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/hr-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        const data = result.data as Employee[];
        setEmployees(data);
        calculateStats(data);
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error('Error loading HR data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load HR data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateStats = (data: Employee[]) => {
    const totalEmployees = data.length;
    const activeEmployees = data.filter(emp => !emp['Date of Exit']).length;
    const exitedEmployees = data.filter(emp => emp['Date of Exit']).length;
    
    const departments = new Set(data.map(emp => emp.Department)).size;
    const locations = new Set(data.map(emp => emp.Location)).size;
    
    // Calculate average tenure for active employees
    const currentDate = new Date();
    const tenures = data
      .filter(emp => !emp['Date of Exit'])
      .map(emp => {
        const joinDate = new Date(emp['Date of Joining']);
        return (currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      });
    
    const avgTenure = tenures.length > 0 ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;
    
    // Calculate attrition rate for current year
    const currentYear = new Date().getFullYear();
    const currentYearStart = new Date(currentYear, 0, 1);
    
    const currentYearExits = data.filter(emp => {
      if (!emp['Date of Exit']) return false;
      const exitDate = new Date(emp['Date of Exit']);
      return exitDate >= currentYearStart;
    }).length;
    
    const attritionRate = totalEmployees > 0 ? (currentYearExits / totalEmployees) * 100 : 0;
    
    // Calculate new hires in last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const newHires = data.filter(emp => {
      const joinDate = new Date(emp['Date of Joining']);
      return joinDate >= oneYearAgo;
    }).length;

    // Calculate exit type breakdown
    const exitedData = data.filter(emp => emp['Date of Exit']);
    const voluntaryExits = exitedData.filter(emp => emp['Exit Type'] === 'Voluntary').length;
    const involuntaryExits = exitedData.filter(emp => emp['Exit Type'] === 'Involuntary').length;

    // Calculate average tenure at exit
    const exitTenures = exitedData.map(emp => {
      const joinDate = new Date(emp['Date of Joining']);
      const exitDate = new Date(emp['Date of Exit']);
      return (exitDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    });
    const avgTenureAtExit = exitTenures.length > 0 ? exitTenures.reduce((a, b) => a + b, 0) / exitTenures.length : 0;

    // Calculate recent exits (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentExits = data.filter(emp => {
      if (!emp['Date of Exit']) return false;
      const exitDate = new Date(emp['Date of Exit']);
      return exitDate >= threeMonthsAgo;
    }).length;

    setStats({
      totalEmployees,
      activeEmployees,
      exitedEmployees,
      totalDepartments: departments,
      totalLocations: locations,
      avgTenure: Math.round(avgTenure * 10) / 10,
      attritionRate: Math.round(attritionRate * 10) / 10,
      newHires,
      voluntaryExits,
      involuntaryExits,
      avgTenureAtExit: Math.round(avgTenureAtExit * 10) / 10,
      recentExits,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HR data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <strong className="font-bold">Error loading HR data:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
        <p className="text-gray-600">Employee analytics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Exited Employees</p>
              <p className="text-2xl font-bold text-red-600">{stats.exitedEmployees}</p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDepartments}</p>
            </div>
            <Building className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalLocations}</p>
            </div>
            <MapPin className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Tenure</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgTenure} years</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attrition Rate (2025)</p>
              <p className="text-2xl font-bold text-red-600">{stats.attritionRate}%</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Hires (12m)</p>
              <p className="text-2xl font-bold text-green-600">{stats.newHires}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Exit Analysis Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voluntary Exits</p>
              <p className="text-2xl font-bold text-orange-600">{stats.voluntaryExits}</p>
            </div>
            <UserX className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Involuntary Exits</p>
              <p className="text-2xl font-bold text-red-600">{stats.involuntaryExits}</p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Tenure at Exit</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgTenureAtExit} years</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Exits (3m)</p>
              <p className="text-2xl font-bold text-red-500">{stats.recentExits}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DepartmentChart employees={employees} />
        <LocationChart employees={employees} />
        <GenderChart employees={employees} />
        <TurnoverChart employees={employees} />
      </div>

      {/* Exit Analysis Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Exit Analysis & Trends</h2>
        
        {/* Exit Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExitTypeChart employees={employees} />
          <ExitTrendsChart employees={employees} />
        </div>

        {/* Detailed Exit Analysis */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <MonthlyExitTrends employees={employees} />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <TenureExitAnalysis employees={employees} />
        </div>
      </div>

      {/* Team Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Management</h2>
        <ManagerFilter employees={employees} />
      </div>

      {/* Employee Table */}
      <EmployeeTable employees={employees} />
    </div>
  );
}
