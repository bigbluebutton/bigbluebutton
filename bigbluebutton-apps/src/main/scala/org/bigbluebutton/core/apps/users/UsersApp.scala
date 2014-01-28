package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.Presenter
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.api.PresenterAssigned
import org.bigbluebutton.core.User
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.apps.users.messages.UserJoined
import org.bigbluebutton.core.apps.users.messages.UserLeft
import org.bigbluebutton.core.api.Role
import org.bigbluebutton.core.api.UserVO
import java.util.ArrayList
import org.bigbluebutton.core.apps.users.messages.GetUsersReply
import org.bigbluebutton.core.api.ChangeUserStatus
import org.bigbluebutton.core.apps.users.messages.UserStatusChange
import org.bigbluebutton.core.apps.voice.messages._
import org.bigbluebutton.core.apps.users.messages.MuteUserCommand
import org.bigbluebutton.core.apps.users.messages.EjectUserFromVoice

class UsersApp(meetingID: String, recorded: Boolean, voiceBridge: String, outGW: MessageOutGateway) {
  
  private val users = new UsersModel
  private val users2 = new Users
  
  var currentPresenter = new Presenter("system", "system", "system")
  private var meetingMuted = false
  
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      	  case userJoin: UserJoining => handleUserJoin(userJoin)
	      case userLeft: UserLeaving => handleUserLeft(userLeft)
	      case assignPresenter: AssignPresenter => handleAssignPresenter(assignPresenter)
	      case getUsers: GetUsers => handleGetUsers(getUsers)
	      case changeStatus: ChangeUserStatus => handleChangeUserStatus(changeStatus)
	      case muteMeetingRequest: MuteMeetingRequest => handleMuteMeetingRequest(muteMeetingRequest)
	      case isMeetingMutedRequest: IsMeetingMutedRequest => handleIsMeetingMutedRequest(isMeetingMutedRequest)
	      case muteUserRequest: MuteUserRequest => handleMuteUserRequest(muteUserRequest)
	      case lockUserRequest: LockUserRequest => handleLockUserRequest(lockUserRequest)
	      case ejectUserRequest: EjectUserRequest => handleEjectUserRequest(ejectUserRequest)
	      case voiceUserJoinedMessage: VoiceUserJoinedMessage => handleVoiceUserJoinedMessage(voiceUserJoinedMessage)
	      case voiceUserLeftMessage: VoiceUserLeftMessage => handleVoiceUserLeftMessage(voiceUserLeftMessage)
	      case voiceUserMutedMessage: VoiceUserMutedMessage => handleVoiceUserMutedMessage(voiceUserMutedMessage)
	      case voiceUserTalkingMessage: VoiceUserTalkingMessage => handleVoiceUserTalkingMessage(voiceUserTalkingMessage)
	      case voiceStartedRecordingMessage: VoiceStartedRecordingMessage => handleVoiceStartedRecordingMessage(voiceStartedRecordingMessage)
	      case _ => // do nothing
    }
  }
  
  def isUserModerator(userID: String):Boolean = {
    users.isModerator(userID)
  }
  
  def isUserPresenter(userID: String):Boolean = {
    users.isPresenter(userID)
  }
  
  def getCurrentPresenter():Presenter = {
    currentPresenter
  }
  
  def hasUser(userID: String):Boolean = {
    users.hasUser(userID)
  }
  
  def getUser(userID:String):UserVO = {
    users.getUser(userID)
  }
  
  private def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    meetingMuted = msg.mute
    
    users2.unlockedUsers map ({ u =>
      outGW.send(new MuteUserCommand(meetingID, recorded, msg.requesterID, u.voice.id, voiceBridge, msg.mute))
    })
  }
  
  private def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(meetingID, recorded, msg.requesterID, meetingMuted))
  }
  
  private def handleMuteUserRequest(msg: MuteUserRequest) {
    users2.get(msg.userID) match {
      case Some(u) => outGW.send(new MuteUserCommand(meetingID, recorded, msg.requesterID, u.voice.id, voiceBridge, msg.mute))
      case None => // do nothing
    }
  }
  
  private def handleLockUserRequest(msg: LockUserRequest) {
    users2.lockVoice(msg.userID, msg.lock)
  }
  
  private def handleEjectUserRequest(msg: EjectUserRequest) {
    users2.get(msg.userID) match {
      case Some(u) => outGW.send(new EjectUserFromVoice(meetingID, recorded, msg.requesterID, u.voice.id, voiceBridge))
      case None => // do nothing
    }
  }
  
  private def handleVoiceUserJoinedMessage(msg: VoiceUserJoinedMessage) {
 //   users2.joinedVoice(msg., voice)
  }
  
  private def handleVoiceUserLeftMessage(msg: VoiceUserLeftMessage) {
    
  }
  
  private def handleVoiceUserMutedMessage(msg: VoiceUserMutedMessage) {
    
  }
  
  private def handleVoiceUserTalkingMessage(msg: VoiceUserTalkingMessage) {
    
  }
  
  private def handleVoiceStartedRecordingMessage(msg: VoiceStartedRecordingMessage) {
    
  }
  
  private def handleChangeUserStatus(msg: ChangeUserStatus):Unit = {    
	if (users.hasUser(msg.userID)) {
		  outGW.send(new UserStatusChange(meetingID, recorded, msg.userID, msg.status, msg.value))
	}  
  }
  
  private def handleGetUsers(msg: GetUsers):Unit = {
	  outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, users.getUsers))
  }
  
  private def handleUserJoin(msg: UserJoining):Unit = {
  	println("UsersApp: init handleUserJoin")
	users.addUser(msg.userID, msg.extUserID, msg.name, msg.role)
					
	outGW.send(new UserJoined(meetingID, recorded, msg.userID, 
			msg.extUserID, msg.name, msg.role.toString(), false, false, false))
	
	// Become presenter if the only moderator		
	if (users.numModerators == 1) {
	  if (users.isModerator(msg.userID)) {
		assignNewPresenter(msg.userID, msg.name, msg.userID)
	  }	  
	}
	println("UsersApp: end handleUserJoin")	
  }
			
  private def handleUserLeft(msg: UserLeaving):Unit = {
	 if (users.hasUser(msg.userID)) {
	  users.removeUser(msg.userID)
	  outGW.send(new UserLeft(msg.meetingID, recorded, msg.userID))
	 }
   else{
    println("This user is not here:" + msg.userID)
   }
  }
	
  private def handleAssignPresenter(msg: AssignPresenter):Unit = {
	assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  } 
	
  private def assignNewPresenter(newPresenterID:String, newPresenterName: String, assignedBy: String) {
    if (users.hasUser(newPresenterID)) {
      if (users.hasPresenter) {
   	    val curPresenter = users.getCurrentPresenter
  	    users.unbecomePresenter(curPresenter.userID)  
  	    outGW.send(new UserStatusChange(meetingID, recorded, curPresenter.userID, "presenter", false:java.lang.Boolean))
      }

  	  val newPresenter = users.getUser(newPresenterID)
  	  users.becomePresenter(newPresenter.userID)    
  	  
  	  currentPresenter = new Presenter(newPresenterID, newPresenterName, assignedBy)
  	  
  	  outGW.send(new PresenterAssigned(meetingID, recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))

      outGW.send(new UserStatusChange(meetingID, recorded, newPresenterID, "presenter", true:java.lang.Boolean))
    }
  }
}