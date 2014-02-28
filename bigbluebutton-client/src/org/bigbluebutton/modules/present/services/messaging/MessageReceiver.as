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
package org.bigbluebutton.modules.present.services.messaging
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.Conference;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.MoveEvent;
  import org.bigbluebutton.modules.present.events.NavigationEvent;
  import org.bigbluebutton.modules.present.events.PageChangedEvent;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.Presentation;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  import org.bigbluebutton.modules.present.model.Presenter;
  import org.bigbluebutton.modules.present.services.PresentationService;
  import org.bigbluebutton.modules.present.services.messages.CursorMovedMessage;
  import org.bigbluebutton.modules.present.services.messages.PageVO;
  import org.bigbluebutton.modules.present.services.messages.PresentationVO;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOG:String = "Present::MessageReceiver - ";
       
    private var service:PresentationService;
    
    public function MessageReceiver(service: PresentationService) {
      this.service = service;
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void {
//      trace("Presentation: received message " + messageName);
      
      switch (messageName) {
        case "PresentationCursorUpdateCommand":
          handlePresentationCursorUpdateCommand(message);
          break;			
        case "goToSlideCallback":
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
      trace(LOG + "*** handleGetSlideInfoReply " + msg.msg + " [DISABLED: SHouldn't be getting this!!] **** \n");
      
//      var map:Object = JSON.parse(msg.msg);
//      var e:MoveEvent = new MoveEvent(MoveEvent.CUR_SLIDE_SETTING);
//      e.xOffset = map.xOffset;
//      e.yOffset = map.yOffset;
//      e.slideToCanvasWidthRatio = map.widthRatio;
//      e.slideToCanvasHeightRatio = map.heightRatio;
//      dispatcher.dispatchEvent(e);	  
    }
    
    private function handlePresentationCursorUpdateCommand(msg:Object):void {    
//      trace(LOG + "*** handlePresentationCursorUpdateCommand " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);      
      if (map.hasOwnProperty("xPercent") && map.hasOwnProperty("yPercent")) {
        service.cursorMoved(map.xPercent, map.yPercent);
      }
    }
    
    private function handleGotoSlideCallback(msg:Object) : void {
      trace(LOG + "*** handleGotoSlideCallback " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      
      if (map.hasOwnProperty("id") && map.hasOwnProperty("num") && map.hasOwnProperty("current") &&
        map.hasOwnProperty("swfUri") && map.hasOwnProperty("txtUri") && map.hasOwnProperty("pngUri") &&
        map.hasOwnProperty("thumbUri") && map.hasOwnProperty("xOffset") && map.hasOwnProperty("yOffset") &&
        map.hasOwnProperty("widthRatio") && map.hasOwnProperty("heightRatio")) {
        
        var page:PageVO = extractPage(map);
        
        service.pageChanged(page);
      }
    }
    
    private function extractPage(map:Object):PageVO {
      var page:PageVO = new PageVO();
      page.id = map.id;
      page.num = map.num;
      page.current = map.current;
      page.swfUri = map.swfUri;
      page.txtUri = map.txtUri;
      page.pngUri = map.pngUri;
      page.thumbUri = map.thumbUri;
      page.xOffset = map.xOffset;
      page.yOffset = map.yOffset;
      page.widthRatio = map.widthRatio;
      page.heightRatio = map.heightRatio; 
      
      return page;
    }
    
    private function handleMoveCallback(msg:Object):void{
      trace(LOG + "*** handleMoveCallback " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      
      if (map.hasOwnProperty("id") && map.hasOwnProperty("xOffset")
        && map.hasOwnProperty("yOffset") && map.hasOwnProperty("widthRatio")
        && map.hasOwnProperty("heightRatio")) {
        service.pageChanged(extractPage(map));
      }
      
      trace(LOG + "TODO: handleMoveCallback [" + msg.xOffset + "," +  msg.yOffset + "][" +  msg.widthRatio + "," + msg.heightRatio + "]");
//      var e:MoveEvent = new MoveEvent(MoveEvent.MOVE);
//      e.xOffset = map.xOffset;
//      e.yOffset = map.yOffset;
//      e.slideToCanvasWidthRatio = map.widthRatio;
 //     e.slideToCanvasHeightRatio = map.heightRatio;
//      dispatcher.dispatchEvent(e);
    }
    
    private function handleSharePresentationCallback(msg:Object):void {
      trace(LOG + "*** handleSharePresentationCallback " + msg.msg + " **** \n");
      trace(LOG + "handleSharePresentationCallback - TODO: not needed as we should just use display page event"); 
      var map:Object = JSON.parse(msg.msg);
      if (map.hasOwnProperty("presentation")) {
        var presVO: PresentationVO = pocessUploadedPresentation(map)
        service.changePresentation(presVO);
      }
      
//      if (msg.share) {
//        var e:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
//        e.presentationName = map.presentationID;
//        dispatcher.dispatchEvent(e);
//      } else {
//        dispatcher.dispatchEvent(new UploadEvent(UploadEvent.CLEAR_PRESENTATION));
//      }
    }
    
    private function handleRemovePresentationCallback(msg:Object):void {
      trace(LOG + "***TODO: handleRemovePresentationCallback " + msg.msg + " **** \n");
      var e:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.PRESENTATION_REMOVED_EVENT);
      e.presentationName = msg.presentationID;
//      dispatcher.dispatchEvent(e);
    }
    
    private function handleConversionCompletedUpdateMessageCallback(msg:Object) : void {
      trace(LOG + "*** handleConversionCompletedUpdateMessageCallback " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);      
      var presVO: PresentationVO = pocessUploadedPresentation(map)
      service.changePresentation(presVO);
      
//      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
//      uploadEvent.data = CONVERSION_COMPLETED_KEY;
//      uploadEvent.presentationName = map.id;
//      dispatcher.dispatchEvent(uploadEvent);
      
//      dispatcher.dispatchEvent(new BBBEvent(BBBEvent.PRESENTATION_CONVERTED));
//      var readyEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
//      readyEvent.presentationName = map.id;
//      dispatcher.dispatchEvent(readyEvent);
    }
    
    private function pocessUploadedPresentation(presentation:Object):PresentationVO {
      var presoPages:ArrayCollection = new ArrayCollection();      
      var pages:ArrayCollection = presentation.pages as ArrayCollection;
      for (var k:int = 0; k < pages.length; k++) {
        var page:Object = pages[k];
        var pg:PageVO = extractPage(page)
        presoPages.addItem(pg);
      }
      
      var preso:PresentationVO = new PresentationVO(presentation.id, presentation.name, 
                                   presentation.current, pages);
      return preso;
    }
    
    private function handleGeneratedSlideUpdateMessageCallback(msg:Object) : void {		
      trace(LOG + "*** handleGeneratedSlideUpdateMessageCallback " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      
//      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_UPDATE);
//      uploadEvent.totalSlides = map.numberOfPages as Number;
//      uploadEvent.completedSlides = msg.pagesCompleted as Number;
//      dispatcher.dispatchEvent(uploadEvent);	
    }
    
    private function handlePageCountExceededUpdateMessageCallback(msg:Object) : void {
      trace(LOG + "*** handlePageCountExceededUpdateMessageCallback " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);
      
//      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.PAGE_COUNT_EXCEEDED);
////      uploadEvent.maximumSupportedNumberOfSlides = map.maxNumberPages as Number;
 //     dispatcher.dispatchEvent(uploadEvent);
    }
    
    private function handleConversionUpdateMessageCallback(msg:Object) : void {
      trace(LOG + "*** handleConversionUpdateMessageCallback " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);
/*      
      var uploadEvent:UploadEvent;
      
      switch (map.messageKey) {
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
*/
    }	
    
    private var currentSlide:Number = -1;
    
    private function handleGetPresentationInfoReply(msg:Object) : void {
      trace(LOG + "*** handleGetPresentationInfoReply " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      
      var presenterMap:Object = map.presenter;
      
      var presenter: Presenter = new Presenter(presenterMap.userId, presenterMap.name, presenterMap.assignedBy);
      PresentationModel.getInstance().setPresenter(presenter);
            
      var presentations:Array = map.presentations as Array;
      for (var j:int = 0; j < presentations.length; j++) {
        var presentation:Object = presentations[j];        
        pocessUploadedPresentation(presentation);
      }
           
//      var myUserId: String = UsersUtil.getMyUserID();
           
//      if (presenter.userId != myUserId) {
//        trace(LOG + " Making self viewer. myId=[" + myUserId + "] presenter=[" + presenter.userId + "]");
//        dispatcher.dispatchEvent(new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE));						
//      }	else {
//        trace(LOG + " Making self presenter. myId=[" + myUserId + "] presenter=[" + presenter.userId + "]");
//        dispatcher.dispatchEvent(new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE));
//      }
      
      var presNames:ArrayCollection = PresentationModel.getInstance().getPresentationNames();
          
//      if (presNames) {
//        trace(LOG + " ************ Getting list of presentations *************");
//        for (var x:int = 0; x < presNames.length; x++) {
//          sendPresentationName(presNames[x] as String);
//        }
//      }
           
      var curPresName:String = PresentationModel.getInstance().getCurrentPresentationName();
      
//      var shareEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
//      shareEvent.presentationName = curPresName;
//      dispatcher.dispatchEvent(shareEvent);
    }
    
//    private function sendPresentationName(presentationName:String):void {
//      trace(LOG + " **************** Sending presentation names");
//      var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
//      uploadEvent.presentationName = presentationName;
//      dispatcher.dispatchEvent(uploadEvent)
//    }
    
  }
}