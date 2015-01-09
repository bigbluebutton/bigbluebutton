xml2js  = require 'xml2js'

bbbapi  = require './bbbapi'
testapi = require './testapi'
configJson = require './../config.json'

index = (request, response) ->
  response.sendfile('./views/index.html')
  
login = (req, resp) ->
  createParams = testapi.createParams
  joinParams = testapi.joinParams
  serverAndSecret = testapi.serverAndSecret

  #use the name from the textbox
  console.log "\n\nThe Username passed was=" + JSON.stringify(req.body.name) +
  "The Meetingname passed was=" + JSON.stringify(req.body.meetingName) + "\n\n"

  # grab the username and meeting name passed in. Strip the surrounding quotes
  joinParams.fullName = (JSON.stringify req.body.name)?.replace(/['"]/g,'')
  passedMeetingName = (JSON.stringify req.body.meetingName)?.replace(/["]/g,'')

  # use the meeting name from the form to [create if not existing and] join
  # the meeting with such name
  joinParams.meetingID = passedMeetingName
  createParams.name = passedMeetingName
  createParams.meetingID = passedMeetingName

  #calling createapi
  bbbapi.create(createParams, serverAndSecret, {}, (eo, ro, bodyOuter) ->
    #console.log JSON.stringify(response)
    console.log "\n\nouterXML=" + ro.body
    console.log "\neo=" + JSON.stringify eo
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

            url = "#{configJson.settings.IP}:3000/login?meeting_id=" + meeting_id +
                  "&user_id=" + user_id + "&auth_token=" + auth_token

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
