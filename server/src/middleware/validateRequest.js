// Request validation middleware

function validateRequest(req, res, next) {
  const { term } = req.body;

  if (!term) {
    return res.status(400).json({ error: 'term is required' });
  }

  if (typeof term !== 'string') {
    return res.status(400).json({ error: 'term must be a string' });
  }

  if (term.trim().length === 0) {
    return res.status(400).json({ error: 'term cannot be blank' });
  }

  if (term.length > 200) {
    return res.status(400).json({ error: 'term must be 200 characters or fewer' });
  }

  req.body.term = term.trim();
  next();
}

module.exports = validateRequest;
