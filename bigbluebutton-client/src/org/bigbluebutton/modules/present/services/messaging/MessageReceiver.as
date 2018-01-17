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
  import org.bigbluebutton.modules.present.events.OfficeDocConvertInvalidEvent;
  import org.bigbluebutton.modules.present.events.OfficeDocConvertSuccessEvent;
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
        case "SetCurrentPageEvtMsg":
          handleSetCurrentPageEvtMsg(message);
          break;
        case "ResizeAndMovePageEvtMsg":
          handleResizeAndMovePageEvtMsg(message);
          break;
        case "SetCurrentPresentationEvtMsg":
          handleSetCurrentPresentationEvtMsg(message);
          break;
        case "RemovePresentationEvtMsg":
          handleRemovePresentationEvtMsg(message);
          break;
        case "PresentationConversionCompletedEvtMsg":
          handlePresentationConversionCompletedEvtMsg(message);
          break;
        case "PresentationPageGeneratedEvtMsg":
          handlePresentationPageGeneratedEvtMsg(message);
          break;
        case "PresentationPageCountErrorEvtMsg":
          handlePresentationPageCountErrorEvtMsg(message);
          break;
        case "PresentationConversionUpdateEvtMsg":
          handlePresentationConversionUpdateEvtMsg(message);
          break;
        case "GetPresentationInfoRespMsg":
          handleGetPresentationInfoRespMsg(message);
          break;
      }
    }
    
    private function handleSetCurrentPageEvtMsg(msg:Object):void {
      service.pageChanged(msg.body.pageId);
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
    
    private function handleResizeAndMovePageEvtMsg(msg:Object):void {
      service.pageMoved(msg.body.pageId, msg.body.xOffset, msg.body.yOffset, msg.body.widthRatio, msg.body.heightRatio);
    }
    
    private function handleSetCurrentPresentationEvtMsg(msg:Object):void {
      service.changeCurrentPresentation(msg.body.presentationId);
    }
    
    private function handleRemovePresentationEvtMsg(msg:Object):void {
      service.removePresentation(msg.body.presentationId);
    }
    
    private function handlePresentationConversionCompletedEvtMsg(msg:Object):void {
      var presVO: PresentationVO = processUploadedPresentation(msg.body.presentation);
      
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
                                   presentation.current, presoPages, presentation.downloadable);
      return preso;
    }
    
    private function handlePresentationPageGeneratedEvtMsg(msg:Object):void {
      dispatcher.dispatchEvent(new ConversionUpdateEvent(msg.body.numberOfPages, msg.body.pagesCompleted));
    }
    
    private function handlePresentationPageCountErrorEvtMsg(msg:Object):void {
      dispatcher.dispatchEvent(new ConversionPageCountMaxed(msg.body.maxNumberPages as Number));
    }
    
    private function handlePresentationConversionUpdateEvtMsg(msg:Object):void {
      switch (msg.body.messageKey) {
        case Constants.OFFICE_DOC_CONVERSION_SUCCESS_KEY :
          dispatcher.dispatchEvent(new OfficeDocConvertSuccessEvent());
          break;
        case Constants.OFFICE_DOC_CONVERSION_FAILED_KEY :
          dispatcher.dispatchEvent(new OfficeDocConvertFailedEvent());
          break;
        case Constants.OFFICE_DOC_CONVERSION_INVALID_KEY :
          dispatcher.dispatchEvent(new OfficeDocConvertInvalidEvent());
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
            
    private function handleGetPresentationInfoRespMsg(msg:Object):void {
//      trace(LOG + "Getting presentations information");
      
      var presos:ArrayCollection = new ArrayCollection();
      var presentations:Array = msg.body.presentations as Array;
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
