assert = require('chai').assert
hapi   = require('hapi')

routes = require('../lib/routes')

# integration tests for API endpoint


# setup server with firing up - use inject instead
server = new hapi.Server()
server.route(routes.routes)


# parseurls endpoint test
describe 'checking recordings', ->

  it 'recordings for a given meetingid', ->
    server.inject({method: 'GET', url: '192.168.0.203:4000/recordings?meetingid=fbdbde6fd7b6499723a101c4c962f03843b4879c'}, (res) ->
        #console.log "json:" + res.payload
        array = [
          {
          'format': 'presentation'
          'timestamp':'1396619572523'
          }, {
          'format': 'capture'
          'timestamp':'1396623833044'
          }, {
          'format': 'presentation'
          'timestamp':'1396620788271'
          }, {
          'format': 'presentation'
          'timestamp':'1396622260421'
          }, {
          'format': 'capture'
          'timestamp':'1396623833035'
          }, {
          'format': 'capture'
          'timestamp':'1396623830000'
          }, {
          'format': 'capture'
          'timestamp':'1396619572523'
          }, {
          'format': 'capture'
          'timestamp':'1396622260421'
          }, {
          'format': 'capture'
          'timestamp':'1396620788271'
          }, {
          'format': 'presentation'
          'timestamp':'1396623833035'
          }, {
          'format': 'capture'
          'timestamp':'1396623831111'
          }
        ]

        parsedOnce = JSON.parse(res.payload)
        index = 0
        while index < parsedOnce.length
          assert.deepEqual(JSON.stringify(array[index]), parsedOnce[index])
          index++
          #console.log index
    )
  ###it 'add - should add two numbers together', ->
    server.inject({method: 'PUT', url: '/sum/add/5/5'}, (res) ->
        console.log "json:" +JSON.stringify(res.payload)
        assert.deepEqual({'equals': 10}, JSON.parse(res.payload))
        done()
    )###

  ###it 'add - should error if a string is passed', (done) ->
    server.inject({method: 'PUT', url: '/sum/add/100/1'}, (res) ->
        console.log "json:" +JSON.stringify(res)
        assert.deepEqual({
          'statusCode': 400
          'error': 'Bad Request'
          'message': 'the value of b must be a number'
          'validation': {
            'source': 'path'
            'keys': [
              'b'
            ]
          }
        }, JSON.parse(res.payload))
        done()
    )###