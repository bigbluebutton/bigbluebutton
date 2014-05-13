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
  bbbapi.create(createParams, serverAndSecret, {}, (errorOuter, responseOuter, bodyOuter) ->
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

        ###XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
        xhr = new XMLHttpRequest()

        url = "http:/192.168.0.203/html5.client?meeting_id=" + meeting_id +
         "&user_id=" + user_id + "&auth_token=" + auth_token
        url2 = "http://google.com"
        if(xhr)
          console.log("+++")
          xhr.onreadystatechange = () ->
            console.log("State: " + this.readyState);

            if (this.readyState == 4) 
              console.log("Complete.\nBody length: " + this.responseText.length);
              console.log("Body:\n" + this.responseText);
            
          xhr.open('GET', url)
          xhr.send()
        else
          console.log("----")###




      ###resp.redirect("http:/192.168.0.203/html5.client?meeting_id=" + meeting_id +
         "&user_id=" + user_id + "&auth_token=" + auth_token)###

      resp.redirect("http://google.com")  #trying to use the "cors" npm module

      console.log ("I am done for now "+ req.xhr)
    )
  )


exports.index = index
exports.login = login
