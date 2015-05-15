package org.bigbluebutton.endpoint

import org.bigbluebutton.apps.users.data._
import org.bigbluebutton.apps.protocol._
import org.bigbluebutton.apps.Role
import org.bigbluebutton.apps.users.messages.UserJoined
import org.bigbluebutton.apps.Session
import org.bigbluebutton.apps.MeetingIdAndName
import org.bigbluebutton.apps.users.messages.Result
import org.bigbluebutton.apps.users.messages.UserJoinResponse

case class ResultFormat(success: Boolean, message: String)

case class UserFormat(id: String, external_id: String, name: String, 
	            role: Role.RoleType, pin: Int, welcome_message: String,
	            logout_url: String, avatar_url: String)	      
	            
case class DurationFormat(length_in_minutes: Int, allow_extend: Boolean, max_minutes: Int)

case class VoiceConferenceFormat(pin: Int, number: Int)

case class PhoneNumberFormat(number: String, description: String)

case class MeetingDescriptorFormat(name: String, external_id: String, 
                record: Boolean, welcome_message: String, logout_url: String,
                avatar_url: String, max_users: Int, duration: DurationFormat, 
                voice_conference: VoiceConferenceFormat,
                phone_numbers: Seq[PhoneNumberFormat],
                metadata: Map[String, String])
                
case class CreateMeetingRequestPayloadFormat(meeting_descriptor: MeetingDescriptorFormat)

case class CreateMeetingResponsePayloadFormat(meeting: MeetingIdAndName,
                session: Option[String], result: ResultFormat,
                meeting_descriptor: MeetingDescriptorFormat)

case class MeetingCreatedEventPayloadFormat(meeting: MeetingIdAndName,
                session: String, meeting_descriptor: MeetingDescriptorFormat)

case class UserDescriptorFormat(external_id: String, name: String, 
                role: Role.RoleType, pin: Int,
                welcome_message: String,
                logout_url: String, avatar_url: String,
                metadata: Map[String, String])

case class RegisterUserRequestPayloadFormat(meeting: MeetingIdAndName,
                session: String, user_descriptor: UserDescriptorFormat)

case class RegisterUserResponsePayloadFormat(meeting: MeetingIdAndName,
                  session: String, user_token: Option[String],
                  result: ResultFormat, user_descriptor: UserDescriptorFormat)

case class UserRegisteredEventPayloadFormat(meeting: MeetingIdAndName,
                  session: String, user_descriptor: UserDescriptorFormat)

case class StatusFormat(hand_raised: Boolean, muted: Boolean,
                  locked: Boolean, talking: Boolean)
                  
case class CallerIdFormat(name: String, number: String)

case class MediaStreamFormat(media_type: String, uri: String, 
                  metadata: Map[String, String])

case class JoinedUserFormat(id: String, external_id: String, name: String,
                  role: Role.RoleType, pin: Int, welcome_message: String,
                  logout_url: String, avatar_url: String, is_presenter: Boolean,
                  status: StatusFormat, caller_id: CallerIdFormat,
                  media_streams: Seq[MediaStreamFormat])
                  
case class UserJoinedEventPayloadFormat(meeting: MeetingIdAndName, 
                  session: String, user: JoinedUserFormat)

case class UserJoinResponseMessage(header: Header, response: UserJoinResponse)

case class JoinUserResponse(response: Response, token: String, joinedUser: Option[JoinedUser])

case class JoinUserReply(header: Header, payload: JoinUserResponse)  
	            
case class UserJoinRequestPayloadFormat(meeting: MeetingIdAndName, 
                                  session: String, token: String)
                                  
case class UserLeavePayload(meeting: MeetingIdAndName, 
                            session: String, user: UserIdAndName)
                            
case class GetUsersRequestPayload(meeting: MeetingIdAndName, 
                                  session: String, requester: UserIdAndName) 
                                  
case class AssignPresenterPayload(meeting: MeetingIdAndName, 
                                  session: String, presenter: UserIdAndName,
                                  assigned_by: UserIdAndName)                                  