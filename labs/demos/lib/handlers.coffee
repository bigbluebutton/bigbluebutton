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
  console.log "\n\nThe Username passed was=" + JSON.stringify(req.body.name) + "\n\n"
  joinParams.fullName = JSON.stringify req.body.name
  joinParams.fullName = joinParams.fullName.replace(/['"]/g,'')

  #calling createapi
  bbbapi.create(createParams, serverAndSecret, {}, (errorOuter, responseOuter, bodyOuter) ->
    #console.log JSON.stringify(response)
    bbbapi.join(joinParams, serverAndSecret, {}, (error, response, body) ->
      if error
          console.log error
      else
        xml = '' + response.body
        console.log "\n\nxml=" + xml
        
        {parseString} = require 'xml2js'
        parseString(xml, (err, result) ->
          if err
            console.log "Error: " + err
          else
            meeting_id = result.response.meeting_id
            user_id = result.response.user_id
            auth_token = result.response.auth_token
            console.log "\nmeeting_id = " + meeting_id +
            "\nuser_id = " + user_id +
            "\nauth_token = " + auth_token

            url = "http://192.168.0.203:3000/html5.client?meeting_id=" + meeting_id + "&user_id=" +
                  user_id + "&auth_token=" + auth_token + "&username=" + joinParams.fullName

            json =
            resp.json({
              success: {
                url: url
              },
              failure: {
                message: "Something went terribly wrong"
              }
            })
        )
    )
  )


exports.index = index
exports.login = login
