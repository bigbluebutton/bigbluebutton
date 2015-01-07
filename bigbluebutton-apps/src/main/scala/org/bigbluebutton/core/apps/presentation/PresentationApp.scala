package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import com.google.gson.Gson

case class CurrentPresenter(userId: String, name: String, assignedBy: String)

case class CurrentPresentationInfo(presenter: CurrentPresenter, 
                    presentations: Seq[Presentation])
case class CursorLocation(xPercent: Double = 0D, yPercent: Double = 0D)



trait PresentationApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway
    	
  private var cursorLocation = new CursorLocation
  private val presModel = new PresentationModel	
  
	    
  def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
    val pres = msg.presentations
      
    msg.presentations.foreach(presentation => {
      presModel.addPresentation(presentation)
                             
      sharePresentation(presentation.id, true)     
    })
  }
    
    def handleInitializeMeeting(msg: InitializeMeeting) {
       
    }
    
    def handleClearPresentation(msg: ClearPresentation) {
      outGW.send(new ClearPresentationOutMsg(meetingID, recorded))
    }
    
    def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {
      outGW.send(new PresentationConversionProgress(meetingID, msg.messageKey, 
            msg.code, msg.presentationId, msg.presName))
    }
    
    def handlePresentationPageCountError(msg: PresentationPageCountError) {
      outGW.send(new PresentationConversionError(meetingID, msg.messageKey, 
                                        msg.code, msg.presentationId, 
                                        msg.numberOfPages, 
                                        msg.maxNumberPages, msg.presName))      
    }
    
    def handlePresentationSlideGenerated(msg: PresentationSlideGenerated) {
      outGW.send(new PresentationPageGenerated(meetingID, msg.messageKey, 
                                        msg.code, msg.presentationId, 
                                        msg.numberOfPages, 
                                        msg.pagesCompleted, msg.presName))
    }
    
    def handlePresentationConversionCompleted(msg: PresentationConversionCompleted) { 
      
      presModel.addPresentation(msg.presentation)
      
      outGW.send(new PresentationConversionDone(meetingID, recorded, msg.messageKey, 
                       msg.code, msg.presentation))    
                       
      sharePresentation(msg.presentation.id, true)
    }
    	                     
    def handleRemovePresentation(msg: RemovePresentation) {
      val curPres = presModel.getCurrentPresentation
      
      val removedPresentation = presModel.remove(msg.presentationID)

      curPres foreach (cp => {
        if (cp.id == msg.presentationID) {
           sharePresentation(msg.presentationID, false);
        }
      })
      
      outGW.send(new RemovePresentationOutMsg(msg.meetingID, recorded, msg.presentationID))
      
    }
    
    def handleGetPresentationInfo(msg: GetPresentationInfo) {
//      println("PresentationApp : handleGetPresentationInfo GetPresentationInfo for meeting [" + msg.meetingID + "] [" + msg.requesterID + "]" )
      
      val curPresenter = getCurrentPresenter;
      val presenter = new CurrentPresenter(curPresenter.presenterID, 
		                                   curPresenter.presenterName, 
		                                   curPresenter.assignedBy)
      val presentations = presModel.getPresentations
      val presentationInfo = new CurrentPresentationInfo(presenter, presentations)
      outGW.send(new GetPresentationInfoOutMsg(meetingID, recorded, msg.requesterID, presentationInfo, msg.replyTo))    
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
//      println("Received GotoSlide for meeting=[" +  msg.meetingID + "] page=[" + msg.page + "]")
//      println("*** Before change page ****")
//      printPresentations
      presModel.changePage(msg.page) foreach {page => 
//        println("Switching page for meeting=[" +  msg.meetingID + "] page=[" + page.id + "]")
        outGW.send(new GotoSlideOutMsg(meetingID, recorded, page))
      }
//      println("*** After change page ****")
//      printPresentations
    }
    
    def handleSharePresentation(msg: SharePresentation) {
      sharePresentation(msg.presentationID, msg.share)
    }
    
    def sharePresentation(presentationID: String, share: Boolean) {
      val pres = presModel.sharePresentation(presentationID)
      
      pres foreach { p =>
        outGW.send(new SharePresentationOutMsg(meetingID, recorded, p))
        
        presModel.getCurrentPage(p) foreach {page => 
          outGW.send(new GotoSlideOutMsg(meetingID, recorded, page))
        }
      }
      	      
    }
    
    def handleGetSlideInfo(msg: GetSlideInfo) {
      presModel.getCurrentPresentation foreach {pres =>
        presModel.getCurrentPage(pres) foreach {page =>
          outGW.send(new GetSlideInfoOutMsg(meetingID, recorded, msg.requesterID, page, msg.replyTo))           
        }       
      }

    }
    
    def printPresentations() {
      presModel.getPresentations foreach {pres =>
        println("presentation id=[" + pres.id + "] current=[" + pres.current + "]")
        pres.pages.values foreach {page =>
          println("page id=[" + page.id + "] current=[" + page.current + "]")
        }
      }
      
    }
    
}