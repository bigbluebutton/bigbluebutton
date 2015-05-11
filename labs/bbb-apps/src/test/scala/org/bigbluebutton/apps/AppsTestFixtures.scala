package org.bigbluebutton.apps

import org.bigbluebutton.apps._
import org.bigbluebutton.apps.users.data._
import org.bigbluebutton.apps.protocol.Destination


trait AppsTestFixtures {
  
  val maxUsers =  20
  val duration = Duration(120, true, 160)
  val voiceConference = VoiceConference(85115, 1234)
  val phone1 =  PhoneNumber("613-555-7600", "Ottawa")
  val phone2 = PhoneNumber("1-888-555-7890", "NA Toll-Free")
  val metadata = Map("customerId" -> "acme-customer",
	                "customerName" -> "ACME")
	                
  val eng101MeetingId = "english_101"
  val eng101MeetingName = "English 101"
  val eng101MeetingIdAndName = MeetingIdAndName(eng101MeetingId, eng101MeetingName)
  val eng101SessionId = "english_101-1234"
  val eng101Session = Session(eng101SessionId, eng101MeetingIdAndName)  
  
  val eng101Desc = MeetingDescriptor("english_101", "English 101",  
                       true, "Welcome to English 101", 
                       "http://www.bigbluebutton.org", 
                       "http://www.gravatar.com/bigbluebutton",
                       maxUsers, duration, 
                       voiceConference, Seq(phone1, phone2), 
                       metadata)

  val juanUserId = "juan-user1"
  val juanExtUserId = "juan-ext-user1"
  val juanUser = RegisterUser(juanExtUserId, "Juan Tamad", 
	                Role.MODERATOR, 12345, "Welcome Juan",
	                "http://www.umaliska.don", "http://www.mukhamo.com/unggoy")                        
  val juanWebIdentity = WebIdentity(false)
  val juanCallerId = CallerId("Juan Tamad", "011-63-917-555-1234") 
  val juanVoiceMeta = Map("userid" -> "1", "conference_num" -> "85115")
  val juanVoiceIdentity = VoiceIdentity(juanCallerId, false, 
                         false, false, juanVoiceMeta)
  
  val juanUserToken = "juanToken"
  val joinedUserJuan = JoinedUser(juanUserId, juanUserToken, juanUser,
	                      true, juanWebIdentity, juanVoiceIdentity) 

  val asyongUserId = "asyong-user1"
  val asyongExtUserId = "asyong-ext-user1"
  val asyongUser = RegisterUser(asyongExtUserId, "Asyong Aksaya", 
	                Role.VIEWER, 12346, "Welcome Asyong",
	                "http://www.bilmoko.nyan", "http://www.mukhamo.com/pera") 	                      
  val asyongWebIdentity = WebIdentity(true)
  val asyongCallerId = CallerId("Asyong Aksaya", "011-63-917-555-1234") 
  val asyongVoiceMeta = Map("userid" -> "2", "conference_num" -> "85115")
  val asyongVoiceIdentity = VoiceIdentity(asyongCallerId, false, 
                         false, false, asyongVoiceMeta)
                         
  val joinedUserAsyong = JoinedUser("asyongid", "asyongToken", asyongUser,
	                      true, asyongWebIdentity, asyongVoiceIdentity)


}