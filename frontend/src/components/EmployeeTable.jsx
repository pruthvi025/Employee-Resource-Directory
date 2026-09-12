import React from 'react';

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  if (!employees || employees.length === 0) {
    return <div className="empty-state">No employees found.</div>;
  }

  return (
    <div className="table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Reporting Manager</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <div className="employee-name">{employee.name}</div>
                <div className="employee-email">{employee.email}</div>
              </td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td className="manager-cell">
                {employee.manager_name ? employee.manager_name : <span className="no-manager">No Manager</span>}
              </td>
              <td>
                <span className={`status-badge ${employee.status}`}>
                  {employee.status}
                </span>
              </td>
              <td className="actions-cell">
                <button 
                  className="btn-edit" 
                  onClick={() => onEdit(employee)}
                  aria-label={`Edit ${employee.name}`}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => onDelete(employee)}
                  aria-label={`Delete ${employee.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
