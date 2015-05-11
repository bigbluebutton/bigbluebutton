package org.bigbluebutton.apps.users.data

import org.bigbluebutton.apps.Role

case class WebIdentity(handRaised: Boolean = false)

case class CallerId(name: String, number: String)                    
case class VoiceIdentity(callerId: CallerId, muted: Boolean = false, 
                         locked: Boolean = false, talking: Boolean = false,
                         metadata: Map[String, String])
                         
case class UserIdAndName(id: String, name: String)
	
object SystemUser extends UserIdAndName(id = "system", name = "System")
	  
case class JoinedUser(id: String, token: String, user: RegisterUser,
	                      isPresenter: Boolean = false,
	                      webIdentity: WebIdentity, 
	                      voiceIdentity: VoiceIdentity)
		
case class RegisteredUser(token: String, user: RegisterUser)
	  
case class RegisterUser(externalId: String, name: String, 
	            role: Role.RoleType, pin: Int, welcomeMessage: String,
	            logoutUrl: String, avatarUrl: String)  

case class Presenter(presenter: UserIdAndName, assignedBy: UserIdAndName)
