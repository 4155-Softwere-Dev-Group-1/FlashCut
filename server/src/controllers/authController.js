const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email, and password are required' });

    const { user, token } = await authService.register(username, email, password);
    console.log(`[POST /api/auth/register] new user: ${email}`);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const { user, token } = await authService.login(email, password);
    console.log(`[POST /api/auth/login] user logged in: ${email}`);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };