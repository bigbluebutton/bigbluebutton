package org.bigbluebutton.endpoint

import spray.json.{DefaultJsonProtocol, JsValue, JsString, DeserializationException, JsonFormat}
import spray.json.DefaultJsonProtocol._
import org.bigbluebutton.apps.users.data._
import org.bigbluebutton.apps.protocol._
import org.bigbluebutton.apps.Role
import org.bigbluebutton.apps.MeetingIdAndName
import org.bigbluebutton.apps.protocol.HeaderAndPayloadJsonSupport.headerFormat


/** JSON Conversion Protocol **/	            
object UserMessagesProtocol extends DefaultJsonProtocol {
  import HeaderAndPayloadJsonSupport._

  implicit object RoleJsonFormat extends JsonFormat[Role.RoleType] {
	def write(obj: Role.RoleType): JsValue = JsString(obj.toString)
	
	def read(json: JsValue): Role.RoleType = json match {
	    case JsString(str) => Role.withName(str)
	    case _ => throw new DeserializationException("Enum string expected")
	}
  }

/*  
  implicit val webIdentityFormat = 
                  jsonFormat1(WebIdentity)
  implicit val callerIdFormat = 
                  jsonFormat2(CallerId)
  implicit val voiceIdentityFormat = 
                  jsonFormat5(VoiceIdentity)	  
*/  
  implicit val userFormat = 
                  jsonFormat8(UserFormat)
  implicit val userIdAndNameFormat = 
                  jsonFormat2(UserIdAndName)
  implicit val meetingIdAndNameFormat = 
                  jsonFormat2(MeetingIdAndName)
  implicit val userJoinRequestPayloadFormat = 
                  jsonFormat3(UserJoinRequestPayloadFormat)
  implicit val userJoinRequestMessageFormat = 
                  jsonFormat2(UserJoinRequestFormat)
  implicit val resultFormat = 
                  jsonFormat2(ResultFormat)
  implicit val userJoinResponsePayloadFormat = 
                  jsonFormat4(UserJoinResponseFormatPayload)
  implicit val userJoinResponseJsonMessageFormat = 
                  jsonFormat2(UserJoinResponseFormat)  
  implicit val userLeavePayloadFormat = 
                  jsonFormat3(UserLeavePayload)
  implicit val userLeaveMessageFormat = 
                  jsonFormat2(UserLeaveMessage)
  implicit val getUsersRequestPayloadFormat = 
                  jsonFormat3(GetUsersRequestPayload)
  implicit val getUsersRequestMessageFormat = 
                  jsonFormat2(GetUsersRequestMessage) 
  implicit val assignPresenterPayloadFormat = 
                  jsonFormat4(AssignPresenterPayload)
  implicit val assignPresenterMessageFormat = 
                  jsonFormat2(AssignPresenterMessage)
  implicit val durationFormat = 
                  jsonFormat3(DurationFormat)
  implicit val voiceConferenceFormat = 
                  jsonFormat2(VoiceConferenceFormat)
  implicit val phoneNumberFormat = 
                  jsonFormat2(PhoneNumberFormat)
  implicit val meetingDescriptorFormat = 
                  jsonFormat11(MeetingDescriptorFormat)
  implicit val createMeetingRequestPayloadFormat = 
                  jsonFormat1(CreateMeetingRequestPayloadFormat)
  implicit val createMeetingRequestMessageFormat = 
                  jsonFormat2(CreateMeetingRequestFormat)   
  implicit val createMeetingResponsePayloadFormat = 
                  jsonFormat4(CreateMeetingResponsePayloadFormat)
  implicit val createMeetingResponseFormat = 
                  jsonFormat2(CreateMeetingResponseFormat)
  implicit val meetingCreatedEventPayloadFormat = 
                  jsonFormat3(MeetingCreatedEventPayloadFormat)
  implicit val meetingCreatedEventFormat = 
                  jsonFormat2(MeetingCreatedEventFormat)
  implicit val userDescriptorFormat = 
                  jsonFormat8(UserDescriptorFormat)
  implicit val registerUserRequestPayloadFormat =
                  jsonFormat3(RegisterUserRequestPayloadFormat)
  implicit val registerUserRequestFormat =
                  jsonFormat2(RegisterUserRequestFormat)
  implicit val registerUserResponsePayloadFormat = 
                  jsonFormat5(RegisterUserResponsePayloadFormat)
  implicit val registerUserResponseFormat = 
                  jsonFormat2(RegisterUserResponseFormat)
  implicit val userRegisteredEventPayloadFormat =
                  jsonFormat3(UserRegisteredEventPayloadFormat)
  implicit val userRegisteredEventFormat =
                  jsonFormat2(UserRegisteredEventFormat)
  implicit val statusFormat = 
                  jsonFormat4(StatusFormat)
  implicit val callerIdFormat = 
                  jsonFormat2(CallerIdFormat)
  implicit val mediaStreamFormat = 
                  jsonFormat3(MediaStreamFormat)
  implicit val joinedUserFormat = 
                  jsonFormat12(JoinedUserFormat)
  implicit val userJoinedEventPayloadFormat = 
                  jsonFormat3(UserJoinedEventPayloadFormat)
  implicit val userJoinedEventFormat = jsonFormat2(UserJoinedEventFormat)

}

