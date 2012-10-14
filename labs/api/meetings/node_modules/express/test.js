
var express = require('./')
var app = express();

app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});

app.post('/', function(req, res){
  res.send('got "' + req.text + '"');
});

app.listen(3000)