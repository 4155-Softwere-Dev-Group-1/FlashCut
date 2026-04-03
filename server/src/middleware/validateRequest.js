// Request validation middleware

function validateRequest(req, res, next) {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'content must be a string' });
  }

  if (content.trim().length === 0) {
    return res.status(400).json({ error: 'content cannot be blank' });
  }

  if (content.length > 1000) {
    return res.status(400).json({ error: 'content must be 1000 characters or fewer' });
  }

  req.body.content = content.trim();
  next();
}

module.exports = validateRequest;
