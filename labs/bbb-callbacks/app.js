var querystring = require('querystring');
var http = require('http');

var post_domain = '192.168.1.218';
var post_port = 3000;
var post_path = '/update';

var post_data = querystring.stringify({
  'titleTest' : 'Lalala'
});

var post_options = {
  host: post_domain,
  port: post_port,
  path: post_path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': post_data.length
  }
};

var post_req = http.request(post_options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('Response: ' + chunk);
  });
});

// write parameters to post body
post_req.write(post_data);
post_req.end();

