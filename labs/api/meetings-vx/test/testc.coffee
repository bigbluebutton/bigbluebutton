assert = require("assert")
oauth = require("oauth-signature")

describe "Array", ->

  describe '#indexOf()', ->
    
    it 'should return -1 when the value is not present', ->
      assert.equal(-1, [1,2,3].indexOf(5))

    it "should calc checksum", ->
      httpMethod = 'GET'
      url = 'http://photos.example.net/photos'
      parameters = {
        oauth_consumer_key : 'dpf43f3p2l4k3l03',
        oauth_token : 'nnch734d00sl2jdk',
        oauth_nonce : 'kllo9940pd9333jh',
        oauth_timestamp : '1191242096',
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0',
        file : 'vacation.jpg',
        size : 'original'
      }
      consumerSecret = 'kd94hf93k423kf44'
      tokenSecret = 'pfkkdhi9sl3r4s00'
      encodedSignature = oauth.generate(httpMethod, url, parameters, consumerSecret, tokenSecret);
      console.log(encodedSignature)
      assert.equal(encodedSignature, "tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D")

  

