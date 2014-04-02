request = require 'request'
sha1 = require('js-sha1')

sharedSecret = '8cd8ef52e8e101574e400365b55e11a6'

exports.createHandler = (req, res) ->
  console.log("CREATE: " + req.originalUrl )
  checksum = req.query.checksum
  console.log("checksum = [" + checksum + "]")
  
  for own propName of req.query 
      console.log(propName + "=" + req.query[propName])
  delete req.query['checksum']
  
  baseString = ""
  for own propName of req.query 
    propVal = req.query[propName]
    if (propName == "welcome")
      propVal = encodeURIComponent(req.query.welcome).replace(/%20/g, '+').replace(/[!'()]/g, escape).replace(/\*/g, "%2A")
    baseString += propName + "=" + propVal + "&"
    console.log(propName + "=" + req.query[propName])
    
  console.log("baseString=[" + baseString.slice(0, -1) + "]")
  
  method = "create"
  qStr = method + baseString.slice(0, -1) + sharedSecret
  console.log("[" + qStr + "]")
  urlChecksum = sha1(qStr)
  console.log "the checksum from url is \n" + checksum + " and mine is\n" + urlChecksum
  
