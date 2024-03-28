const express = require('express');
const app = express();
const router = require('./routers/router');
const cors = require('cors');

app.use('/api', router);

app.use(
    cors({
       origin: 'http://localhost:3000',
    }),
);

app.listen('8000', () => {
   console.log('backend BBB self test');
});