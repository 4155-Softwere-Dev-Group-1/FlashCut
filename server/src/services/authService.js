const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

async function register(username, email, password) {
  const existing = await userModel.findByEmail(email);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser(username, email, passwordHash);
  const token = signToken(user.id);
  return { user, token };
}

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  if (!user) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

  const token = signToken(user.id);
  return { user: { id: user.id, username: user.username, email: user.email }, token };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

module.exports = { register, login };