const pool = require('../db');

// ---------- Helpers ----------

// Simple email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_STATUSES = ['active', 'inactive'];

/**
 * Validate employee data for create and update operations.
 * Returns an array of error messages (empty if valid).
 */
const validateEmployee = async (data, { isUpdate = false, employeeId = null } = {}) => {
  const errors = [];
  const { name, email, department, role, status, manager_id } = data;

  // --- Required fields ---
  if (!name || String(name).trim() === '') {
    errors.push('Name is required');
  }
  if (!email || String(email).trim() === '') {
    errors.push('Email is required');
  }
  if (!department || String(department).trim() === '') {
    errors.push('Department is required');
  }
  if (!role || String(role).trim() === '') {
    errors.push('Role is required');
  }

  // --- Email format ---
  if (email && !EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  // --- Status must be 'active' or 'inactive' if provided ---
  if (status !== undefined && status !== null && !VALID_STATUSES.includes(status)) {
    errors.push('Status must be either "active" or "inactive"');
  }

  // --- Self-manager prevention (update only) ---
  if (isUpdate && manager_id !== undefined && manager_id !== null
      && Number(manager_id) === Number(employeeId)) {
    errors.push('An employee cannot be their own manager');
  }

  // --- Duplicate email check (requires DB query) ---
  if (email && EMAIL_REGEX.test(email)) {
    let emailSql = 'SELECT id FROM employees WHERE email = ?';
    const emailParams = [email.trim()];

    if (isUpdate && employeeId) {
      // Exclude current employee from the duplicate check
      emailSql += ' AND id != ?';
      emailParams.push(employeeId);
    }

    const [existing] = await pool.query(emailSql, emailParams);
    if (existing.length > 0) {
      errors.push('Email already exists');
    }
  }

  // --- manager_id must reference an existing employee ---
  if (manager_id !== undefined && manager_id !== null) {
    const [manager] = await pool.query(
      'SELECT id FROM employees WHERE id = ?',
      [manager_id]
    );
    if (manager.length === 0) {
      errors.push('Manager not found. manager_id must reference an existing employee');
    }
  }

  return errors;
};

// ---------- Controllers ----------

/**
 * GET /api/employees
 * Optional query params: ?search=<name>&department=<dept>
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department } = req.query;

    // Base query: self-join to include manager name
    let sql = `
      SELECT e.id, e.name, e.email, e.department, e.role,
             e.manager_id, m.name AS manager_name,
             e.status, e.created_at
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
    `;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('e.name LIKE ?');
      params.push(`%${search}%`);
    }

    if (department) {
      conditions.push('e.department = ?');
      params.push(department);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY e.id';

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.email, e.department, e.role,
              e.manager_id, m.name AS manager_name,
              e.status, e.created_at
       FROM employees e
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, role, manager_id, status } = req.body;

    // Validate input
    const errors = await validateEmployee(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Insert the new employee
    const [result] = await pool.query(
      `INSERT INTO employees (name, email, department, role, manager_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        department.trim(),
        role.trim(),
        manager_id || null,
        status || 'active',
      ]
    );

    // Fetch the created employee with manager name to return
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.email, e.department, e.role,
              e.manager_id, m.name AS manager_name,
              e.status, e.created_at
       FROM employees e
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check the employee exists before validating update data
    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { name, email, department, role, manager_id, status } = req.body;

    // Validate input (with update-specific rules)
    const errors = await validateEmployee(req.body, { isUpdate: true, employeeId: id });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Perform the update
    await pool.query(
      `UPDATE employees
       SET name = ?, email = ?, department = ?, role = ?, manager_id = ?, status = ?
       WHERE id = ?`,
      [
        name.trim(),
        email.trim(),
        department.trim(),
        role.trim(),
        manager_id !== undefined ? manager_id : null,
        status || 'active',
        id,
      ]
    );

    // Fetch and return the updated employee
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.email, e.department, e.role,
              e.manager_id, m.name AS manager_name,
              e.status, e.created_at
       FROM employees e
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = ?`,
      [id]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/employees/:id
 *
 * The schema uses ON DELETE SET NULL on the manager_id foreign key.
 * When an employee who is a manager is deleted, their direct reports'
 * manager_id is automatically set to NULL by MySQL — they become
 * top-level employees. No data is lost.
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check the employee exists
    const [existing] = await pool.query(
      'SELECT id, name FROM employees WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete the employee (ON DELETE SET NULL handles subordinates)
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);

    res.json({ message: `Employee '${existing[0].name}' deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
