package org.bigbluebutton.core

import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.presentation.PreuploadedPresentationsUtil
import scala.collection.JavaConversions._
import org.bigbluebutton.core.apps.poll.PollInGateway
import org.bigbluebutton.core.apps.layout.LayoutInGateway
import org.bigbluebutton.core.apps.chat.ChatInGateway
import scala.collection.JavaConversions._
import org.bigbluebutton.core.apps.whiteboard.WhiteboardInGateway
import org.bigbluebutton.core.apps.voice.VoiceInGateway
import java.util.ArrayList
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.apps.presentation.Page
import org.bigbluebutton.core.apps.presentation.Presentation
import net.lag.logging.Logger

class BigBlueButtonInGW(bbbGW: BigBlueButtonGateway) extends IBigBlueButtonInGW {
  private val log = Logger.get
  
  val presUtil = new PreuploadedPresentationsUtil()
   
  // Meeting
  def createMeeting2(meetingID: String, record: Boolean, voiceBridge: String) {
	bbbGW.accept(new CreateMeeting(meetingID, record, voiceBridge))
		
	val pres = presUtil.getPreuploadedPresentations(meetingID);
	if (!pres.isEmpty()) {
	  var presentations = new scala.collection.immutable.HashMap[String, Presentation]
	  
	  pres foreach {p =>
	    val pages = generatePresentationPages(p.numPages)
	    val presentation = new Presentation(id=p.id, name=p.id, pages=pages)
	    presentations += presentation.id -> presentation
	  }
	  
	  
	  bbbGW.accept(new PreuploadedPresentations(meetingID, presentations.values.toSeq))
	}
  }
  
  def destroyMeeting(meetingID: String) {
    bbbGW.accept(new DestroyMeeting(meetingID))
  }
  
  def isAliveAudit(aliveId:String) {
    bbbGW.acceptKeepAlive(new KeepAliveMessage(aliveId)); 
  }

  def lockSettings(meetingID: String, locked: java.lang.Boolean, 
      lockSettings: java.util.Map[String, java.lang.Boolean]) {
    
  }
  
  def statusMeetingAudit(meetingID: String) {
    
  }
	
  def endMeeting(meetingID: String) {
    
  }
	
  def endAllMeetings() {
    
  }
  
  /*************************************************************
   * Message Interface for Users
   *************************************************************/
  
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
    val userRole = if (role == "MODERATOR") Role.MODERATOR else Role.VIEWER
    bbbGW.accept(new UserJoining(meetingID, userID, name, userRole, extUserID))
  }

  def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String):Unit = {
    bbbGW.accept(new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy))
  }

  def getCurrentPresenter(meetingID: String, requesterID: String):Unit = {
		// do nothing
  }
	
	/**************************************************************************************
	 * Message Interface for Presentation
	 **************************************************************************************/

	def clear(meetingID: String) {
	  bbbGW.accept(new ClearPresentation(meetingID))
	}
	
    def sendConversionUpdate(messageKey: String, meetingId: String, 
            code: String, presentationId: String) {
      bbbGW.accept(new PresentationConversionUpdate(meetingId, messageKey, 
                       code, presentationId))
    }
	
	def sendPageCountError(messageKey: String, meetingId: String, 
            code: String, presentationId: String, numberOfPages: Int,
            maxNumberPages: Int) {
      bbbGW.accept(new PresentationPageCountError(meetingId, messageKey, 
                       code, presentationId, numberOfPages, maxNumberPages))	  
	}
	
	def sendSlideGenerated(messageKey: String, meetingId: String, 
            code: String, presentationId: String, numberOfPages: Int,
            pagesCompleted: Int) {
      bbbGW.accept(new PresentationSlideGenerated(meetingId, messageKey, 
                       code, presentationId, numberOfPages, pagesCompleted))	  
	}
	
    def generatePresentationPages(numPages: Int):scala.collection.immutable.HashMap[String, Page] = {
	  var pages = new scala.collection.immutable.HashMap[String, Page]
	  
	  for (i <- 1 to numPages) {
	    val id = "slide/" + i
	    val num = i;
	    val thumbnail = "thumbnail/" + i
	    val p = new Page(id=id, num=num, thumbnail=thumbnail)
	    pages += (p.id -> p)
	  }
	  
	  pages
	}
	
	def sendConversionCompleted(messageKey: String, meetingId: String, 
            code: String, presentationId: String, numPages: Int) {
	  
      val pages = generatePresentationPages(numPages)
	  
      pages.values foreach {p =>
        println("**** Page [" + p.id + "," + p.num + "]")
      }
      
	  val presentation = new Presentation(id=presentationId, name=presentationId, pages=pages)
      bbbGW.accept(new PresentationConversionCompleted(meetingId, messageKey, 
                       code, presentation))	 
                       
	}
		
	def removePresentation(meetingID: String, presentationID: String) {
	  bbbGW.accept(new RemovePresentation(meetingID, presentationID))
	}
	
	def getPresentationInfo(meetingID: String, requesterID: String) {
	  println("**** Forwarding GetPresentationInfo for meeting[" + meetingID + "] ****")
	  log.debug("**** Forwarding GetPresentationInfo for meeting[{}] ****", meetingID)
	  bbbGW.accept(new GetPresentationInfo(meetingID, requesterID))
	}
	
	def sendCursorUpdate(meetingID: String, xPercent: Double, yPercent: Double) {
	  bbbGW.accept(new SendCursorUpdate(meetingID, xPercent, yPercent))
	}
	
	def resizeAndMoveSlide(meetingID: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) {
	  bbbGW.accept(new ResizeAndMoveSlide(meetingID, xOffset, yOffset, widthRatio, heightRatio))
	}
	
	def gotoSlide(meetingID: String, slide: Int) {
	  bbbGW.accept(new GotoSlide(meetingID, slide.toString))
	}
	
	def sharePresentation(meetingID: String, presentationID: String, share: Boolean) {
	  bbbGW.accept(new SharePresentation(meetingID, presentationID, share))
	}
	
	def getSlideInfo(meetingID: String, requesterID: String) {
	  bbbGW.accept(new GetSlideInfo(meetingID, requesterID))
	}
	
	/**************************************************************
	 * Message Interface Polling
	 **************************************************************/
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
	
	/*************************************************************************
	 * Message Interface for Layout
	 *********************************************************************/
	val layoutGW = new LayoutInGateway(bbbGW)
	
	def getCurrentLayout(meetingID: String, requesterID: String) {
	  layoutGW.getCurrentLayout(meetingID, requesterID)
	}
	
	def setLayout(meetingID: String, requesterID: String, layoutID: String) {
	  layoutGW.setLayout(meetingID, requesterID, layoutID)
	}
	
	def lockLayout(meetingID: String, requesterID: String, layoutID: String) {
	  layoutGW.lockLayout(meetingID, requesterID, layoutID)
	}
	
	def unlockLayout(meetingID: String, requesterID: String) {
	  layoutGW.unlockLayout(meetingID, requesterID)
	}
	
	/*********************************************************************
	 * Message Interface for Chat
	 *******************************************************************/
	val chatGW = new ChatInGateway(bbbGW)
	
	def getChatHistory(meetingID: String, requesterID: String) {
	  chatGW.getChatHistory(meetingID, requesterID)
	}
	
	def sendPublicMessage(meetingID: String, requesterID: String, message: java.util.Map[String, String]) {
	  // Convert java Map to Scala Map, then convert Mutable map to immutable map
	  chatGW.sendPublicMessage(meetingID, requesterID, mapAsScalaMap(message).toMap)
	}
	
	def sendPrivateMessage(meetingID: String, requesterID: String, message: java.util.Map[String, String]) {
	  chatGW.sendPrivateMessage(meetingID, requesterID, mapAsScalaMap(message).toMap)
	}
	
	/*********************************************************************
	 * Message Interface for Whiteboard
	 *******************************************************************/
	val wbGW = new WhiteboardInGateway(bbbGW)
	
	def sendWhiteboardAnnotation(meetingID: String, requesterID: String, annotation: java.util.Map[String, Object]) {
	  wbGW.sendWhiteboardAnnotation(meetingID, requesterID, mapAsScalaMap(annotation).toMap)
	}
	
	def setWhiteboardActivePage(meetingID: String, requesterID: String, page: java.lang.Integer){
	  wbGW.setWhiteboardActivePage(meetingID, requesterID, page)
	}
	
	def requestWhiteboardAnnotationHistory(meetingID: String, requestedID: String, presentationID: String, page: java.lang.Integer) {
	  wbGW.requestWhiteboardAnnotationHistory(meetingID, requestedID, presentationID, page)
	}
	
	def clearWhiteboard(meetingID: String, requestedID: String) {
	  wbGW.clearWhiteboard(meetingID, requestedID);
	}
	
	def undoWhiteboard(meetingID: String, requestedID: String) {
	  wbGW.undoWhiteboard(meetingID, requestedID)
	}
	
	def setActivePresentation(meetingID: String, requestedID: String, presentationID: String, numPages: java.lang.Integer) {
	  wbGW.setActivePresentation(meetingID, requestedID, presentationID, numPages)
	}
	
	def enableWhiteboard(meetingID: String, requestedID: String, enable: java.lang.Boolean) {
	  wbGW.enableWhiteboard(meetingID, requestedID, enable)
	}
	
	def isWhiteboardEnabled(meetingID: String, requestedID: String) {
	  wbGW.isWhiteboardEnabled(meetingID, requestedID)
	}
	
	/*********************************************************************
	 * Message Interface for Voice
	 *******************************************************************/
	val voiceGW = new VoiceInGateway(bbbGW)
	
	def getVoiceUsers(meetingID: String, requesterID: String) {
	  voiceGW.getVoiceUsers(meetingID, requesterID)
	}
	
	def muteAllUsers(meetingID: String, requesterID: String, mute: java.lang.Boolean) {
	  voiceGW.muteAllUsers(meetingID, requesterID, mute)
	}
	
	def isMeetingMuted(meetingID: String, requesterID: String) {
	  voiceGW.isMeetingMuted(meetingID, requesterID)
	}
	
	def muteUser(meetingID: String, requesterID: String, userID: String, mute: java.lang.Boolean) {
	  voiceGW.muteUser(meetingID, requesterID, userID, mute)
	}
	
	def lockUser(meetingID: String, requesterID: String, userID: String, lock: java.lang.Boolean) {
	  voiceGW.lockUser(meetingID, requesterID, userID, lock)
	}
	
	def ejectUser(meetingID: String, requesterID: String, userID: String) {
	  voiceGW.ejectUser(meetingID, requesterID, userID)
	}
	
	def voiceUserJoined(meetingId: String, userId: String, webUserId: String, 
	                            conference: String, callerIdNum: String, 
	                            callerIdName: String,
								muted: java.lang.Boolean, speaking: java.lang.Boolean) {
	  voiceGW.voiceUserJoined(meetingId, userId, webUserId, 
	                            conference, callerIdNum, 
	                            callerIdName,
								muted, speaking)
	}
	
	def voiceUserLeft(meetingId: String, userId: String) {
	  voiceGW.voiceUserLeft(meetingId, userId)
	}
	
	def voiceUserLocked(meetingId: String, userId: String, locked: java.lang.Boolean) {
	  voiceGW.voiceUserLocked(meetingId, userId, locked)
	}
	
	def voiceUserMuted(meetingId: String, userId: String, muted: java.lang.Boolean) {
	  voiceGW.voiceUserMuted(meetingId, userId, muted)
	}
	
	def voiceUserTalking(meetingId: String, userId: String, talking: java.lang.Boolean) {
	  voiceGW.voiceUserTalking(meetingId, userId, talking)
	}
}
