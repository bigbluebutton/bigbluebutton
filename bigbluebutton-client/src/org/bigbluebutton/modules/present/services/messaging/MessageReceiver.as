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
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.present.events.ConversionCompletedEvent;
  import org.bigbluebutton.modules.present.events.ConversionPageCountError;
  import org.bigbluebutton.modules.present.events.ConversionPageCountMaxed;
  import org.bigbluebutton.modules.present.events.ConversionSupportedDocEvent;
  import org.bigbluebutton.modules.present.events.ConversionUnsupportedDocEvent;
  import org.bigbluebutton.modules.present.events.ConversionUpdateEvent;
  import org.bigbluebutton.modules.present.events.CreatingThumbnailsEvent;
  import org.bigbluebutton.modules.present.events.OfficeDocConvertFailedEvent;
  import org.bigbluebutton.modules.present.events.OfficeDocConvertSuccessEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  import org.bigbluebutton.modules.present.model.Presenter;
  import org.bigbluebutton.modules.present.services.Constants;
  import org.bigbluebutton.modules.present.services.PresentationService;
  import org.bigbluebutton.modules.present.services.messages.PageVO;
  import org.bigbluebutton.modules.present.services.messages.PresentationVO;
  
  public class MessageReceiver implements IMessageListener {
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);      
       
    private var service:PresentationService;
    private var dispatcher:Dispatcher;
    
    public function MessageReceiver(service: PresentationService) {
      this.service = service;
      BBB.initConnectionManager().addMessageListener(this);
      dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
      //LOGGER.info("Presentation: received message " + messageName);
      
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
      LOGGER.debug("*** handleGetSlideInfoReply {0} [DISABLED: SHouldn't be getting this!!] **** \n", [msg.msg]);
     
    }
    
    private function handlePresentationCursorUpdateCommand(msg:Object):void {    
//      trace(LOG + "*** handlePresentationCursorUpdateCommand " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);      
      if (map.hasOwnProperty("xPercent") && map.hasOwnProperty("yPercent")) {
        service.cursorMoved(map.xPercent, map.yPercent);
      }
    }
    
    private function handleGotoSlideCallback(msg:Object) : void {
      var map:Object = JSON.parse(msg.msg);

      var page:PageVO = extractPage(map);
      service.pageChanged(page);

    }
    
    private function validatePage(map:Object):Boolean {
      var missing:Array = new Array();
      
      if (! map.hasOwnProperty("id")) missing.push("Missing [id] param."); 
      if (! map.hasOwnProperty("num")) missing.push("Missing [num] param.");
      if (! map.hasOwnProperty("current")) missing.push("Missing [current] param.");
      if (! map.hasOwnProperty("swfUri")) missing.push("Missing [swfUri] param.");
      if (! map.hasOwnProperty("txtUri")) missing.push("Missing [txtUri] param.");
      if (! map.hasOwnProperty("svgUri")) missing.push("Missing [svgUri] param.");
      if (! map.hasOwnProperty("thumbUri")) missing.push("Missing [thumbUri] param.");
      if (! map.hasOwnProperty("xOffset")) missing.push("Missing [xOffset] param.");
      if (! map.hasOwnProperty("yOffset")) missing.push("Missing [yOffset] param.");
      if (! map.hasOwnProperty("widthRatio")) missing.push("Missing [widthRatio] param.");
      if (! map.hasOwnProperty("heightRatio")) missing.push("Missing [heightRatio] param.");
      
//      if (missing.length > 0) {
//        for (var i: int = 0; i < missing.length; i++) {
//          trace(LOG + missing[i]);
//        }
//      }
      
      if (map.hasOwnProperty("id") && map.hasOwnProperty("num") && map.hasOwnProperty("current") &&
        map.hasOwnProperty("swfUri") && map.hasOwnProperty("txtUri") && map.hasOwnProperty("svgUri") &&
        map.hasOwnProperty("thumbUri") && map.hasOwnProperty("xOffset") && map.hasOwnProperty("yOffset") &&
        map.hasOwnProperty("widthRatio") && map.hasOwnProperty("heightRatio")) {
        return true;
      }      
      
      return false;
    }
    
    
    private function extractPage(map:Object):PageVO {
      validatePage(map);
      
      var page:PageVO = new PageVO();
      page.id = map.id;
      page.num = map.num;
      page.current = map.current;
      page.swfUri = map.swfUri;
      page.txtUri = map.txtUri;
      page.svgUri = map.svgUri;
      page.thumbUri = map.thumbUri;
      page.xOffset = map.xOffset;
      page.yOffset = map.yOffset;
      page.widthRatio = map.widthRatio;
      page.heightRatio = map.heightRatio; 
      
      return page;
    }
    
    private function handleMoveCallback(msg:Object):void{  
      var map:Object = JSON.parse(msg.msg);      
      if (validatePage(map)) {
        service.pageMoved(extractPage(map));
      }
    }
    
    private function handleSharePresentationCallback(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      if (map.hasOwnProperty("presentation")) {
        var pres:Object = map.presentation as Object;
        var presVO: PresentationVO = processUploadedPresentation(pres)
        service.changePresentation(presVO);
      }
    }
    
    private function handleRemovePresentationCallback(msg:Object):void {
	  var map:Object = JSON.parse(msg.msg);
	  
	  if(map.hasOwnProperty("presentationID")) {
        service.removePresentation(map.presentationID);
	  }
    }
    
    private function handleConversionCompletedUpdateMessageCallback(msg:Object) : void { 
      var map:Object = JSON.parse(msg.msg);      
      var pres:Object = map.presentation as Object;
      var presVO: PresentationVO = processUploadedPresentation(pres)
      
      service.addPresentation(presVO);
      
      var uploadEvent:ConversionCompletedEvent = new ConversionCompletedEvent(presVO.id, presVO.name);
      dispatcher.dispatchEvent(uploadEvent);
              
    }
    
    private function processUploadedPresentation(presentation:Object):PresentationVO {
      var presoPages:ArrayCollection = new ArrayCollection();      
      var pages:Array = presentation.pages as Array;
      for (var k:int = 0; k < pages.length; k++) {
        var page:Object = pages[k] as Object;
        var pg:PageVO = extractPage(page)
        presoPages.addItem(pg);
      }
      
      var preso:PresentationVO = new PresentationVO(presentation.id, presentation.name, 
                                   presentation.current, presoPages);
      return preso;
    }
    
    private function handleGeneratedSlideUpdateMessageCallback(msg:Object) : void {		  
      var map:Object = JSON.parse(msg.msg);
      var numPages:Number = map.numberOfPages;
      var pagesDone:Number = map.pagesCompleted;
      
      dispatcher.dispatchEvent(new ConversionUpdateEvent(numPages, pagesDone));	
    }
    
    private function handlePageCountExceededUpdateMessageCallback(msg:Object) : void {     
      LOGGER.debug("handlePageCountExceededUpdateMessageCallback " + JSON.stringify(msg.msg));
      var map:Object = JSON.parse(msg.msg);
      dispatcher.dispatchEvent(new ConversionPageCountMaxed(map.maxNumberPages as Number));
    }
    
    private function handleConversionUpdateMessageCallback(msg:Object) : void {
      var map:Object = JSON.parse(msg.msg);
      
      var uploadEvent:UploadEvent;
      
      switch (map.messageKey) {
        case Constants.OFFICE_DOC_CONVERSION_SUCCESS_KEY :
          dispatcher.dispatchEvent(new OfficeDocConvertSuccessEvent());
          break;
        case Constants.OFFICE_DOC_CONVERSION_FAILED_KEY :
          dispatcher.dispatchEvent(new OfficeDocConvertFailedEvent());
          break;
        case Constants.SUPPORTED_DOCUMENT_KEY :
          dispatcher.dispatchEvent(new ConversionSupportedDocEvent());
          break;
        case Constants.UNSUPPORTED_DOCUMENT_KEY :
          dispatcher.dispatchEvent(new ConversionUnsupportedDocEvent());
          break;
        case Constants.GENERATING_THUMBNAIL_KEY :	
          dispatcher.dispatchEvent(new CreatingThumbnailsEvent());
          break;		
        case Constants.PAGE_COUNT_FAILED_KEY :
          dispatcher.dispatchEvent(new ConversionPageCountError());
          break;	
        case Constants.GENERATED_THUMBNAIL_KEY :
          break;
        default:
          break;
      }		

    }	
      
    private function handleGetPresentationInfoReply(msg:Object) : void {
//      trace(LOG + "*** handleGetPresentationInfoReply " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      
      var presenterMap:Object = map.presenter as Object;
      if (presenterMap.hasOwnProperty("userId") && presenterMap.hasOwnProperty("name") &&
        presenterMap.hasOwnProperty("assignedBy")) {
//        trace(LOG + "Got presenter information");
        var presenter: Presenter = new Presenter(presenterMap.userId, presenterMap.name, presenterMap.assignedBy);
        PresentationModel.getInstance().setPresenter(presenter);        
      }
      
//      trace(LOG + "Getting presentations information");
      
      var presos:ArrayCollection = new ArrayCollection();
      var presentations:Array = map.presentations as Array;
      for (var j:int = 0; j < presentations.length; j++) {
        var presentation:Object = presentations[j] as Object;     
//        trace(LOG + "Processing presentation information");
        var presVO: PresentationVO = processUploadedPresentation(presentation)
        presos.addItem(presVO);
      }
      
      service.removeAllPresentations();
      service.addPresentations(presos);
    }
    

    
  }
}