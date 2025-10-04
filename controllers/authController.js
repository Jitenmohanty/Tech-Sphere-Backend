const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    user = new User({
      username,
      email,
      password
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        // Set HTTP-only cookie for server authentication
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Also send token in response for client-side API calls
        res.json({ 
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        // Set HTTP-only cookie for server authentication
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Also send token in response for client-side API calls
        res.json({ 
          success: true, 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
          }  
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Authenticate with Google
exports.googleAuth = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const { name, email, picture, sub } = ticket.getPayload();
    
    let user = await User.findOne({ email });
    
    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    } else {
      user = new User({
        username: name,
        email,
        googleId: sub,
        profilePicture: picture,
        password: uuidv4()
      });
      await user.save();
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        // Set HTTP-only cookie for server authentication
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // Also send token in response for client-side API calls
        res.json({ 
          success: true, 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',            // <- important (default is current route /api/auth)
  });

  return res.json({ success: true, message: 'Logged out successfully' });
};


// Get current user
exports.getUser = async (req, res) => {
  try {
    // Try cookie first (most secure)
    let token = req.cookies.token;
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');

    res.json({ user });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ user: null });
  }
};