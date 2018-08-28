require('dotenv').config();
const axios = require('axios');
const url = require('url');
const helper = require('./helper');

(async() =>
{
  var bbb = url.parse(process.env.BBB_SERVER_URL)
  var check = bbb.protocol + "//" + bbb.hostname + "/html5client/check";
  console.log("HTML5 check URL: " + check);
  const maxRetries = 20;
  const delay = 10000;
  var retryCount = 0;
  while(true)
  {
    try
    {
      var response = await axios.get(check);
      var status = response.data.html5clientStatus
      console.log(response.data);
      if(status === 'running')
      {
        break;
      }
      else if (retryCount < maxRetries)
      {
        retryCount++;
      }
      else
      {
        process.exit(1);
      }
    }
    catch(e)
    {
      console.log(e.message);
      if (retryCount < maxRetries)
      {
        retryCount++;
      }
      else
      {
        process.exit(1);
      }
    }
    console.log("Retrying (attempt " + (retryCount + 1) + "/" + maxRetries + ")...");
    await helper.sleep(delay);
  }
})();