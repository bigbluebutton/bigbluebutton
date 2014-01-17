package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.User
import java.util.ArrayList
import net.lag.logging.Logger
import org.bigbluebutton.core.MeetingActor

trait UsersApp {
  this : MeetingActor =>
  
  val log: Logger
  val outGW: MessageOutGateway
  
  private val users = new UsersModel
  private val users2 = new Users
  
  private var locked = false
  private var meetingMuted = false
  private var currentPresenter = new Presenter("system", "system", "system")
  
  def hasUser(userID: String):Boolean = {
    users.hasUser(userID)
  }
  
  def getUser(userID:String):Option[UserVO] = {
    users.getUser(userID)
  }
  
  def getCurrentPresenter:Presenter = {
    currentPresenter
  }
  
  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    meetingMuted = msg.mute
    
    users2.unlockedUsers map ({ u =>
      outGW.send(new MuteVoiceUser(meetingID, recorded, msg.requesterID, u.voice.id, msg.mute))
    })
  }
  
  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(meetingID, recorded, msg.requesterID, meetingMuted))
  }
  
  def handleMuteUserRequest(msg: MuteUserRequest) {
    users2.get(msg.userID) match {
      case Some(u) => outGW.send(new MuteVoiceUser(meetingID, recorded, msg.requesterID, u.voice.id, msg.mute))
      case None => // do nothing
    }
  }
  
  def handleLockUserRequest(msg: LockUserRequest) {
    users2.lockVoice(msg.userID, msg.lock)
  }
  
  def handleEjectUserRequest(msg: EjectUserRequest) {
    users2.get(msg.userID) match {
      case Some(u) => outGW.send(new EjectVoiceUser(meetingID, recorded, msg.requesterID, u.voice.id))
      case None => // do nothing
    }
  }
  

  
  def handleLockUser(msg: LockUser) {
    
  }
  
  def handleLockAllUsers(msg: LockAllUsers) {
    
  }
  
  def handleGetLockSettings(msg: GetLockSettings) {
    
  }
  
  def handleIsMeetingLocked(msg: IsMeetingLocked) {
    
  }
	      
  def handleSetLockSettings(msg: SetLockSettings) {
    if (lockSettings != msg.settings) {
      lockSettings = msg.settings
      outGW.send(new NewLockSettings(meetingID, lockSettings))
    }    
  }
  
  def handleInitLockSettings(msg: InitLockSettings) {
    if (lockSettings != msg.settings || locked != msg.locked) {
	    lockSettings = msg.settings   
	    locked = msg.locked	    
	    outGW.send(new LockSettingsInitialized(msg.meetingID, msg.locked, msg.settings))
    }
  }  
  
  def handleChangeUserStatus(msg: ChangeUserStatus):Unit = {    
	if (users.hasUser(msg.userID)) {
		  outGW.send(new UserStatusChange(meetingID, recorded, msg.userID, msg.status, msg.value))
	}  
  }
  
  def handleGetUsers(msg: GetUsers):Unit = {
	  outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, users.getUsers))
  }
  
  def handleUserJoin(msg: UserJoining):Unit = {
  	log.debug("UsersApp: init handleUserJoin")
  	
	val user = users.addUser(msg.userID, msg.extUserID, msg.name, msg.role)
					
	outGW.send(new UserJoined(meetingID, recorded, user))
	
	// Become presenter if the only moderator		
	if (users.numModerators == 1) {
	  if (msg.role == Role.MODERATOR) {
		assignNewPresenter(msg.userID, msg.name, msg.userID)
	  }	  
	}
  }
			
  def handleUserLeft(msg: UserLeaving):Unit = {
	 if (users.hasUser(msg.userID)) {
	  val user = users.removeUser(msg.userID)
	  user foreach (u => outGW.send(new UserLeft(msg.meetingID, recorded, u)))
	  
	 }
   else{
    log.warning("This user is not here:" + msg.userID)
   }
  }
	
  def handleAssignPresenter(msg: AssignPresenter):Unit = {
	assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  } 
	
  def assignNewPresenter(newPresenterID:String, newPresenterName: String, assignedBy: String) {
    if (users.hasUser(newPresenterID)) {

      users.getCurrentPresenter match {
        case Some(curPres) => {
  	      users.unbecomePresenter(curPres.userID)  
  	      outGW.send(new UserStatusChange(meetingID, recorded, curPres.userID, "presenter", false:java.lang.Boolean))        
        }
        case None => // do nothing
      }
      
  	  users.getUser(newPresenterID) match {
  	    case Some(newPres) => {
  	      users.becomePresenter(newPres.userID)      	  
  	      currentPresenter = new Presenter(newPresenterID, newPresenterName, assignedBy)
  	      outGW.send(new PresenterAssigned(meetingID, recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))
          outGW.send(new UserStatusChange(meetingID, recorded, newPresenterID, "presenter", true:java.lang.Boolean))  	      
  	    }
  	    case None => // do nothing
  	  }

    }
  }
}