package org.bigbluebutton.endpoint.redis

import spray.json._
import spray.json.DefaultJsonProtocol._
import org.bigbluebutton.apps.users.protocol.UserMessagesProtocol._
import org.bigbluebutton.apps.users.protocol.UserJoinResponseJsonMessage
import spray.json.lenses.JsonLenses._
import spray.json.lenses._

object JsonLens extends UsersMessageTestFixtures
             with UsersMessageJsonTestFixtures {

val userJoinResponseMessage2 = UserJoinResponseJsonMessage(userJoinRespHeader, userJoinResponseJsonPayload).toJson
                                                  //> userJoinResponseMessage2  : spray.json.JsValue = {"header":{"destination":{"
                                                  //| to":"apps_channel","correlation_id":"abc-corelid"},"name":"user_join_respons
                                                  //| e","timestamp":"2013-12-23T08:50Z","source":"web-api"},"payload":{"meeting":
                                                  //| {"id":"english_101","name":"English 101"},"session":"english_101-1234","resu
                                                  //| lt":{"success":true,"message":"Success"},"user":{"id":"juan-user1","external
                                                  //| _id":"juan-ext-user1","name":"Juan Tamad","role":"MODERATOR","pin":12345,"we
                                                  //| lcome_message":"Welcome Juan","logout_url":"http://www.umaliska.don","avatar
                                                  //| _url":"http://www.mukhamo.com/unggoy"}}}
val userJoinResponseMessageJson = JsonParser(user_join_response_Message)
                                                  //> userJoinResponseMessageJson  : spray.json.JsValue = {"header":{"destination"
                                                  //| :{"to":"apps_channel","correlation_id":"abc-corelid"},"name":"user_join_resp
                                                  //| onse","timestamp":"2013-12-23T08:50Z","source":"web-api"},"payload":{"meetin
                                                  //| g":{"id":"english_101","name":"English 101"},"session":"english_101-1234","r
                                                  //| esult":{"success":true,"message":"Success"},"user":{"id":"juan-user1","exter
                                                  //| nal_id":"juan-ext-user1","name":"Juan Tamad","role":"MODERATOR","pin":12345,
                                                  //| "welcome_message":"Welcome Juan","logout_url":"http://www.umaliska.don","ava
                                                  //| tar_url":"http://www.mukhamo.com/unggoy"}}}
val foo = userJoinResponseMessageJson.convertTo[UserJoinResponseJsonMessage]
                                                  //> foo  : org.bigbluebutton.apps.users.protocol.UserJoinResponseJsonMessage = U
                                                  //| serJoinResponseJsonMessage(Header(Destination(apps_channel,Some(abc-corelid)
                                                  //| ),user_join_response,2013-12-23T08:50Z,web-api,None),UserJoinResponseJsonPay
                                                  //| load(MeetingIdAndName(english_101,English 101),english_101-1234,Result(true,
                                                  //| Success),Some(UserFormat(juan-user1,juan-ext-user1,Juan Tamad,MODERATOR,1234
                                                  //| 5,Welcome Juan,http://www.umaliska.don,http://www.mukhamo.com/unggoy))))
val jsonFoo = foo.toJson                          //> jsonFoo  : spray.json.JsValue = {"header":{"destination":{"to":"apps_channel
                                                  //| ","correlation_id":"abc-corelid"},"name":"user_join_response","timestamp":"2
                                                  //| 013-12-23T08:50Z","source":"web-api"},"payload":{"meeting":{"id":"english_10
                                                  //| 1","name":"English 101"},"session":"english_101-1234","result":{"success":tr
                                                  //| ue,"message":"Success"},"user":{"id":"juan-user1","external_id":"juan-ext-us
                                                  //| er1","name":"Juan Tamad","role":"MODERATOR","pin":12345,"welcome_message":"W
                                                  //| elcome Juan","logout_url":"http://www.umaliska.don","avatar_url":"http://www
                                                  //| .mukhamo.com/unggoy"}}}

import spray.json.DefaultJsonProtocol._
val userIdLens = ("payload" / "user" / "id")      //> userIdLens  : spray.json.lenses.Lens[spray.json.lenses.Id] = spray.json.lens
                                                  //| es.JsonLenses$$anon$1@25c22d44
val userId = jsonFoo.extract[String](userIdLens)  //> userId  : String = juan-user1

 val json = """
{ "store": {
    "book": [
      { "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      { "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99,
        "isbn": "0-553-21311-3"
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}""".asJson                                       //> json  : spray.json.JsValue = {"store":{"book":[{"category":"reference","aut
                                                  //| hor":"Nigel Rees","title":"Sayings of the Century","price":8.95},{"category
                                                  //| ":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99
                                                  //| ,"isbn":"0-553-21311-3"}],"bicycle":{"color":"red","price":19.95}}}


val allAuthors = 'store / 'book / * / 'author     //> allAuthors  : spray.json.lenses.Lens[Seq] = spray.json.lenses.JsonLenses$$a
                                                  //| non$1@2f290d08
val authorNames = json.extract[String](allAuthors)//> authorNames  : Seq[String] = List(Nigel Rees, Evelyn Waugh)
}