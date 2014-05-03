parser1 = require 'xml2json'
parser2 = require 'json2xml'

xml2json = (xmlStr) ->
  parser1.toJson(xmlStr)

json2xml = (jsonObj) ->
  #parser2(jsonObj)
  parser1.toXml(jsonObj)

exports.xml2json = xml2json
exports.json2xml = json2xml
