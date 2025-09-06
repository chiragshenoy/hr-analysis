'use client';

import { useState, useMemo } from 'react';
import { Users, Search, Filter, ChevronDown, ChevronUp, User } from 'lucide-react';

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

interface ManagerFilterProps {
  employees: Employee[];
}

interface ManagerInfo {
  name: string;
  id: string;
  teamSize: number;
  activeTeamSize: number;
  department: string;
  location: string;
}

export default function ManagerFilter({ employees }: ManagerFilterProps) {
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'teamSize' | 'department'>('teamSize');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get all managers with their team information
  const managers = useMemo(() => {
    const managerMap = new Map<string, ManagerInfo>();
    
    employees.forEach(employee => {
      const managerName = employee['Reporting Manager Full Name'];
      const managerId = employee['Reporting Manager ID'];
      
      if (managerName && managerId) {
        if (!managerMap.has(managerId)) {
          // Find the manager's own record to get their department and location
          const managerRecord = employees.find(emp => emp['Employee ID'] === managerId);
          
          managerMap.set(managerId, {
            name: managerName,
            id: managerId,
            teamSize: 0,
            activeTeamSize: 0,
            department: managerRecord?.Department || 'Unknown',
            location: managerRecord?.Location || 'Unknown',
          });
        }
        
        const managerInfo = managerMap.get(managerId)!;
        managerInfo.teamSize++;
        
        if (!employee['Date of Exit']) {
          managerInfo.activeTeamSize++;
        }
      }
    });
    
    return Array.from(managerMap.values());
  }, [employees]);

  // Filter and sort managers
  const filteredManagers = useMemo(() => {
    let filtered = managers.filter(manager => 
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort managers
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'teamSize':
          aValue = showOnlyActive ? a.activeTeamSize : a.teamSize;
          bValue = showOnlyActive ? b.activeTeamSize : b.teamSize;
          break;
        case 'department':
          aValue = a.department;
          bValue = b.department;
          break;
        default:
          aValue = a.teamSize;
          bValue = b.teamSize;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [managers, searchTerm, sortBy, sortDirection, showOnlyActive]);

  // Get team members for selected manager
  const teamMembers = useMemo(() => {
    if (!selectedManager) return [];
    
    return employees.filter(employee => 
      employee['Reporting Manager ID'] === selectedManager &&
      (!showOnlyActive || !employee['Date of Exit'])
    );
  }, [employees, selectedManager, showOnlyActive]);

  const selectedManagerInfo = managers.find(m => m.id === selectedManager);

  const handleSort = (field: 'name' | 'teamSize' | 'department') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Management View</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Managers List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800">Managers</h4>
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="mr-2"
                />
                Active only
              </label>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search managers or departments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleSort('teamSize')}
                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                  sortBy === 'teamSize' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Team Size
                {sortBy === 'teamSize' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('name')}
                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                  sortBy === 'name' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Name
                {sortBy === 'name' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('department')}
                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                  sortBy === 'department' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Department
                {sortBy === 'department' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Managers List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredManagers.map((manager) => (
              <div
                key={manager.id}
                onClick={() => setSelectedManager(manager.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedManager === manager.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-600">{manager.department} • {manager.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {showOnlyActive ? manager.activeTeamSize : manager.teamSize}
                      </span>
                    </div>
                    {!showOnlyActive && manager.activeTeamSize !== manager.teamSize && (
                      <p className="text-xs text-gray-500">
                        {manager.activeTeamSize} active
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800">
              {selectedManagerInfo ? `${selectedManagerInfo.name}'s Team` : 'Select a Manager'}
            </h4>
            {selectedManagerInfo && (
              <div className="text-sm text-gray-600">
                {teamMembers.length} {showOnlyActive ? 'active' : 'total'} members
              </div>
            )}
          </div>

          {selectedManager ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teamMembers.length > 0 ? (
                teamMembers.map((employee) => (
                  <div
                    key={employee['Employee ID']}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{employee['Employee Full Name']}</p>
                        <p className="text-sm text-gray-600">
                          {employee.Designation} • {employee.Department}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined: {formatDate(employee['Date of Joining'])}
                          {employee['Date of Exit'] && (
                            <span className="ml-2 text-red-600">
                              • Exited: {formatDate(employee['Date of Exit'])}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee['Date of Exit'] 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {employee['Date of Exit'] ? 'Exited' : 'Active'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{employee['Employee ID']}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No {showOnlyActive ? 'active' : ''} team members found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Select a manager to view their team</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
