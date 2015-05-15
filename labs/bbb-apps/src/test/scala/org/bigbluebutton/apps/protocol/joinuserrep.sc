package org.bigbluebutton.apps.protocol

import spray.json._
import spray.json.DefaultJsonProtocol
import org.bigbluebutton.apps.models.UsersApp.JoinedUser
import org.bigbluebutton.apps.models.UsersApp.User
import org.bigbluebutton.apps.models.Role
import org.bigbluebutton.apps.models.UsersApp.{WebIdentity, CallerId, VoiceIdentity}
import org.bigbluebutton.apps.protocol.UserMessages.{JoinUserReply, JoinUserResponse}

object joinuserrep {

  import UserMessagesProtocol._
  import HeaderAndPayloadJsonSupport._
  import DefaultJsonProtocol._

  val replyHeader = ReplyHeader("replyChannel",  "abc123")
                                                  //> replyHeader  : org.bigbluebutton.apps.protocol.ReplyHeader = ReplyHeader(rep
                                                  //| lyChannel,abc123)
  val headerMeeting = HeaderMeeting("English 101", "english_101", Some("english_101-12345"))
                                                  //> headerMeeting  : org.bigbluebutton.apps.protocol.HeaderMeeting = HeaderMeeti
                                                  //| ng(English 101,english_101,Some(english_101-12345))
  val headerEvent =  HeaderEvent("CreateMeetingRequest", 123456, "web-api", Some(replyHeader))
                                                  //> headerEvent  : org.bigbluebutton.apps.protocol.HeaderEvent = HeaderEvent(Cre
                                                  //| ateMeetingRequest,123456,web-api,Some(ReplyHeader(replyChannel,abc123)))
  val header = Header(headerEvent,  headerMeeting)//> header  : org.bigbluebutton.apps.protocol.Header = Header(HeaderEvent(Create
                                                  //| MeetingRequest,123456,web-api,Some(ReplyHeader(replyChannel,abc123))),Header
                                                  //| Meeting(English 101,english_101,Some(english_101-12345)))
  header.toJson                                   //> res0: spray.json.JsValue = {"event":{"name":"CreateMeetingRequest","timestam
                                                  //| p":123456,"source":"web-api","reply":{"to":"replyChannel","correlationId":"a
                                                  //| bc123"}},"meeting":{"name":"English 101","externalId":"english_101","session
                                                  //| Id":"english_101-12345"}}
  
  
            
  val user = User("user1", "Guga", Role.MODERATOR, 85115, "Welcome to English 101",
                  "http://www.example.com", "http://www.example.com/avatar.png")
                                                  //> user  : org.bigbluebutton.apps.models.UsersApp.User = User(user1,Guga,MODER
                                                  //| ATOR,85115,Welcome to English 101,http://www.example.com,http://www.example
                                                  //| .com/avatar.png)
  
  val webId = WebIdentity("RichWeb")              //> webId  : org.bigbluebutton.apps.models.UsersApp.WebIdentity = WebIdentity(R
                                                  //| ichWeb)
  val callerId = CallerId("Richard", "6135207610")//> callerId  : org.bigbluebutton.apps.models.UsersApp.CallerId = CallerId(Rich
                                                  //| ard,6135207610)
  val voiceId = VoiceIdentity("Richard", callerId)//> voiceId  : org.bigbluebutton.apps.models.UsersApp.VoiceIdentity = VoiceIden
                                                  //| tity(Richard,CallerId(Richard,6135207610))
                  
//  val juser = JoinedUser("user1", "usertoken", user, false, None, None)
//  juser.toJson
//  val jurPayload = JoinUserReplyPayload(false, "Successfully joined user.", None)
  
//  val jur = JoinUserReply(header, jurPayload)
//  jur.toJson
                                                  
  val juser1 = JoinedUser("user1", "usertoken", user, false, Some(webId), Some(voiceId))
                                                  //> juser1  : org.bigbluebutton.apps.models.UsersApp.JoinedUser = JoinedUser(us
                                                  //| er1,usertoken,User(user1,Guga,MODERATOR,85115,Welcome to English 101,http:/
                                                  //| /www.example.com,http://www.example.com/avatar.png),false,Some(WebIdentity(
                                                  //| RichWeb)),Some(VoiceIdentity(Richard,CallerId(Richard,6135207610))))
  
  juser1.toJson                                   //> res1: spray.json.JsValue = {"id":"user1","token":"usertoken","user":{"exter
                                                  //| nalId":"user1","name":"Guga","role":"MODERATOR","pin":85115,"welcomeMessage
                                                  //| ":"Welcome to English 101","logoutUrl":"http://www.example.com","avatarUrl"
                                                  //| :"http://www.example.com/avatar.png"},"isPresenter":false,"webIdent":{"name
                                                  //| ":"RichWeb"},"voiceIdent":{"name":"Richard","callerId":{"name":"Richard","n
                                                  //| umber":"6135207610"}}}
  
//  val jur1Payload = JoinUserReplyPayload( true, "Successfully joined user.", Some(juser1))
//  val jur1 = JoinUserReply(header, jur1Payload)
//  jur1.toJson
  

        val statusCode = StatusCode(StatusCodes.NOT_FOUND.id,
                                    StatusCodes.NOT_FOUND.toString())
                                                  //> statusCode  : org.bigbluebutton.apps.protocol.StatusCode = StatusCode(404,N
                                                  //| ot Found)
        val errorCode = ErrorCode(ErrorCodes.INVALID_TOKEN.id,
                                  ErrorCodes.INVALID_TOKEN.toString())
                                                  //> errorCode  : org.bigbluebutton.apps.protocol.ErrorCode = ErrorCode(1,Invali
                                                  //| d or expired token)
        val response = Response(status = statusCode,
                        errors = Some(Seq(errorCode)))
                                                  //> response  : org.bigbluebutton.apps.protocol.Response = Response(StatusCode(
                                                  //| 404,Not Found),Some(List(ErrorCode(1,Invalid or expired token))))
  
  val jur2 = JoinUserResponse(response, "mytoken", Some(juser1))
                                                  //> jur2  : org.bigbluebutton.apps.protocol.UserMessages.JoinUserResponse = Joi
                                                  //| nUserResponse(Response(StatusCode(404,Not Found),Some(List(ErrorCode(1,Inva
                                                  //| lid or expired token)))),mytoken,Some(JoinedUser(user1,usertoken,User(user1
                                                  //| ,Guga,MODERATOR,85115,Welcome to English 101,http://www.example.com,http://
                                                  //| www.example.com/avatar.png),false,Some(WebIdentity(RichWeb)),Some(VoiceIden
                                                  //| tity(Richard,CallerId(Richard,6135207610))))))
  
  val finalReply = JoinUserReply(header, jur2).toJson
                                                  //> finalReply  : spray.json.JsValue = {"header":{"event":{"name":"CreateMeetin
                                                  //| gRequest","timestamp":123456,"source":"web-api","reply":{"to":"replyChannel
                                                  //| ","correlationId":"abc123"}},"meeting":{"name":"English 101","externalId":"
                                                  //| english_101","sessionId":"english_101-12345"}},"payload":{"response":{"stat
                                                  //| us":{"code":404,"message":"Not Found"},"errors":[{"code":1,"message":"Inval
                                                  //| id or expired token"}]},"token":"mytoken","joinedUser":{"id":"user1","token
                                                  //| ":"usertoken","user":{"externalId":"user1","name":"Guga","role":"MODERATOR"
                                                  //| ,"pin":85115,"welcomeMessage":"Welcome to English 101","logoutUrl":"http://
                                                  //| www.example.com","avatarUrl":"http://www.example.com/avatar.png"},"isPresen
                                                  //| ter":false,"webIdent":{"name":"RichWeb"},"voiceIdent":{"name":"Richard","ca
                                                  //| llerId":{"name":"Richard","number":"6135207610"}}}}}
  val failure = JsString(
    """Malformed message: [{"meeting1":{"name":"English 101","externalId":"english_101","record":true,"welcomeMessage":"Welcome to English 101","logoutUrl":"http://www.bigbluebutton.org","avatarUrl":"http://www.gravatar.com/bigbluebutton","users":{"max":20,"hardLimit":false},"duration":{"length":120,"allowExtend":false,"warnBefore":30},"voiceConf":{"pin":123456,"number":85115},"phoneNumbers":[{"number":"613-520-7600","description":"Ottawa"},{"number":"1-888-555-7890","description":"NA Toll-Free"}],"metadata":{"customerId":"acme-customer","customerName":"ACME"}}}]""")
                                                  //> failure  : spray.json.JsString = "Malformed message: [{\"meeting1\":{\"name
                                                  //| \":\"English 101\",\"externalId\":\"english_101\",\"record\":true,\"welcome
                                                  //| Message\":\"Welcome to English 101\",\"logoutUrl\":\"http://www.bigbluebutt
                                                  //| on.org\",\"avatarUrl\":\"http://www.gravatar.com/bigbluebutton\",\"users\":
                                                  //| {\"max\":20,\"hardLimit\":false},\"duration\":{\"length\":120,\"allowExtend
                                                  //| \":false,\"warnBefore\":30},\"voiceConf\":{\"pin\":123456,\"number\":85115}
                                                  //| ,\"phoneNumbers\":[{\"number\":\"613-520-7600\",\"description\":\"Ottawa\"}
                                                  //| ,{\"number\":\"1-888-555-7890\",\"description\":\"NA Toll-Free\"}],\"metada
                                                  //| ta\":{\"customerId\":\"acme-customer\",\"customerName\":\"ACME\"}}}]"
}