package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.api._
import net.lag.logging.Logger
import org.bigbluebutton.core.MeetingActor
import com.google.gson.Gson

case class CurrentPresenter(userId: String, name: String, assignedBy: String)

case class CurrentPresentationInfo(presenter: CurrentPresenter, 
                    currentPresentation: CurrentPresentation,
                    presentations: Seq[Presentation])
case class CursorLocation(xPercent: Double = 0D, yPercent: Double = 0D)



trait PresentationApp {
  this : MeetingActor =>
  
  val log: Logger
  val outGW: MessageOutGateway
  
  private var currentPresentation = ""
  	
  private var cursorLocation = new CursorLocation
	
  
	    
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
      outGW.send(new PresentationConversionProgress(meetingID, msg.messageKey, 
            msg.code, msg.presentationId))
    }
    
    def handlePresentationPageCountError(msg: PresentationPageCountError) {
      outGW.send(new PresentationConversionError(meetingID, msg.messageKey, 
                       msg.code, msg.presentationId, 
                       msg.numberOfPages, 
                       msg.maxNumberPages))      
    }
    
    def handlePresentationSlideGenerated(msg: PresentationSlideGenerated) {
      outGW.send(new PresentationPageGenerated(meetingID, msg.messageKey, 
                       msg.code, msg.presentationId, 
                       msg.numberOfPages, 
                       msg.pagesCompleted))
    }
    
    def handlePresentationConversionCompleted(msg: PresentationConversionCompleted) { 
      
      presentationIDs.add(msg.presentationId); 
      
      sharePresentation(msg.presentationId, true);
      
      outGW.send(new PresentationConversionDone(meetingID, msg.messageKey, 
                       msg.code, msg.presentationId, 
                       msg.slidesInfo))      
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
		
		val presenter = new CurrentPresenter(curPresenter.presenterID, 
		                                   curPresenter.presenterName, 
		                                   curPresenter.assignedBy)
				
		val presentation = new CurrentPresentation(currentPresentation, 
		                         currentSlide, xOffset, yOffset, widthRatio,
		                         heightRatio)
		
		
		val presentationInfo = new scala.collection.immutable.HashMap[String, Object]();
		presentationInfo + "presenter" -> presenter
		presentationInfo + "presentation" -> presentation
		presentationInfo + "presentations" -> presentationIDs
		
		val presentationInfo = new CurrentPresentationInfo()
		
		val gson = new Gson()
		val msgString = gson.toJson(presentationInfo)
		
		println("JSON = \n" + msgString)		
		
	//	outGW.send(new GetPresentationInfoOutMsg(meetingID, recorded, msg.requesterID, presentationInfo))    
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