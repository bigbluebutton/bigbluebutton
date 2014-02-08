package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.api._
import net.lag.logging.Logger
import org.bigbluebutton.core.MeetingActor
import com.google.gson.Gson

case class CurrentPresenter(userId: String, name: String, assignedBy: String)

case class CurrentPresentationInfo(presenter: CurrentPresenter, 
                    presentations: Seq[Presentation])
case class CursorLocation(xPercent: Double = 0D, yPercent: Double = 0D)



trait PresentationApp {
  this : MeetingActor =>
  
  val log : Logger
  val outGW: MessageOutGateway
    	
  private var cursorLocation = new CursorLocation
  private val presModel = new PresentationModel	
  
	    
  def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
    val pres = msg.presentations
      
    msg.presentations.foreach(presentationID => {
  	  sharePresentation(presentationID.asInstanceOf[String], true)       
    })
  }
    
    def handleInitializeMeeting(msg: InitializeMeeting) {
       
    }
    
    def handleClearPresentation(msg: ClearPresentation) {
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
      
      presModel.addPresentation(msg.presentation)
      
      outGW.send(new PresentationConversionDone(meetingID, msg.messageKey, 
                       msg.code, msg.presentation))      
    }
    	                     
    def handleRemovePresentation(msg: RemovePresentation) {
      val curPres = presModel.getCurrentPresentation
      
      val removedPresentation = presModel.remove(msg.presentationID)

      curPres foreach (cp => {
        if (cp.id == msg.presentationID) {
           sharePresentation(msg.presentationID, false);
        }
      })
    }
    
    def handleGetPresentationInfo(msg: GetPresentationInfo) {
      println("PresentationApp : handleGetPresentationInfo GetPresentationInfo for meeting [" + msg.meetingID + "] [" + msg.requesterID + "]" )
      
      log.debug("Received GetPresentationInfo for meeting [{}] [{}]", msg.meetingID, msg.requesterID)
      val curPresenter = getCurrentPresenter;
      val presenter = new CurrentPresenter(curPresenter.presenterID, 
		                                   curPresenter.presenterName, 
		                                   curPresenter.assignedBy)
      val presentations = presModel.getPresentations
      val presentationInfo = new CurrentPresentationInfo(presenter, presentations)
      outGW.send(new GetPresentationInfoOutMsg(meetingID, recorded, msg.requesterID, presentationInfo))    
    }
    
    def handleSendCursorUpdate(msg: SendCursorUpdate) {
      cursorLocation = new CursorLocation(msg.xPercent, msg.yPercent)
      outGW.send(new SendCursorUpdateOutMsg(meetingID, recorded, msg.xPercent, msg.yPercent))
    }
    
    def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
      val page = presModel.resizePage(msg.xOffset, msg.yOffset, 
                                      msg.widthRatio, msg.heightRatio);
      page foreach (p => outGW.send(new ResizeAndMoveSlideOutMsg(meetingID, recorded, p)))      
    }
    
    def handleGotoSlide(msg: GotoSlide) {
      presModel.changePage(msg.page) foreach (page => 
        outGW.send(new GotoSlideOutMsg(meetingID, recorded, page)))
      
    }
    
    def handleSharePresentation(msg: SharePresentation) {
      sharePresentation(msg.presentationID, msg.share)
    }
    
    def sharePresentation(presentationID: String, share: Boolean) {
      val pres = presModel.sharePresentation(presentationID)
      
      pres foreach { p =>
        outGW.send(new SharePresentationOutMsg(meetingID, recorded, p.id, share))
      }
      	      
    }
    
    def handleGetSlideInfo(msg: GetSlideInfo) {
//      outGW.send(new GetSlideInfoOutMsg(meetingID, recorded, msg.requesterID, xOffset, yOffset, widthRatio, heightRatio))
    }
    
}