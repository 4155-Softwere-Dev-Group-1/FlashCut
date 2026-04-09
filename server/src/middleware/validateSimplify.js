function validateSimplify(req, res, next) {
  const { text } = req.body;

  if (text == null || text === '') {
    return res.status(400).json({ error: 'text is required' });
  }

  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'text must be a string' });
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'text cannot be blank' });
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return res.status(400).json({ error: 'Select at least two words to simplify' });
  }

  if (trimmed.length > 3000) {
    return res.status(400).json({ error: 'text must be 3000 characters or fewer' });
  }

  req.body.text = trimmed;
  next();
}

module.exports = validateSimplify;
