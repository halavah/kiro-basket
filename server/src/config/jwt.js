require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'kiro_basket_secret_key_2024',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
