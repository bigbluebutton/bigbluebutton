request = require 'request'
fs      = require 'fs'
log     = require '../lib/logger'

demo        = {did: '6135551234', conf: '85115', accessCode: '12345'}

SAMPLE_CONFS = [demo]


# HANDLER
exports.dialplan = (req, res) -> 
  log.info({request: req.body}, "Received incoming call.")

  destnum = req.param("Caller-Destination-Number")
  
  if destnum?
    # Find the access code
    # return dialplan
    

    
  

