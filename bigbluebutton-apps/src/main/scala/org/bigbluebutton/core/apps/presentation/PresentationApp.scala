package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.ClearPresentation
import org.bigbluebutton.core.api.PresentationConversionUpdate
import org.bigbluebutton.core.api.RemovePresentation
import org.bigbluebutton.core.api.GetPresentationInfo
import org.bigbluebutton.core.api.SendCursorUpdate
import org.bigbluebutton.core.api.ResizeAndMoveSlide
import org.bigbluebutton.core.api.GotoSlide
import org.bigbluebutton.core.api.SharePresentation
import org.bigbluebutton.core.api.GetSlideInfo
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.api.ClearPresentationOutMsg
import org.bigbluebutton.core.api.SendCursorUpdateOutMsg
import org.bigbluebutton.core.api.ResizeAndMoveSlideOutMsg
import org.bigbluebutton.core.api.GotoSlideOutMsg
import org.bigbluebutton.core.api.GetSlideInfoOutMsg
import org.bigbluebutton.core.api.GetPresentationInfoOutMsg
import org.bigbluebutton.core.api.InitializeMeeting
import org.bigbluebutton.core.api.PreuploadedPresentations
import org.bigbluebutton.core.api.PresentationConversionUpdateOutMsg
import org.bigbluebutton.core.api.SharePresentationOutMsg

class PresentationApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway, usersApp: UsersApp) {

  private var currentPresentation = ""
  private var currentSlide = 0
  private var sharing = false
  private var xOffset = 0D
  private var yOffset = 0D
  private var widthRatio = 1D
  private var heightRatio = 1D
	
  /* cursor location */
  private var xCursorPercent = 0D
  private var yCursorPercent = 0D
	
  private var presentationIDs = new java.util.ArrayList[String]();
	
    def handleMessage(msg: InMessage):Unit = {
    	msg match {
    	  case initializeMeeting: InitializeMeeting => handleInitializeMeeting(initializeMeeting)
    	  case clearPresentation: ClearPresentation => handleClearPresentation(clearPresentation)
    	  case presentationConversionUpdate: PresentationConversionUpdate => handlePresentationConversionUpdate(presentationConversionUpdate)
    	  case removePresentation: RemovePresentation => handleRemovePresentation(removePresentation)
    	  case getPresentationInfo : GetPresentationInfo => handleGetPresentationInfo(getPresentationInfo)
    	  case sendCursorUpdate : SendCursorUpdate => handleSendCursorUpdate(sendCursorUpdate)
    	  case resizeAndMoveSlide: ResizeAndMoveSlide => handleResizeAndMoveSlide(resizeAndMoveSlide)
    	  case gotoSlide: GotoSlide => handleGotoSlide(gotoSlide)
    	  case sharePresentation: SharePresentation => handleSharePresentation(sharePresentation)
    	  case getSlideInfo: GetSlideInfo => handleGetSlideInfo(getSlideInfo)
    	  case preuploadedPresentetations: PreuploadedPresentations => handlePreuploadedPresentations(preuploadedPresentetations)
    	  case _ => // do nothing
    	}
    }
    
    private def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
      val pres = msg.presentations
      
      msg.presentations.foreach(presentationID => {
    	  sharePresentation(presentationID.asInstanceOf[String], true)       
      })
    }
    
    private def handleInitializeMeeting(msg: InitializeMeeting) {
      
    }
    
    private def handleClearPresentation(msg: ClearPresentation) {
      currentPresentation = ""
      sharing = false
      outGW.send(new ClearPresentationOutMsg(meetingID, recorded))
    }
    
    private def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {

    	val presentationID = msg.msg.get("presentationName")
        val messageKey = msg.msg.get("messageKey").asInstanceOf[String]
             
        if (messageKey.equalsIgnoreCase("CONVERSION_COMPLETED")) {            
            presentationIDs.add(presentationID.asInstanceOf[String]);                                
        }
    	
    	outGW.send(new PresentationConversionUpdateOutMsg(meetingID, recorded, msg.msg))
    }
    
    private def handleRemovePresentation(msg: RemovePresentation) {
        val index = presentationIDs.indexOf(msg.presentationID);
        
        if (index < 0) {
            return;
        }
        
        presentationIDs.remove(index);
               
        if (currentPresentation.equalsIgnoreCase(msg.presentationID)) {
            sharePresentation(msg.presentationID, false);
        }      
    }
    
    private def handleGetPresentationInfo(msg: GetPresentationInfo) {
		val curPresenter = usersApp.getCurrentPresenter();
				
		val presenter = new java.util.HashMap[String, Object]();		
		if (curPresenter != null) {
			presenter.put("hasPresenter", true:java.lang.Boolean);
			presenter.put("user", curPresenter.presenterID);
			presenter.put("name", curPresenter.presenterName);
			presenter.put("assignedBy",curPresenter.assignedBy);
		} else {
			presenter.put("hasPresenter", false:java.lang.Boolean);
		}
				
		val presentation = new java.util.HashMap[String, Object]();
		if (sharing) {
			presentation.put("sharing", true:java.lang.Boolean)
			presentation.put("slide", currentSlide:java.lang.Integer)
			presentation.put("currentPresentation", currentPresentation)
			presentation.put("xOffset", xOffset:java.lang.Double)
			presentation.put("yOffset", yOffset:java.lang.Double)
			presentation.put("widthRatio", widthRatio:java.lang.Double)
			presentation.put("heightRatio", heightRatio:java.lang.Double)
		} else {
			presentation.put("sharing", false:java.lang.Boolean)
		}
		
		val presentationInfo = new java.util.HashMap[String, Object]();
		presentationInfo.put("presenter", presenter);
		presentationInfo.put("presentation", presentation);
		presentationInfo.put("presentations", presentationIDs);
		
		outGW.send(new GetPresentationInfoOutMsg(meetingID, recorded, msg.requesterID, presentationInfo))    
    }
    
    private def handleSendCursorUpdate(msg: SendCursorUpdate) {
      xCursorPercent = msg.xPercent
      yCursorPercent = msg.yPercent
      outGW.send(new SendCursorUpdateOutMsg(meetingID, recorded, xCursorPercent, yCursorPercent))
    }
    
    private def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
      xOffset = msg.xOffset
      yOffset = msg.yOffset
      widthRatio = msg.widthRatio
      heightRatio = msg.heightRatio
      outGW.send(new ResizeAndMoveSlideOutMsg(meetingID, recorded, xOffset, yOffset, widthRatio, heightRatio))
    }
    
    private def handleGotoSlide(msg: GotoSlide) {
      currentSlide = msg.slide
      outGW.send(new GotoSlideOutMsg(meetingID, recorded, msg.slide))
    }
    
    private def handleSharePresentation(msg: SharePresentation) {
      sharePresentation(msg.presentationID, msg.share)
    }
    
    private def sharePresentation(presentationID: String, share: Boolean) {
  		sharing = share;
  		if (share) {
  		  currentPresentation = presentationID;
  		  val index = presentationIDs.indexOf(presentationID);
          
  		  if (index < 0) {
  			  presentationIDs.add(presentationID)
  		  }
  		  
  		} else {
  		  currentPresentation = "";
  		}
      outGW.send(new SharePresentationOutMsg(meetingID, recorded, currentPresentation, share))	      
    }
    
    private def handleGetSlideInfo(msg: GetSlideInfo) {
      outGW.send(new GetSlideInfoOutMsg(meetingID, recorded, msg.requesterID, xOffset, yOffset, widthRatio, heightRatio))
    }
    
}