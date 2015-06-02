package org.bigbluebutton.apps.users.data

import spray.json._
import spray.json.DefaultJsonProtocol._
import org.bigbluebutton.apps.protocol._

object usersmsgWS1 {

	object Role extends Enumeration {
	  type RoleType = Value
	  val MODERATOR = Value("MODERATOR")
	  val VIEWER = Value("VIEWER")
	}
	case class Session(id: String, meetingId: String, meetingName: String)
	case class WebIdentity(handRaised: Boolean = false)
	
	case class CallerId(name: String, number: String)
	case class VoiceIdentity(callerId: CallerId, muted: Boolean = false,
	                         locked: Boolean = false, talking: Boolean = false,
	                         metadata: Map[String, String])
	                         
	case class UserIdAndName(id: String, name: String)
	  
	object SystemUser extends UserIdAndName(id = "system", name = "System")
	    
	case class JoinedUser(id: String, token: String, user: User,
	                        isPresenter: Boolean = false,
	                        webIdentity: WebIdentity,
	                        voiceIdentity: VoiceIdentity)
	    
	case class RegisteredUser(token: String, user: User)
	    
	case class User(externalId: String, name: String,
	              role: Role.RoleType, pin: Int, welcomeMessage: String,
	              logoutUrl: String, avatarUrl: String)
	
	case class Presenter(presenter: UserIdAndName, assignedBy: UserIdAndName)
  case class UserJoined(session: Session, token: String, joinedUser: JoinedUser)

  val eng101Session = Session("english_101-1234", "english_101", "English 101")
                                                  //> eng101Session  : org.bigbluebutton.apps.users.data.usersmsgWS1.Session = Se
                                                  //| ssion(english_101-1234,english_101,English 101)
  val userJuan = User("userjuan", "Juan Tamad",
                  Role.MODERATOR, 12345,
                  "Welcome Juan",
                  "http://www.umaliska.don",
                  "http://www.mukhamo.com/unggoy")//> userJuan  : org.bigbluebutton.apps.users.data.usersmsgWS1.User = User(userj
                                                  //| uan,Juan Tamad,MODERATOR,12345,Welcome Juan,http://www.umaliska.don,http://
                                                  //| www.mukhamo.com/unggoy)
  val juanWebIdentity = WebIdentity(false)        //> juanWebIdentity  : org.bigbluebutton.apps.users.data.usersmsgWS1.WebIdentit
                                                  //| y = WebIdentity(false)
  val juanCallerId = CallerId("Juan Tamad", "011-63-917-555-1234")
                                                  //> juanCallerId  : org.bigbluebutton.apps.users.data.usersmsgWS1.CallerId = Ca
                                                  //| llerId(Juan Tamad,011-63-917-555-1234)
  val juanVoiceMeta = Map("userid" -> "1", "conference_num" -> "85115")
                                                  //> juanVoiceMeta  : scala.collection.immutable.Map[String,String] = Map(userid
                                                  //|  -> 1, conference_num -> 85115)
  val juanVoiceIdentity = VoiceIdentity(juanCallerId, false,
                         false, false, juanVoiceMeta)
                                                  //> juanVoiceIdentity  : org.bigbluebutton.apps.users.data.usersmsgWS1.VoiceIde
                                                  //| ntity = VoiceIdentity(CallerId(Juan Tamad,011-63-917-555-1234),false,false,
                                                  //| false,Map(userid -> 1, conference_num -> 85115))
                         
  val joinedUserJuan = JoinedUser("juanid", "juanToken", userJuan,
                        true, juanWebIdentity, juanVoiceIdentity)
                                                  //> joinedUserJuan  : org.bigbluebutton.apps.users.data.usersmsgWS1.JoinedUser 
                                                  //| = JoinedUser(juanid,juanToken,User(userjuan,Juan Tamad,MODERATOR,12345,Welc
                                                  //| ome Juan,http://www.umaliska.don,http://www.mukhamo.com/unggoy),true,WebIde
                                                  //| ntity(false),VoiceIdentity(CallerId(Juan Tamad,011-63-917-555-1234),false,f
                                                  //| alse,false,Map(userid -> 1, conference_num -> 85115)))
  
object UserMessagesProtocol1 extends DefaultJsonProtocol {
  implicit object RoleJsonFormat extends JsonFormat[Role.RoleType] {
  def write(obj: Role.RoleType): JsValue = JsString(obj.toString)
  
  def read(json: JsValue): Role.RoleType = json match {
      case JsString(str) => Role.withName(str)
      case _ => throw new DeserializationException("Enum string expected")
  }
  }

  implicit val webIdentityFormat = jsonFormat1(WebIdentity)
  implicit val callerIdFormat = jsonFormat2(CallerId)
  implicit val voiceIdentityFormat = jsonFormat5(VoiceIdentity)
    
  implicit val userFormat = jsonFormat7(User)
  implicit val joinedUserFormat = jsonFormat6(JoinedUser)
  
  implicit val userIdAndNameFormat = jsonFormat2(UserIdAndName)
  implicit val sessionFormat = jsonFormat3(Session)
  implicit val userJoinedFormat = jsonFormat3(UserJoined)
}
  
  import UserMessagesProtocol1._
  val userJoinedMsg = UserJoined(eng101Session, "juanToken", joinedUserJuan).toJson
                                                  //> userJoinedMsg  : spray.json.JsValue = {"session":{"id":"english_101-1234","
                                                  //| meetingId":"english_101","meetingName":"English 101"},"token":"juanToken","
                                                  //| joinedUser":{"id":"juanid","token":"juanToken","user":{"externalId":"userju
                                                  //| an","name":"Juan Tamad","role":"MODERATOR","pin":12345,"welcomeMessage":"We
                                                  //| lcome Juan","logoutUrl":"http://www.umaliska.don","avatarUrl":"http://www.m
                                                  //| ukhamo.com/unggoy"},"isPresenter":true,"webIdentity":{"handRaised":false},"
                                                  //| voiceIdentity":{"callerId":{"name":"Juan Tamad","number":"011-63-917-555-12
                                                  //| 34"},"muted":false,"locked":false,"talking":false,"metadata":{"userid":"1",
                                                  //| "conference_num":"85115"}}}}
  val ujmJson = userJoinedMsg.toJson              //> ujmJson  : spray.json.JsValue = {"session":{"id":"english_101-1234","meetin
                                                  //| gId":"english_101","meetingName":"English 101"},"token":"juanToken","joined
                                                  //| User":{"id":"juanid","token":"juanToken","user":{"externalId":"userjuan","n
                                                  //| ame":"Juan Tamad","role":"MODERATOR","pin":12345,"welcomeMessage":"Welcome 
                                                  //| Juan","logoutUrl":"http://www.umaliska.don","avatarUrl":"http://www.mukhamo
                                                  //| .com/unggoy"},"isPresenter":true,"webIdentity":{"handRaised":false},"voiceI
                                                  //| dentity":{"callerId":{"name":"Juan Tamad","number":"011-63-917-555-1234"},"
                                                  //| muted":false,"locked":false,"talking":false,"metadata":{"userid":"1","confe
                                                  //| rence_num":"85115"}}}}
}