require('dotenv').config();
const parameters = require('./core/parameters');

const config = {
    use: {
      headless: true,
    },
    workers: 1,
};
  
module.exports = config;
