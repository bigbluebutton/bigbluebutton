/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.Conference;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.MoveEvent;
  import org.bigbluebutton.modules.present.events.NavigationEvent;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOG:String = "Present::MessageReceiver - ";
    
    private static const OFFICE_DOC_CONVERSION_SUCCESS_KEY:String = "OFFICE_DOC_CONVERSION_SUCCESS";
    private static const OFFICE_DOC_CONVERSION_FAILED_KEY:String = "OFFICE_DOC_CONVERSION_FAILED";
    private static const SUPPORTED_DOCUMENT_KEY:String = "SUPPORTED_DOCUMENT";
    private static const UNSUPPORTED_DOCUMENT_KEY:String = "UNSUPPORTED_DOCUMENT";
    private static const PAGE_COUNT_FAILED_KEY:String = "PAGE_COUNT_FAILED";
    private static const PAGE_COUNT_EXCEEDED_KEY:String = "PAGE_COUNT_EXCEEDED";    	
    private static const GENERATED_SLIDE_KEY:String = "GENERATED_SLIDE";
    private static const GENERATING_THUMBNAIL_KEY:String = "GENERATING_THUMBNAIL";
    private static const GENERATED_THUMBNAIL_KEY:String = "GENERATED_THUMBNAIL";
    private static const CONVERSION_COMPLETED_KEY:String = "CONVERSION_COMPLETED";
    
    private var dispatcher:Dispatcher;
    
    private var presModel:PresentationModel;
    
    public function MessageReceiver(presModel: PresentationModel) {
      this.presModel = presModel;
      BBB.initConnectionManager().addMessageListener(this);
      this.dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
      trace("Presentation: received message " + messageName);
      
      switch (messageName) {
        case "PresentationCursorUpdateCommand":
          handlePresentationCursorUpdateCommand(message);
          break;			
        case "gotoSlideCallback":
          handleGotoSlideCallback(message);
          break;			
        case "moveCallback":
          handleMoveCallback(message);
          break;	
        case "sharePresentationCallback":
          handleSharePresentationCallback(message);
          break;
        case "removePresentationCallback":
          handleRemovePresentationCallback(message);
          break;
        case "conversionCompletedUpdateMessageCallback":
          handleConversionCompletedUpdateMessageCallback(message);
          break;
        case "generatedSlideUpdateMessageCallback":
          handleGeneratedSlideUpdateMessageCallback(message);
          break;
        case "pageCountExceededUpdateMessageCallback":
          handlePageCountExceededUpdateMessageCallback(message);
          break;
        case "conversionUpdateMessageCallback":
          handleConversionUpdateMessageCallback(message);
          break;
        case "getPresentationInfoReply":
          handleGetPresentationInfoReply(message);
          break;
        case "getSlideInfoReply":
          handleGetSlideInfoReply(message);
          break;
      }
    }  
    
    private function handleGetSlideInfoReply(msg:Object):void {
      var e:MoveEvent = new MoveEvent(MoveEvent.CUR_SLIDE_SETTING);
      e.xOffset = msg.xOffset;
      e.yOffset = msg.yOffset;
      e.slideToCanvasWidthRatio = msg.widthRatio;
      e.slideToCanvasHeightRatio = msg.heightRatio;
      dispatcher.dispatchEvent(e);	  
    }
    
    private function handlePresentationCursorUpdateCommand(message:Object):void {    
      var e:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR);
      e.xPercent = message.xPercent;
      e.yPercent = message.yPercent;
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(e);
    }
    
    private function handleGotoSlideCallback(msg:Object) : void {
      presModel.curSlideNum = msg.pageNum;
      
      var e:NavigationEvent = new NavigationEvent(NavigationEvent.GOTO_PAGE)
      e.pageNumber = msg.pageNum;
      dispatcher.dispatchEvent(e);
    }
    
    private function handleMoveCallback(msg:Object):void{
      trace(LOG + "handleMoveCallback [" + msg.xOffset + "," +  msg.yOffset + "][" +  msg.widthRatio + "," + msg.heightRatio + "]");
      var e:MoveEvent = new MoveEvent(MoveEvent.MOVE);
      e.xOffset = msg.xOffset;
      e.yOffset = msg.yOffset;
      e.slideToCanvasWidthRatio = msg.widthRatio;
      e.slideToCanvasHeightRatio = msg.heightRatio;
      dispatcher.dispatchEvent(e);
    }
    
    private function handleSharePresentationCallback(msg:Object):void {
      if (msg.share) {
        var e:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
        e.presentationName = msg.presentationID;
        dispatcher.dispatchEvent(e);
      } else {
        dispatcher.dispatchEvent(new UploadEvent(UploadEvent.CLEAR_PRESENTATION));
      }
    }
    
    private function handleRemovePresentationCallback(msg:Object):void {
      var e:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.PRESENTATION_REMOVED_EVENT);
      e.presentationName = msg.presentationID;
      dispatcher.dispatchEvent(e);
    }
    
    private function handleConversionCompletedUpdateMessageCallback(msg:Object) : void {

      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
      uploadEvent.data = msg.messageKey;
      uploadEvent.presentationName = msg.presentationID;
      dispatcher.dispatchEvent(uploadEvent);
      
      dispatcher.dispatchEvent(new BBBEvent(BBBEvent.PRESENTATION_CONVERTED));
      var readyEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
      readyEvent.presentationName = msg.presentationID;
      dispatcher.dispatchEvent(readyEvent);
    }
    
    private function handleGeneratedSlideUpdateMessageCallback(msg:Object) : void {				
      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_UPDATE);
      uploadEvent.totalSlides = msg.maxNumberPages;
      uploadEvent.completedSlides = msg.pagesCompleted;
      dispatcher.dispatchEvent(uploadEvent);	
    }
    
    private function handlePageCountExceededUpdateMessageCallback(msg:Object) : void {
      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.PAGE_COUNT_EXCEEDED);
      uploadEvent.maximumSupportedNumberOfSlides = msg.maxNumberPages;
      dispatcher.dispatchEvent(uploadEvent);
    }
    
    private function handleConversionUpdateMessageCallback(msg:Object) : void {

      var totalSlides : Number;
      var completedSlides : Number;
      var message : String;
      var uploadEvent:UploadEvent;
      
      switch (msg.messageKey) {
        case OFFICE_DOC_CONVERSION_SUCCESS_KEY :
          uploadEvent = new UploadEvent(UploadEvent.OFFICE_DOC_CONVERSION_SUCCESS);
          dispatcher.dispatchEvent(uploadEvent);
          break;
        case OFFICE_DOC_CONVERSION_FAILED_KEY :
          uploadEvent = new UploadEvent(UploadEvent.OFFICE_DOC_CONVERSION_FAILED);
          dispatcher.dispatchEvent(uploadEvent);
          break;
        case SUPPORTED_DOCUMENT_KEY :
          uploadEvent = new UploadEvent(UploadEvent.SUPPORTED_DOCUMENT);
          dispatcher.dispatchEvent(uploadEvent);
          break;
        case UNSUPPORTED_DOCUMENT_KEY :
          uploadEvent = new UploadEvent(UploadEvent.UNSUPPORTED_DOCUMENT);
          dispatcher.dispatchEvent(uploadEvent);
          break;
        case GENERATING_THUMBNAIL_KEY :	
          dispatcher.dispatchEvent(new UploadEvent(UploadEvent.THUMBNAILS_UPDATE));
          break;		
        case PAGE_COUNT_FAILED_KEY :
          uploadEvent = new UploadEvent(UploadEvent.PAGE_COUNT_FAILED);
          dispatcher.dispatchEvent(uploadEvent);
          break;	
        case GENERATED_THUMBNAIL_KEY :
          break;
        default:
          break;
      }														
    }	
    
    private var currentSlide:Number = -1;
    
    private function handleGetPresentationInfoReply(msg:Object) : void {
      trace(LOG + "has-presenter=[" + msg.presenter.hasPresenter + "]");
      
      if (msg.presenter.hasPresenter) {
        dispatcher.dispatchEvent(new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE));						
      }	
      
      trace(LOG + " ************** msg.presentation.xOffset [" + msg.presentation.xOffset +"] ***********");
      
      if (msg.presentation.xOffset) {
        var e:MoveEvent = new MoveEvent(MoveEvent.CUR_SLIDE_SETTING);
        e.xOffset = Number(msg.presentation.xOffset);
        e.yOffset = Number(msg.presentation.yOffset);
        e.slideToCanvasWidthRatio = Number(msg.presentation.widthRatio);
        e.slideToCanvasHeightRatio = Number(msg.presentation.heightRatio);
        
        trace(LOG + " **************Dispatching MoveEvent.CUR_SLIDE_SETTING ***********");
        dispatcher.dispatchEvent(e);
      }
      
      if (msg.presentations) {
        trace(LOG + " ************ Getting list of presentations *************");
        for(var p:Object in msg.presentations) {
          var u:Object = msg.presentations[p]
          sendPresentationName(u as String);
        }
      }
      
      // Force switching the presenter.
      triggerSwitchPresenter();
      
      if (msg.presentation.sharing) {							
        currentSlide = Number(msg.presentation.slide);
        trace(LOG + "**** Trigger sharing presentation of [" + msg.presentation.currentPresentation + "]");
        
        var shareEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
        shareEvent.presentationName = String(msg.presentation.currentPresentation);
        dispatcher.dispatchEvent(shareEvent);
      }      
    }
    
    private function sendPresentationName(presentationName:String):void {
      trace(LOG + " **************** Sending presentation names");
      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
      uploadEvent.presentationName = presentationName;
      dispatcher.dispatchEvent(uploadEvent)
    }
    
    /***
     * NOTE:
     * This is a workaround to trigger the UI to switch to presenter or viewer.
     * The reason is that when the user joins, the MadePresenterEvent in UserServiceSO
     * doesn't get received by the modules as the modules hasn't started yet. 
     * Need to redo the proper sequence of events but will take a lot of changes.
     * (ralam dec 8, 2011).
     */
    public function triggerSwitchPresenter():void {
      trace(LOG + "****** triggerSwitchPresenter ***** ");
      
      var dispatcher:Dispatcher = new Dispatcher();
      var meeting:Conference = UserManager.getInstance().getConference();
      if (meeting.amIPresenter) {		
        trace(LOG + "PresentSOService:: trigger Switch to Presenter mode ");
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
        e.userID = meeting.getMyUserId();
        e.presenterName = meeting.getMyName();
        e.assignerBy = meeting.getMyUserId();
        
        dispatcher.dispatchEvent(e);													
      } else {				
        
        var p:BBBUser = meeting.getPresenter();
        if (p != null) {
          trace(LOG + " trigger Switch to Presenter mode ");
          var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
          viewerEvent.userID = p.userID;
          viewerEvent.presenterName = p.name;
          viewerEvent.assignerBy = p.userID;
          
          dispatcher.dispatchEvent(viewerEvent);					
        }
      }
    }
  }
}