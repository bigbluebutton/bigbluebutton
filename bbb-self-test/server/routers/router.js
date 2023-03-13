const express = require('express');
const cors = require('cors');

const router = express.Router();

router.get('/download', cors(), (req, res) => {
    res.send('download API');
});

router.get('/upload', cors(), (req, res) => {
    res.send('upload API');
});

module.exports = router;