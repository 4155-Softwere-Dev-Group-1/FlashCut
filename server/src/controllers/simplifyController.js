const aiService = require('../services/aiService');

async function simplify(req, res, next) {
  try {
    const { simplified } = await aiService.simplifyText(req.body.text);
    res.json({ simplified });
  } catch (error) {
    next(error);
  }
}

module.exports = { simplify };
