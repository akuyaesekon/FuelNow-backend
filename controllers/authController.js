const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// Simple in-memory store for attendants (in production, use database)
const attendants = new Map();

async function registerAttendant(req, res) {
  try {
    const { name, email, password, stationId } = req.body;

    // Check if attendant exists
    if (attendants.has(email)) {
      return res.status(400).json({
        success: false,
        message: 'Attendant already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Store attendant
    const attendant = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      stationId,
      role: 'attendant',
      createdAt: new Date()
    };

    attendants.set(email, attendant);

    // Generate token
    const token = generateToken({
      id: attendant.id,
      email: attendant.email,
      role: attendant.role,
      stationId: attendant.stationId
    });

    res.status(201).json({
      success: true,
      message: 'Attendant registered successfully',
      data: {
        attendant: {
          id: attendant.id,
          name: attendant.name,
          email: attendant.email,
          stationId: attendant.stationId
        },
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function loginAttendant(req, res) {
  try {
    const { email, password } = req.body;

    // Find attendant
    const attendant = attendants.get(email);
    if (!attendant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, attendant.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({
      id: attendant.id,
      email: attendant.email,
      role: attendant.role,
      stationId: attendant.stationId
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        attendant: {
          id: attendant.id,
          name: attendant.name,
          email: attendant.email,
          stationId: attendant.stationId
        },
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  registerAttendant,
  loginAttendant
};