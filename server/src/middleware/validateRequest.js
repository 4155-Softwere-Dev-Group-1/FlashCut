// Request validation middleware

function validateRequest(req, res, next) {
  // TODO: Add request validation logic
  if (req.body && Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty' });
  }
  next();
}

module.exports = validateRequest;
