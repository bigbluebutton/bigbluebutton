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

class BigBlueButtonInGW(bbbGW: BigBlueButtonGateway, presUtil: PreuploadedPresentationsUtil) extends IBigBlueButtonInGW {
   
  // Meeting
  def createMeeting2(meetingID: String, meetingName: String, record: Boolean, voiceBridge: String, duration: Long) {
//    println("******************** CREATING MEETING [" + meetingID + "] ***************************** ")
	bbbGW.accept(new CreateMeeting(meetingID, meetingName, record, voiceBridge, duration))

	/*
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
	
	*/
  }
  
  def destroyMeeting(meetingID: String) {
//    println("******************** DESTROY MEETING [" + meetingID + "] ***************************** ")
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
//    println("******************** END MEETING [" + meetingID + "] ***************************** ")
    bbbGW.accept(new EndMeeting(meetingID))
  }
	
  def endAllMeetings() {
    
  }
  
  /*************************************************************
   * Message Interface for Users
   *************************************************************/
  def validateAuthToken(meetingId: String, userId: String, token: String, correlationId: String) {
//    println("******************** VALIDATE TOKEN [" + token + "] ***************************** ")
    bbbGW.accept(new ValidateAuthToken(meetingId, userId, token, correlationId))
  }
  
  def registerUser(meetingID: String, userID: String, name: String, role: String, extUserID: String, authToken: String):Unit = {
    val userRole = if (role == "MODERATOR") Role.MODERATOR else Role.VIEWER
    bbbGW.accept(new RegisterUser(meetingID, userID, name, userRole, extUserID, authToken))
  }
  
  def sendLockSettings(meetingID: String, userId: String, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convaert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues (v => v.booleanValue() /* convert java Boolean to Scala Boolean */).toMap  
    val disableCam = s.getOrElse("disableCam", false) 
    val disableMic = s.getOrElse("disableMic", false)
    val disablePrivChat = s.getOrElse("disablePrivateChat", false)
    val disablePubChat = s.getOrElse("disablePublicChat", false)
    val lockedLayout = s.getOrElse("lockedLayout", false)
    val permissions = new Permissions(disableCam = disableCam,
                                      disableMic = disableMic,
                                      disablePrivChat = disablePrivChat,
                                      disablePubChat = disablePubChat,
                                      lockedLayout = lockedLayout)

    bbbGW.accept(new SetLockSettings(meetingID, userId, permissions))
  }
  
  def initLockSettings(meetingID: String, locked: Boolean, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convaert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues (v => v.booleanValue() /* convert java Boolean to Scala Boolean */).toMap  
    val disableCam = s.getOrElse("disableCam", false) 
    val disableMic = s.getOrElse("disableMic", false)
    val disablePrivChat = s.getOrElse("disablePrivateChat", false)
    val disablePubChat = s.getOrElse("disablePublicChat", false)
    val lockedLayout = s.getOrElse("lockedLayout", false)
    val permissions = new Permissions(disableCam = disableCam,
                                      disableMic = disableMic,
                                      disablePrivChat = disablePrivChat,
                                      disablePubChat = disablePubChat,
                                      lockedLayout = lockedLayout)

    bbbGW.accept(new InitLockSettings(meetingID, locked, permissions))
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
  def userRaiseHand(meetingId: String, userId: String) {
    bbbGW.accept(new UserRaiseHand(meetingId, userId))
  }
  
  def lowerHand(meetingId: String, userId: String, loweredBy: String) {
    bbbGW.accept(new UserLowerHand(meetingId, userId, loweredBy))
  }
  
  def ejectUserFromMeeting(meetingId: String, userId: String, ejectedBy: String) {
    bbbGW.accept(new EjectUserFromMeeting(meetingId, userId, ejectedBy))
  }
  
  def shareWebcam(meetingId: String, userId: String, stream: String) {
    bbbGW.accept(new UserShareWebcam(meetingId, userId, stream))
  }
  
  def unshareWebcam(meetingId: String, userId: String) {
    bbbGW.accept(new UserUnshareWebcam(meetingId, userId))
  }
	
  def setUserStatus(meetingID: String, userID: String, status: String, value: Object):Unit = {
    bbbGW.accept(new ChangeUserStatus(meetingID, userID, status, value));
  }

  def getUsers(meetingID: String, requesterID: String):Unit = {
    bbbGW.accept(new GetUsers(meetingID, requesterID))
  }

  def userLeft(meetingID: String, userID: String):Unit = {
    bbbGW.accept(new UserLeaving(meetingID, userID))
  }

  def userJoin(meetingID: String, userID: String):Unit = {
    bbbGW.accept(new UserJoining(meetingID, userID))
  }

  def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String):Unit = {
    bbbGW.accept(new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy))
  }

  def getCurrentPresenter(meetingID: String, requesterID: String):Unit = {
		// do nothing
  }

  def userConnectedToGlobalAudio(voiceConf: String, userid: String, name: String) {
    bbbGW.accept(new UserConnectedToGlobalAudio(voiceConf, voiceConf, userid, name))
  }
  
  def userDisconnectedFromGlobalAudio(voiceConf: String, userid: String, name: String) {
    bbbGW.accept(new UserDisconnectedFromGlobalAudio(voiceConf, voiceConf, userid, name))
  }
  
	/**************************************************************************************
	 * Message Interface for Presentation
	 **************************************************************************************/

	def clear(meetingID: String) {
	  bbbGW.accept(new ClearPresentation(meetingID))
	}
	
    def sendConversionUpdate(messageKey: String, meetingId: String, 
            code: String, presentationId: String, presName: String) {
      bbbGW.accept(new PresentationConversionUpdate(meetingId, messageKey, 
                       code, presentationId, presName))
    }
	
	def sendPageCountError(messageKey: String, meetingId: String, 
            code: String, presentationId: String, numberOfPages: Int,
            maxNumberPages: Int, presName: String) {
      bbbGW.accept(new PresentationPageCountError(meetingId, messageKey, 
                       code, presentationId, numberOfPages, maxNumberPages, presName))	  
	}
	
	def sendSlideGenerated(messageKey: String, meetingId: String, 
            code: String, presentationId: String, numberOfPages: Int,
            pagesCompleted: Int, presName: String) {
      bbbGW.accept(new PresentationSlideGenerated(meetingId, messageKey, 
                       code, presentationId, numberOfPages, pagesCompleted, presName))	  
	}
	
    def generatePresentationPages(presId: String, numPages: Int, presBaseUrl: String):scala.collection.immutable.HashMap[String, Page] = {
	  var pages = new scala.collection.immutable.HashMap[String, Page]
	  val baseUrl = 
	  for (i <- 1 to numPages) {
	    val id = presId + "/" + i
	    val num = i;
	    val current = if (i == 1) true else false
	    val thumbnail = presBaseUrl + "/thumbnail/" + i
	    val swfUri = presBaseUrl + "/slide/" + i
	    val txtUri = presBaseUrl + "/textfiles/slide-" + i + ".txt"
				
	    val p = new Page(id=id, num=num, thumbUri=thumbnail, swfUri=swfUri,
	                     txtUri=txtUri, pngUri=thumbnail,
	                     current=current)
	    pages += (p.id -> p)
	  }
	  
	  pages
	}
	
	def sendConversionCompleted(messageKey: String, meetingId: String, 
            code: String, presentationId: String, numPages: Int, 
            presName: String, presBaseUrl: String) {
//	  println("******************** PRESENTATION CONVERSION COMPLETED MESSAGE ***************************** ")
      val pages = generatePresentationPages(presentationId, numPages, presBaseUrl)
	        
	  val presentation = new Presentation(id=presentationId, name=presName, pages=pages)
      bbbGW.accept(new PresentationConversionCompleted(meetingId, messageKey, 
                       code, presentation))	 
                       
	}
		
	def removePresentation(meetingID: String, presentationID: String) {
	  bbbGW.accept(new RemovePresentation(meetingID, presentationID))
	}
	
	def getPresentationInfo(meetingID: String, requesterID: String, replyTo: String) {
	  println("**** Forwarding GetPresentationInfo for meeting[" + meetingID + "] ****")
	  bbbGW.accept(new GetPresentationInfo(meetingID, requesterID, replyTo))
	}
	
	def sendCursorUpdate(meetingID: String, xPercent: Double, yPercent: Double) {
	  bbbGW.accept(new SendCursorUpdate(meetingID, xPercent, yPercent))
	}
	
	def resizeAndMoveSlide(meetingID: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) {
	  bbbGW.accept(new ResizeAndMoveSlide(meetingID, xOffset, yOffset, widthRatio, heightRatio))
	}
	
	def gotoSlide(meetingID: String, pageId: String) {
	  println("**** Forwarding GotoSlide for meeting[" + meetingID + "] ****")
	  bbbGW.accept(new GotoSlide(meetingID, pageId))
	}
	
	def sharePresentation(meetingID: String, presentationID: String, share: Boolean) {
	  bbbGW.accept(new SharePresentation(meetingID, presentationID, share))
	}
	
	def getSlideInfo(meetingID: String, requesterID: String, replyTo: String) {
	  bbbGW.accept(new GetSlideInfo(meetingID, requesterID, replyTo))
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
	
	def broadcastLayout(meetingID: String, requesterID: String, layout: String) {
	  layoutGW.broadcastLayout(meetingID, requesterID, layout)
	}
	
	def lockLayout(meetingId: String, setById: String, 
	               lock: Boolean, viewersOnly: Boolean,
                 layout: scala.Option[String]) {
	    layoutGW.lockLayout(meetingId, setById, lock, viewersOnly, layout)
	}
	
	/*********************************************************************
	 * Message Interface for Chat
	 *******************************************************************/
	val chatGW = new ChatInGateway(bbbGW)
	
	def getChatHistory(meetingID: String, requesterID: String, replyTo: String) {
	  chatGW.getChatHistory(meetingID, requesterID, replyTo)
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
	
	def requestWhiteboardAnnotationHistory(meetingID: String, requestedID: String, whiteboardId: String, replyTo: String) {
	  wbGW.requestWhiteboardAnnotationHistory(meetingID, requestedID, whiteboardId, replyTo)
	}
	
	def clearWhiteboard(meetingID: String, requestedID: String, whiteboardId: String) {
	  wbGW.clearWhiteboard(meetingID, requestedID, whiteboardId);
	}
	
	def undoWhiteboard(meetingID: String, requestedID: String, whiteboardId: String) {
	  wbGW.undoWhiteboard(meetingID, requestedID, whiteboardId)
	}
		
	def enableWhiteboard(meetingID: String, requestedID: String, enable: java.lang.Boolean) {
	  wbGW.enableWhiteboard(meetingID, requestedID, enable)
	}
	
	def isWhiteboardEnabled(meetingID: String, requestedID: String, replyTo: String) {
	  wbGW.isWhiteboardEnabled(meetingID, requestedID, replyTo)
	}
	
	/*********************************************************************
	 * Message Interface for Voice
	 *******************************************************************/
	val voiceGW = new VoiceInGateway(bbbGW)
	
	def muteAllExceptPresenter(meetingID: String, requesterID: String, mute: java.lang.Boolean) {
	  voiceGW.muteAllExceptPresenter(meetingID, requesterID, mute)
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
	
	def ejectUserFromVoice(meetingId: String, userId: String, ejectedBy: String) {
	  voiceGW.ejectUserFromVoice(meetingId, userId, ejectedBy)
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
	
	def voiceRecording(meetingId: String, recordingFile: String, 
			            timestamp: String, recording: java.lang.Boolean) {
	  voiceGW.voiceRecording(meetingId, recordingFile, 
			            timestamp, recording)
	}
}
