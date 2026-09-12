-- =============================================================================
-- Employee Resource Directory — Database Schema & Seed Data
-- Database: MySQL
-- =============================================================================

-- Create the database if it does not already exist
CREATE DATABASE IF NOT EXISTS employee_resource_directory;

-- Switch to the database
USE employee_resource_directory;

-- Drop the table if it exists (allows safe reruns during development)
DROP TABLE IF EXISTS employees;

-- =============================================================================
-- EMPLOYEES TABLE
-- =============================================================================
-- Single table with a self-referencing foreign key for the reporting hierarchy.
-- manager_id points back to employees.id — a manager is also an employee.

CREATE TABLE employees (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    department  VARCHAR(50)     NOT NULL,
    role        VARCHAR(50)     NOT NULL,
    manager_id  INT             DEFAULT NULL,
    status      ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    -- Self-referencing foreign key: manager_id → employees.id
    -- ON DELETE SET NULL: if a manager is deleted, their direct reports
    -- become top-level employees (manager_id set to NULL) rather than
    -- being cascade-deleted or causing a constraint error.
    CONSTRAINT fk_manager
        FOREIGN KEY (manager_id) REFERENCES employees(id)
        ON DELETE SET NULL
);

-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Insert order matters: managers (no manager_id) are inserted first,
-- then team leads, then employees who report to them.
-- This respects the foreign key constraint at every step.

-- ROUND 1: Top-level managers (no manager — manager_id is NULL)
INSERT INTO employees (name, email, department, role, manager_id, status) VALUES
    ('Sarah Johnson',   'sarah.johnson@company.com',    'HR',           'Manager',   NULL, 'active'),
    ('Michael Chen',    'michael.chen@company.com',     'Engineering',  'Manager',   NULL, 'active'),
    ('Lisa Thompson',   'lisa.thompson@company.com',    'Finance',      'Manager',   NULL, 'active'),
    ('Daniel Martinez', 'daniel.martinez@company.com',  'Sales',        'Manager',   NULL, 'active');

-- ROUND 2: Team leads (report to managers above)
-- Sarah Johnson = id 1, Michael Chen = id 2, Lisa Thompson = id 3, Daniel Martinez = id 4
INSERT INTO employees (name, email, department, role, manager_id, status) VALUES
    ('Emily Rodriguez', 'emily.rodriguez@company.com',  'Engineering',  'Team Lead', 2, 'active'),
    ('Priya Patel',     'priya.patel@company.com',      'Sales',        'Team Lead', 4, 'active'),
    ('Amanda Foster',   'amanda.foster@company.com',    'HR',           'Team Lead', 1, 'active');

-- ROUND 3: Individual contributors (report to team leads or managers)
-- Emily Rodriguez = id 5, Priya Patel = id 6, Amanda Foster = id 7
INSERT INTO employees (name, email, department, role, manager_id, status) VALUES
    ('James Wilson',    'james.wilson@company.com',     'Engineering',  'Employee',  5, 'active'),
    ('Kevin Brown',     'kevin.brown@company.com',      'Engineering',  'Employee',  5, 'active'),
    ('David Kim',       'david.kim@company.com',        'Sales',        'Employee',  6, 'active'),
    ('Robert Garcia',   'robert.garcia@company.com',    'Finance',      'Employee',  3, 'inactive'),
    ('Sophia Lee',      'sophia.lee@company.com',       'HR',           'Employee',  7, 'active');
