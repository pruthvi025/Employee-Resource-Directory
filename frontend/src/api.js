const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.error) || response.statusText;
    throw new Error(error);
  }

  return data;
}

export const api = {
  getEmployees: async (search = '', department = '') => {
    let url = `${API_URL}/api/employees`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    return handleResponse(response);
  },

  getEmployeeById: async (id) => {
    const response = await fetch(`${API_URL}/api/employees/${id}`);
    return handleResponse(response);
  },

  createEmployee: async (employeeData) => {
    const response = await fetch(`${API_URL}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  updateEmployee: async (id, employeeData) => {
    const response = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  deleteEmployee: async (id) => {
    const response = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
