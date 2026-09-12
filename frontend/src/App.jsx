import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import EmployeeTable from './components/EmployeeTable';
import EmployeeForm from './components/EmployeeForm';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Debounce search term to avoid spamming the API
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEmployees(debouncedSearch, departmentFilter);
      setEmployees(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, departmentFilter]);

  // Fetch when filters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddClick = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (employee) => {
    if (isDeleting) return; // Prevent duplicate clicks
    
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        setIsDeleting(true);
        setError(null);
        await api.deleteEmployee(employee.id);
        await fetchEmployees();
      } catch (err) {
        setError(err.message || 'Failed to delete employee.');
        // Auto-clear delete error after a few seconds
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      setError(null);
      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, data);
      } else {
        await api.createEmployee(data);
      }
      setIsFormOpen(false);
      await fetchEmployees(); // Refresh list
    } catch (err) {
      setError(err.message || `Failed to ${editingEmployee ? 'update' : 'create'} employee.`);
      throw err; // Re-throw to let the form know submission failed (to keep it open if desired)
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Employee Resource Directory</h1>
      </header>

      <main className="app-main">
        {/* Error Alert */}
        {error && (
          <div className="alert error">
            <span className="icon">⚠️</span>
            {error}
            <button className="close-btn" onClick={() => setError(null)}>&times;</button>
          </div>
        )}

        {/* Toolbar: Search, Filter, Add */}
        <div className="toolbar">
          <div className="filters">
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="dept-select"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleAddClick}>
            + Add Employee
          </button>
        </div>

        {/* Loading / Content */}
        {loading ? (
          <div className="loading-state">Loading employees...</div>
        ) : (
          <EmployeeTable 
            employees={employees} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
          />
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <EmployeeForm
            initialData={editingEmployee}
            employees={employees}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
