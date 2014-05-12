xml2js  = require 'xml2js'

bbbapi  = require './bbbapi'
testapi = require './testapi'

index = (request, response) ->
  response.sendfile('./views/index.html')
  
login = (req, resp) ->

  createParams = testapi.createParams
  joinParams = testapi.joinParams
  serverAndSecret = testapi.serverAndSecret

  #use the name from the textbox
  console.log "req=" + JSON.stringify req.query.username
  joinParams.fullName = JSON.stringify req.query.username

  #calling createapi
  bbbapi.create(createParams, serverAndSecret, {}, (error, response, body) ->
    #console.log JSON.stringify(response)
    bbbapi.join(joinParams, serverAndSecret, {}, (error, response, body) ->
      xml = '' + response.body
      console.log "\n\nxml=" + xml
      
      {parseString} = require 'xml2js'
      parseString xml, (err, result) ->
        meeting_id = result.response.meeting_id
        user_id = result.response.user_id
        auth_token = result.response.auth_token
        console.log "\nmeeting_id = " + meeting_id +
        "\nuser_id = " + user_id + 
        "\nauth_token = " + auth_token


        joinParams.userID = user_id
        joinParams.meeting_id = meeting_id
        joinParams.auth_token = auth_token
        bbbapi.join(joinParams, serverAndSecret, {}, (error, response, body) ->
          if error
            console.log "error =" + error
          else
            console.log "wooo-hoooo"
        )

    )
  )


exports.index = index
exports.login = login
