require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

describe('Employee API Endpoints', () => {
  let createdEmployeeId = null;
  const uniqueEmail = `test.jest.${Date.now()}@example.com`;

  // Close database connection after all tests to allow Jest to exit
  afterAll(async () => {
    // Clean up created employee if delete test failed or didn't run
    if (createdEmployeeId) {
      try {
        await pool.query('DELETE FROM employees WHERE id = ?', [createdEmployeeId]);
      } catch (err) {
        console.error('Cleanup failed:', err);
      }
    }
    await pool.end();
  });

  describe('GET /api/employees', () => {
    it('TEST 1: should return all employees', async () => {
      const res = await request(app).get('/api/employees');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('TEST 3: should filter employees by search term', async () => {
      // Assuming 'Sarah' is in the seed data (Sarah Johnson)
      const res = await request(app).get('/api/employees?search=Sarah');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.some(e => e.name.includes('Sarah'))).toBe(true);
    });

    it('TEST 4: should filter employees by department', async () => {
      const res = await request(app).get('/api/employees?department=Engineering');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(e => e.department === 'Engineering')).toBe(true);
    });
  });

  describe('GET /api/employees/:id', () => {
    it('TEST 2: should return an employee by valid ID', async () => {
      // ID 1 should exist from seed data
      const res = await request(app).get('/api/employees/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('id', 1);
      expect(res.body.data).toHaveProperty('name');
    });

    it('TEST 2 (Error): should return 404 for nonexistent ID', async () => {
      const res = await request(app).get('/api/employees/99999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      // Ensure no stack traces or SQL errors are leaked
      expect(res.body.error).toBe('Employee not found');
    });
  });

  describe('POST /api/employees', () => {
    it('TEST 5: should create a new employee', async () => {
      const newEmployee = {
        name: 'Jest Test User',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Tester',
        manager_id: 1, // Sarah Johnson
        status: 'active'
      };

      const res = await request(app)
        .post('/api/employees')
        .send(newEmployee);

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Jest Test User');
      
      createdEmployeeId = res.body.data.id; // Save for cleanup and subsequent tests
    });

    it('TEST 6: should return 400 for validation errors (missing required fields)', async () => {
      const invalidEmployee = {
        name: 'No Email User'
        // missing email, department, role
      };

      const res = await request(app)
        .post('/api/employees')
        .send(invalidEmployee);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Email is required');
      expect(res.body.error).toContain('Department is required');
    });

    it('TEST 7: should return 400 for invalid manager_id', async () => {
      const badManagerEmployee = {
        name: 'Bad Manager',
        email: `bad.manager.${Date.now()}@example.com`,
        department: 'Sales',
        role: 'Employee',
        manager_id: 99999 // nonexistent
      };

      const res = await request(app)
        .post('/api/employees')
        .send(badManagerEmployee);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Manager not found');
    });

    it('TEST 8: should return 400 for duplicate email', async () => {
      // Use the email of the previously created employee
      const duplicateEmployee = {
        name: 'Duplicate Email User',
        email: uniqueEmail,
        department: 'HR',
        role: 'Employee'
      };

      const res = await request(app)
        .post('/api/employees')
        .send(duplicateEmployee);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Email already exists');
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('TEST 9: should prevent an employee from being their own manager', async () => {
      // Ensure we have created an employee in the previous test block
      expect(createdEmployeeId).not.toBeNull();

      const updateData = {
        name: 'Jest Test User',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Tester',
        manager_id: createdEmployeeId // Self-managing!
      };

      const res = await request(app)
        .put(`/api/employees/${createdEmployeeId}`)
        .send(updateData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('An employee cannot be their own manager');
    });

    it('TEST 10: should update an existing employee', async () => {
      expect(createdEmployeeId).not.toBeNull();

      const updateData = {
        name: 'Jest Test User Updated',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Senior Tester',
        manager_id: null,
        status: 'active'
      };

      const res = await request(app)
        .put(`/api/employees/${createdEmployeeId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Jest Test User Updated');
      expect(res.body.data.role).toBe('Senior Tester');
      expect(res.body.data.manager_id).toBeNull();
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('TEST 11: should delete an employee successfully', async () => {
      expect(createdEmployeeId).not.toBeNull();

      const deleteRes = await request(app).delete(`/api/employees/${createdEmployeeId}`);
      expect(deleteRes.statusCode).toBe(200);

      // Verify it's actually gone
      const getRes = await request(app).get(`/api/employees/${createdEmployeeId}`);
      expect(getRes.statusCode).toBe(404);

      // Clear the ID so afterAll doesn't try to delete it again
      createdEmployeeId = null; 
    });
  });
});
