-- Create database
CREATE DATABASE IF NOT EXISTS rota_management;
USE rota_management;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  shift VARCHAR(100) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_assignment (date, shift, employee_name)
);

CREATE TABLE IF NOT EXISTS time_off_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type ENUM('vacation', 'sick', 'personal', 'other') NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
INSERT INTO users (username, password, full_name, employee_name, role) VALUES
('admin', 'admin123', 'Administrator', 'Administrator', 'admin'),
('staff', 'user123', 'Regular User', 'Alice Johnson', 'staff'),
('bob', 'bob123', 'Bob User', 'Bob Smith', 'staff'),
('carol', 'carol123', 'Carol User', 'Carol White', 'staff'),
('david', 'david123', 'David User', 'David Brown', 'staff'),
('emma', 'emma123', 'Emma User', 'Emma Davis', 'staff'),
('frank', 'frank123', 'Frank User', 'Frank Miller', 'staff'),
('george', 'george123', 'George User', 'George King', 'staff'),
('helen', 'helen123', 'Helen User', 'Helen Lee', 'staff'),
('ian', 'ian123', 'Ian User', 'Ian Clark', 'staff'),
('jane', 'jane123', 'Jane User', 'Jane Adams', 'staff')
ON DUPLICATE KEY UPDATE created_at=created_at;

-- Insert sample schedules for week 0
INSERT INTO schedules (date, shift, employee_name) VALUES
('2026-03-23', 'Morning (7AM-11AM)', 'Alice Johnson'), -- Monday
('2026-03-23', 'Morning (7AM-11AM)', 'Bob Smith'),
('2026-03-23', 'Night (4PM-12AM)', 'Emma Davis'),
('2026-03-24', 'Morning (7AM-11AM)', 'Bob Smith'), -- Tuesday
('2026-03-24', 'Morning (7AM-11AM)', 'Carol White'),
('2026-03-24', 'Night (4PM-12AM)', 'David Brown'),
('2026-03-25', 'Morning (7AM-11AM)', 'Carol White'), -- Wednesday
('2026-03-25', 'Morning (7AM-11AM)', 'David Brown'),
('2026-03-25', 'Night (4PM-12AM)', 'Alice Johnson'),
('2026-03-26', 'Morning (7AM-11AM)', 'David Brown'), -- Thursday
('2026-03-26', 'Morning (7AM-11AM)', 'Emma Davis'),
('2026-03-26', 'Night (4PM-12AM)', 'Bob Smith'),
('2026-03-27', 'Morning (7AM-11AM)', 'Emma Davis'), -- Friday
('2026-03-27', 'Morning (7AM-11AM)', 'Alice Johnson'),
('2026-03-27', 'Afternoon (12PM-8PM)', 'David Brown'),
('2026-03-27', 'Afternoon (12PM-8PM)', 'Bob Smith'),
('2026-03-27', 'Night (4PM-12AM)', 'Carol White'),
('2026-03-28', 'Morning (7AM-11AM)', 'Alice Johnson'), -- Saturday
('2026-03-28', 'Morning (7AM-11AM)', 'Carol White'),
('2026-03-28', 'Afternoon (12PM-8PM)', 'Bob Smith'),
('2026-03-28', 'Afternoon (12PM-8PM)', 'Emma Davis'),
('2026-03-28', 'Night (4PM-12AM)', 'David Brown'),
('2026-03-29', 'Morning (7AM-11AM)', 'Bob Smith'), -- Sunday
('2026-03-29', 'Morning (7AM-11AM)', 'David Brown'),
('2026-03-29', 'Afternoon (12PM-8PM)', 'Emma Davis'),
('2026-03-29', 'Afternoon (12PM-8PM)', 'Carol White'),
('2026-03-29', 'Night (4PM-12AM)', 'Alice Johnson');
ON DUPLICATE KEY UPDATE created_at=created_at;

-- Insert sample time off requests
INSERT INTO time_off_requests (employee_name, start_date, end_date, type, reason, status, created_at) VALUES
('Alice Johnson', '2026-12-15', '2026-12-17', 'vacation', 'Family holiday', 'pending', '2026-12-05 10:00:00'),
('Bob Smith', '2026-12-20', '2026-12-22', 'sick', 'Medical appointment', 'approved', '2026-12-03 14:30:00'),
('Carol White', '2026-12-18', '2026-12-18', 'personal', '', 'pending', '2026-12-08 09:15:00')
ON DUPLICATE KEY UPDATE created_at=created_at;
