package org.bigbluebutton.endpoint

import org.bigbluebutton.apps.users.data._
import org.bigbluebutton.apps.AppsTestFixtures
import org.bigbluebutton.apps.protocol.Destination
import org.bigbluebutton.apps.protocol.Header
import org.bigbluebutton.apps.users.messages.UserJoinResponse
import org.bigbluebutton.apps.users.messages.Result
import org.bigbluebutton.apps.protocol.ReplyDestination

trait UsersMessageTestFixtures extends AppsTestFixtures {
  val userJoinSuccessResponse = UserJoinResponse(eng101Session, Result(true, "Success"),
                              Some(joinedUserJuan))
  val userJoinFailResponse = UserJoinResponse(eng101Session, Result(false, "Success"), None)
                              
  val userJoinRequestPayload = UserJoinRequestPayloadFormat(eng101MeetingIdAndName, eng101SessionId, juanUserToken)
                                  
  val destination = Destination("apps_channel", None)
  val replyTo = ReplyDestination("apps_channel", "abc-corelid")
  val userJoinReqHeader = Header(destination, InMsgNameConst.UserJoinRequest, 
                  "2013-12-23T08:50Z", "web-api",
                  Some(replyTo))
  val userJoinRequestMessage = UserJoinRequestFormat(userJoinReqHeader, userJoinRequestPayload)

  val userJoinRespHeader = Header(Destination(replyTo.to,
                           Some(replyTo.correlation_id)), 
                           InMsgNameConst.UserJoinResponse,
                           "2013-12-23T08:50Z", "web-api", None)
  val userJoinResponseMessage = UserJoinResponseMessage(userJoinRespHeader, userJoinSuccessResponse)

  val userFormat = UserFormat(juanUserId, juanUser.externalId, juanUser.name, 
	            juanUser.role, juanUser.pin, juanUser.welcomeMessage,
	            juanUser.logoutUrl, juanUser.avatarUrl)
  val userJoinResponseJsonPayload = UserJoinResponseFormatPayload(
	                      eng101MeetingIdAndName, 
	                      eng101SessionId,
	                      ResultFormat(true, "Success"), Some(userFormat))
	                      
}