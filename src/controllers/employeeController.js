import { z } from 'zod';
import { promisePool as pool } from '../config/db.js';

// Type safety schema for employee payload
export const employeeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  role: z.string().trim().min(1, 'Job role is required'),
});


export const getEmployees = async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    // 1. Paginated results (Bonus feature)
    if (page && limit && page > 0 && limit > 0) {
      const offset = (page - 1) * limit;

      if (search) {
        const searchTerm = `%${search}%`;
        const countQuery = 'SELECT COUNT(*) AS total FROM employees WHERE name LIKE ?';
        const selectQuery = 'SELECT id, name, email, role, created_at FROM employees WHERE name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const [[{ total }]] = await pool.query(countQuery, [searchTerm]);
        const [rows] = await pool.query(selectQuery, [searchTerm, limit, offset]);

        return res.status(200).json({
          success: true,
          data: rows,
          pagination: {
            total: Number(total),
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        });
      }

      const countQuery = 'SELECT COUNT(*) AS total FROM employees';
      const selectQuery = 'SELECT id, name, email, role, created_at FROM employees ORDER BY created_at DESC LIMIT ? OFFSET ?';

      const [[{ total }]] = await pool.query(countQuery);
      const [rows] = await pool.query(selectQuery, [limit, offset]);

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: Number(total),
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    }


    if (search) {
      const selectQuery = 'SELECT id, name, email, role, created_at FROM employees WHERE name LIKE ? ORDER BY created_at DESC';
      const [rows] = await pool.query(selectQuery, [`%${search}%`]);
      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows,
      });
    }

    
    const selectQuery = 'SELECT id, name, email, role, created_at FROM employees ORDER BY created_at DESC';
    const [rows] = await pool.query(selectQuery);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};


export const getEmployeeById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
    }

    const selectQuery = 'SELECT id, name, email, role, created_at FROM employees WHERE id = ?';
    const [rows] = await pool.query(selectQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};


export const createEmployee = async (req, res, next) => {
  try {
    
    const { name, email, role } = employeeSchema.parse(req.body);

    const insertQuery = 'INSERT INTO employees (name, email, role) VALUES (?, ?, ?)';
    const [result] = await pool.query(insertQuery, [name, email, role]);

    const selectQuery = 'SELECT id, name, email, role, created_at FROM employees WHERE id = ?';
    const [rows] = await pool.query(selectQuery, [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      data: rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(', '),
      });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email address already exists',
      });
    }
    next(error);
  }
};


export const updateEmployee = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
    }

    
    const { name, email, role } = employeeSchema.parse(req.body);

    const updateQuery = 'UPDATE employees SET name = ?, email = ?, role = ? WHERE id = ?';
    const [result] = await pool.query(updateQuery, [name, email, role, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`,
      });
    }

    const selectQuery = 'SELECT id, name, email, role, created_at FROM employees WHERE id = ?';
    const [rows] = await pool.query(selectQuery, [id]);

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(', '),
      });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email address already exists',
      });
    }
    next(error);
  }
};


export const deleteEmployee = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
    }

    const deleteQuery = 'DELETE FROM employees WHERE id = ?';
    const [result] = await pool.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
