package org.bigbluebutton.core

import org.bigbluebutton.core.api.ChangeUserStatus
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.GetUsers
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
		var userRole:Role = VIEWER;

		if (role == "MODERATOR") {
		  userRole = MODERATOR;
		}

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
}