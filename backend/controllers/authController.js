const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const signup = async (req, res) => {
  const { email, password, firstName, lastName, dob, country, travelStyle } = req.body;
  console.log("SignUp request: ", email);
  console.log("FULL SIGNUP BODY:", req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User alreadyy exist'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword, 
      firstName,
      lastName,
      dob,
      country,
      travelStyle
    });

    await newUser.save();
    res.status(201).json({ message: 'Signup successful', userId: newUser.id });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request: ", email);

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log("Retrieved user:", currentUser);
    const isPasswordValid = await bcrypt.compare(password, currentUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: currentUser._id, email: currentUser.email },
      process.env.JWT_SECRET || 'dev_secret', 
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successul', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { signup, login };