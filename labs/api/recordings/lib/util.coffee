sha1 = require 'js-sha1'



removeChecksumFromQuery = (query) ->
  for own propName of query 
    console.log(propName + "=" + query[propName])
    delete query['checksum']
  query

buildCreateBaseString = (query) ->
  baseString = ""
  for own propName of query 
    propVal = query[propName]
    if (propName == "welcome")
      propVal = encodeURIComponent(query.welcome).replace(/%20/g, '+').replace(/[!'()]/g, escape).replace(/\*/g, "%2A")  
    baseString += propName + "=" + propVal + "&"
    console.log(propName + "=" + query[propName])
    
  console.log("baseString=[" + baseString.slice(0, -1) + "]")
  
  baseString.slice(0, -1)

calculateChecksum = (method, baseString, sharedSecret) ->
  qStr = method + baseString + sharedSecret
  console.log("[" + qStr + "]")
  sha1(qStr)
  
    
exports.removeChecksumFromQuery = removeChecksumFromQuery
exports.buildCreateBaseString = buildCreateBaseString
exports.calculateChecksum = calculateChecksum