package org.bigbluebutton.core

import org.bigbluebutton.core.api.ChangeUserStatus
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.api.SetLockSettings
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.api.Role._
import org.bigbluebutton.core.api.IBigBlueButtonInGW
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.api.ClearPresentation
import org.bigbluebutton.core.api.SendCursorUpdate
import org.bigbluebutton.core.api.PresentationConversionUpdate
import org.bigbluebutton.core.api.RemovePresentation
import org.bigbluebutton.core.api.GetPresentationInfo
import org.bigbluebutton.core.api.ResizeAndMoveSlide
import org.bigbluebutton.core.api.GotoSlide
import org.bigbluebutton.core.api.SharePresentation
import org.bigbluebutton.core.api.GetSlideInfo
import org.bigbluebutton.conference.service.presentation.PreuploadedPresentationsUtil
import org.bigbluebutton.core.api.DestroyMeeting
import org.bigbluebutton.core.api.KeepAliveMessage
import org.bigbluebutton.core.api.PreuploadedPresentations
import scala.collection.JavaConversions._
import org.bigbluebutton.core.apps.poll.PollInGateway
import org.bigbluebutton.core.api.SetRecordingStatus
import org.bigbluebutton.core.api.GetRecordingStatus
import org.bigbluebutton.core.apps.users.LockSettings
import org.bigbluebutton.core.api.InitLockSettings
import java.util.ArrayList
import org.bigbluebutton.core.api.GetLockSettings
import org.bigbluebutton.core.api.IsMeetingLocked
import org.bigbluebutton.core.api.LockAllUsers
import org.bigbluebutton.core.api.LockUser
import scala.collection.mutable.ArrayBuffer


class BigBlueButtonInGW(bbbGW: BigBlueButtonGateway) extends IBigBlueButtonInGW {

  val presUtil = new PreuploadedPresentationsUtil()
    
  // Meeting
  def createMeeting2(meetingID: String, record: Boolean, voiceBridge: String) {
	bbbGW.accept(new CreateMeeting(meetingID, record, voiceBridge))
		
	val pres = presUtil.getPreuploadedPresentations(meetingID);
	if (!pres.isEmpty()) {
	  bbbGW.accept(new PreuploadedPresentations(meetingID, pres.toArray()))
	}
  }
  
  def destroyMeeting(meetingID: String) {
    bbbGW.accept(new DestroyMeeting(meetingID))
  }
  
  def isAliveAudit(aliveId:String) {
    bbbGW.acceptKeepAlive(new KeepAliveMessage(aliveId)); 
  }

  def statusMeetingAudit(meetingID: String) {
    
  }
	
  def endMeeting(meetingID: String) {
    
  }
	
  def endAllMeetings() {
    
  }
  
  def sendLockSettings(meetingID: String, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convaert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues (v => v.booleanValue() /* convert java Boolean to Scala Boolean */).toMap  
    val allowModeratorLocking = s.getOrElse("allowModeratorLocking", true)
    val disableCam = s.getOrElse("disableCam", true) 
    val disableMic = s.getOrElse("disableMic", true)
    val disablePrivateChat = s.getOrElse("disablePrivateChat", true)
    val disablePublicChat = s.getOrElse("disablePublicChat", true)
    val ls = new LockSettings(allowModeratorLocking, disableCam, disableMic, 
                              disablePrivateChat, disablePublicChat)
    bbbGW.accept(new SetLockSettings(meetingID, ls))
  }
  
  def initLockSettings(meetingID: String, locked: Boolean, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convaert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues (v => v.booleanValue() /* convert java Boolean to Scala Boolean */).toMap  
    val allowModeratorLocking = s.getOrElse("allowModeratorLocking", true)
    val disableCam = s.getOrElse("disableCam", true) 
    val disableMic = s.getOrElse("disableMic", true)
    val disablePrivateChat = s.getOrElse("disablePrivateChat", true)
    val disablePublicChat = s.getOrElse("disablePublicChat", true)
    val ls = new LockSettings(allowModeratorLocking, disableCam, disableMic, 
                              disablePrivateChat, disablePublicChat)
    bbbGW.accept(new InitLockSettings(meetingID, locked, ls))
  }
  
  def getLockSettings(meetingId: String, userId: String) {
    bbbGW.accept(new GetLockSettings(meetingId, userId))
  }
  
  def isMeetingLocked(meetingId: String, userId: String) {
    bbbGW.accept(new IsMeetingLocked(meetingId, userId))
  }
  
  def lockAllUsers(meetingId: String, lock: Boolean, dontLockTheseUsers: ArrayList[String]) {
    bbbGW.accept(new LockAllUsers(meetingId, lock, dontLockTheseUsers.toSeq))
  }
  
  def lockUser(meetingId: String, lock: Boolean, userId: String) {
    bbbGW.accept(new LockUser(meetingId, userId, lock))
  }
	
  def setRecordingStatus(meetingId: String, userId: String, recording: java.lang.Boolean) {
    bbbGW.accept(new SetRecordingStatus(meetingId, userId, recording.booleanValue()))
  }
  
  def getRecordingStatus(meetingId: String, userId: String) {
    bbbGW.accept(new GetRecordingStatus(meetingId, userId))
  }
	
  
  // Users
	def setUserStatus(meetingID: String, userID: String, status: String, value: Object):Unit = {
		bbbGW.accept(new ChangeUserStatus(meetingID, userID, status, value));
	}

	def getUsers(meetingID: String, requesterID: String):Unit = {
		bbbGW.accept(new GetUsers(meetingID, requesterID))
	}

	def userLeft(meetingID: String, userID: String):Unit = {
		bbbGW.accept(new UserLeaving(meetingID, userID))
	}

	def userJoin(meetingID: String, userID: String, name: String, role: String, extUserID: String):Unit = {
		val userRole = if (role == "MODERATOR") MODERATOR else VIEWER
		bbbGW.accept(new UserJoining(meetingID, userID, name, userRole, extUserID))
	}

	def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String):Unit = {
		bbbGW.accept(new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy))
	}

	def getCurrentPresenter(meetingID: String, requesterID: String):Unit = {
		// do nothing
	}
		
	// Presentation
	def clear(meetingID: String) {
	  bbbGW.accept(new ClearPresentation(meetingID))
	}
	
	def sendUpdateMessage(meetingID: String, message: java.util.Map[String, Object]) {
	  bbbGW.accept(new PresentationConversionUpdate(meetingID, message))
	}
	
	def removePresentation(meetingID: String, presentationID: String) {
	  bbbGW.accept(new RemovePresentation(meetingID, presentationID))
	}
	
	def getPresentationInfo(meetingID: String, requesterID: String) {
	  bbbGW.accept(new GetPresentationInfo(meetingID, requesterID))
	}
	
	def sendCursorUpdate(meetingID: String, xPercent: Double, yPercent: Double) {
	  bbbGW.accept(new SendCursorUpdate(meetingID, xPercent, yPercent))
	}
	
	def resizeAndMoveSlide(meetingID: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) {
	  bbbGW.accept(new ResizeAndMoveSlide(meetingID, xOffset, yOffset, widthRatio, heightRatio))
	}
	
	def gotoSlide(meetingID: String, slide: Int) {
	  bbbGW.accept(new GotoSlide(meetingID, slide))
	}
	
	def sharePresentation(meetingID: String, presentationID: String, share: Boolean) {
	  bbbGW.accept(new SharePresentation(meetingID, presentationID, share))
	}
	
	def getSlideInfo(meetingID: String, requesterID: String) {
	  bbbGW.accept(new GetSlideInfo(meetingID, requesterID))
	}
	
	// Polling
	val pollGW = new PollInGateway(bbbGW)
	
	def getPolls(meetingID: String, requesterID: String) {
	  pollGW.getPolls(meetingID, requesterID)
	}

	def preCreatedPoll(meetingID: String, msg: String) {
	  pollGW.preCreatedPoll(meetingID, msg)
	}
		
	def createPoll(meetingID: String, requesterID: String, msg: String) {
	  pollGW.createPoll(meetingID, requesterID, msg)
	}
	
	def updatePoll(meetingID: String, requesterID: String, msg: String) {
	  pollGW.updatePoll(meetingID, requesterID, msg)
	}
	
	def startPoll(meetingID: String, requesterID: String, msg: String) {
	  pollGW.startPoll(meetingID, requesterID, msg)
	}
	
	def stopPoll(meetingID: String, requesterID: String, msg: String) {
	  pollGW.stopPoll(meetingID, requesterID, msg)
	}
	
	def removePoll(meetingID: String, requesterID: String, msg: String) {
	  pollGW.removePoll(meetingID, requesterID, msg)
	}
	
	def respondPoll(meetingID: String, requesterID: String, msg: String) {
	  pollGW.respondPoll(meetingID, requesterID, msg)
	}
	
	def showPollResult(meetingID: String, requesterID: String, msg: String) {
	  pollGW.showPollResult(meetingID, requesterID, msg)
	}
	
	def hidePollResult(meetingID: String, requesterID: String, msg: String) {
	  pollGW.hidePollResult(meetingID, requesterID, msg)
	}
}