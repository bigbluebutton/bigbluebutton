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

class PresentationApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {

  private var currentPresentation = ""
  private var currentSlide = 0
  private var sharing = false
  private var xOffset = 0D
  private var yOffset = 0D
  private var widthRatio = 1D
  private var heightRatio = 1D
	
  /* cursor location */
  private var xPercent = 0D
  private var yPercent = 0D
	
  private var presentationIDs = new java.util.ArrayList[String]();
	
    def handleMessage(msg: InMessage):Unit = {
    	msg match {
    	  case clearPresentation: ClearPresentation => handleClearPresentation(clearPresentation)
    	  case presentationConversionUpdate: PresentationConversionUpdate => handlePresentationConversionUpdate(presentationConversionUpdate)
    	  case removePresentation: RemovePresentation => handleRemovePresentation(removePresentation)
    	  case getPresentationInfo : GetPresentationInfo => handleGetPresentationInfo(getPresentationInfo)
    	  case sendCursorUpdate : SendCursorUpdate => handleSendCursorUpdate(sendCursorUpdate)
    	  case resizeAndMoveSlide: ResizeAndMoveSlide => handleResizeAndMoveSlide(resizeAndMoveSlide)
    	  case gotoSlide: GotoSlide => handleGotoSlide(gotoSlide)
    	  case sharePresentation: SharePresentation => handleSharePresentation(sharePresentation)
    	  case getSlideInfo: GetSlideInfo => handleGetSlideInfo(getSlideInfo)
    	  case _ => // do nothing
    	}
    }
    
    private def handleClearPresentation(msg: ClearPresentation) {
      currentPresentation = ""
      sharing = false
      
    }
    
    private def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {
      
    }
    
    private def handleRemovePresentation(msg: RemovePresentation) {
      
    }
    
    private def handleGetPresentationInfo(msg: GetPresentationInfo) {
      
    }
    
    private def handleSendCursorUpdate(msg: SendCursorUpdate) {
      
    }
    
    private def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
      
    }
    
    private def handleGotoSlide(msg: GotoSlide) {
      
    }
    
    private def handleSharePresentation(msg: SharePresentation) {
      
    }
    
    private def handleGetSlideInfo(msg: GetSlideInfo) {
      
    }
    
}