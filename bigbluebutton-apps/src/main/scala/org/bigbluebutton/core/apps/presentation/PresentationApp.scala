package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.api._
import net.lag.logging.Logger
import org.bigbluebutton.core.MeetingActor

trait PresentationApp {
  this : MeetingActor =>
  
  val log: Logger
  val outGW: MessageOutGateway
  
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
	    
    def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
      val pres = msg.presentations
      
      msg.presentations.foreach(presentationID => {
    	  sharePresentation(presentationID.asInstanceOf[String], true)       
      })
    }
    
    def handleInitializeMeeting(msg: InitializeMeeting) {
       
    }
    
    def handleClearPresentation(msg: ClearPresentation) {
      currentPresentation = ""
      sharing = false
      outGW.send(new ClearPresentationOutMsg(meetingID, recorded))
    }
    
    def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {

    	val presentationID = msg.msg.get("presentationName")
        val messageKey = msg.msg.get("messageKey").asInstanceOf[String]
             
        if (messageKey.equalsIgnoreCase("CONVERSION_COMPLETED")) {            
            presentationIDs.add(presentationID.asInstanceOf[String]); 
            sharePresentation(presentationID.asInstanceOf[String], true);
        }
    	
    	outGW.send(new PresentationConversionUpdateOutMsg(meetingID, recorded, msg.msg))
    }
    
    def handleRemovePresentation(msg: RemovePresentation) {
        val index = presentationIDs.indexOf(msg.presentationID);
        
        if (index < 0) {
            return;
        }
        
        presentationIDs.remove(index);
               
        if (currentPresentation.equalsIgnoreCase(msg.presentationID)) {
            sharePresentation(msg.presentationID, false);
        }      
    }
    
    def handleGetPresentationInfo(msg: GetPresentationInfo) {
		val curPresenter = getCurrentPresenter;
				
		val presenter = new scala.collection.immutable.HashMap[String, Object]();		
		if (curPresenter != null) {
			presenter + "hasPresenter" -> true
			presenter + "user" -> curPresenter.presenterID
			presenter + "name" -> curPresenter.presenterName
			presenter + "assignedBy" -> curPresenter.assignedBy
		} else {
			presenter + "hasPresenter" -> false
		}
				
		val presentation = new scala.collection.immutable.HashMap[String, Object]();
		
		if (sharing) {
			presentation + "sharing" -> true
			presentation + "slide" -> currentSlide
			presentation + "currentPresentation" -> currentPresentation
			presentation + "xOffset" -> xOffset
			presentation + "yOffset" -> yOffset
			presentation + "widthRatio" -> widthRatio
			presentation + "heightRatio" -> heightRatio
		} else {
			presentation + "sharing" -> false
		}
		
		val presentationInfo = new scala.collection.immutable.HashMap[String, Object]();
		presentationInfo + "presenter" -> presenter
		presentationInfo + "presentation" -> presentation
		presentationInfo + "presentations" -> presentationIDs
		
		outGW.send(new GetPresentationInfoOutMsg(meetingID, recorded, msg.requesterID, presentationInfo))    
    }
    
    def handleSendCursorUpdate(msg: SendCursorUpdate) {
      xCursorPercent = msg.xPercent
      yCursorPercent = msg.yPercent
      outGW.send(new SendCursorUpdateOutMsg(meetingID, recorded, xCursorPercent, yCursorPercent))
    }
    
    def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
      xOffset = msg.xOffset
      yOffset = msg.yOffset
      widthRatio = msg.widthRatio
      heightRatio = msg.heightRatio
      outGW.send(new ResizeAndMoveSlideOutMsg(meetingID, recorded, xOffset, yOffset, widthRatio, heightRatio))
    }
    
    def handleGotoSlide(msg: GotoSlide) {
      currentSlide = msg.slide
      outGW.send(new GotoSlideOutMsg(meetingID, recorded, msg.slide))
    }
    
    def handleSharePresentation(msg: SharePresentation) {
      sharePresentation(msg.presentationID, msg.share)
    }
    
    def sharePresentation(presentationID: String, share: Boolean) {
      
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
    
    def handleGetSlideInfo(msg: GetSlideInfo) {
      outGW.send(new GetSlideInfoOutMsg(meetingID, recorded, msg.requesterID, xOffset, yOffset, widthRatio, heightRatio))
    }
    
}