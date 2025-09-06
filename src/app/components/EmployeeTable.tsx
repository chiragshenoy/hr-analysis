'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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

interface EmployeeTableProps {
  employees: Employee[];
}

type SortField = keyof Employee;
type SortDirection = 'asc' | 'desc';

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('Employee ID');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.Department))).filter(Boolean).sort();
  }, [employees]);

  const locations = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.Location))).filter(Boolean).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee['Employee Full Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee['Employee ID'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.Designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = departmentFilter === '' || employee.Department === departmentFilter;
      const matchesLocation = locationFilter === '' || employee.Location === locationFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !employee['Date of Exit']) ||
        (statusFilter === 'exited' && employee['Date of Exit']);

      return matchesSearch && matchesDepartment && matchesLocation && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, locationFilter, statusFilter]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortDirection]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEmployees, currentPage]);

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Directory</h3>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="exited">Exited</option>
        </select>

        <div className="text-sm text-gray-600 flex items-center">
          Showing {paginatedEmployees.length} of {sortedEmployees.length} employees
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Employee ID')}
              >
                <div className="flex items-center">
                  Employee ID
                  {sortField === 'Employee ID' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Employee Full Name')}
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'Employee Full Name' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Designation')}
              >
                <div className="flex items-center">
                  Designation
                  {sortField === 'Designation' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Department')}
              >
                <div className="flex items-center">
                  Department
                  {sortField === 'Department' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Location')}
              >
                <div className="flex items-center">
                  Location
                  {sortField === 'Location' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Date of Joining')}
              >
                <div className="flex items-center">
                  Join Date
                  {sortField === 'Date of Joining' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEmployees.map((employee) => (
              <tr key={employee['Employee ID']} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee['Employee ID']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee['Employee Full Name']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.Designation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.Department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.Location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(employee['Date of Joining'])}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee['Date of Exit'] 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {employee['Date of Exit'] ? 'Exited' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
