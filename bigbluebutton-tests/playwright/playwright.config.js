require('dotenv').config();
const parameters = require('./parameters');

const config = {
    use: {
      headless: true,
    },
    workers: 1,
};
  
module.exports = config;
