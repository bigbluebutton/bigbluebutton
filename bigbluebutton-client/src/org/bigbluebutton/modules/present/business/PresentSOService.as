/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.present.business {
	import com.asfusion.mate.events.Dispatcher;	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.Conference;
	import org.bigbluebutton.modules.present.events.CursorEvent;
	import org.bigbluebutton.modules.present.events.MoveEvent;
	import org.bigbluebutton.modules.present.events.NavigationEvent;
	import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.events.ZoomEvent;
	
	public class PresentSOService {
		public static const NAME:String = "PresentSOService";

		private static const SHAREDOBJECT:String = "presentationSO";
		private static const PRESENTER:String = "presenter";
		private static const SHARING:String = "sharing";
		private static const UPDATE_MESSAGE:String = "updateMessage";
		private static const CURRENT_PAGE:String = "currentPage";

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
				
		private var nc:NetConnection;
		private var url:String;
		private var userid:Number;
		private var _presentationSO:SharedObject;
		private var dispatcher:Dispatcher;
		
		private var _connectionListener:Function;
		private var _messageSender:Function;
		private var _soErrors:Array;
		
		private var currentSlide:Number = -1;
		
		public function PresentSOService(connection:NetConnection, url:String, userid:Number){
			this.nc = connection;
			this.url = url;
			this.userid = userid;
			this.dispatcher = new Dispatcher();
		}
		
		public function connect():void {
			join();
			notifyConnectionStatusListener(true);
		}
			
		public function disconnect():void {
			leave();
			notifyConnectionStatusListener(false, ["Disconnected from presentation application"]);
		}
		
		private function connectionListener(connected:Boolean, errors:Array=null):void {
			if (connected) {
				join();
				notifyConnectionStatusListener(true);
			} else {
				leave();
				notifyConnectionStatusListener(false, errors);
			}
		}
		
	    private function join() : void {
			_presentationSO = SharedObject.getRemote(SHAREDOBJECT, url, false);	
			_presentationSO.client = this;
			_presentationSO.addEventListener(SyncEvent.SYNC, syncHandler);
			_presentationSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_presentationSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);					
			_presentationSO.connect(nc);
			LogUtil.debug(NAME + ": PresentationModule is connected to Shared object");
				
		}
		
	    private function leave():void {
	    	if (_presentationSO != null) _presentationSO.close();
	    }

		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionListener = connectionListener;
		}
		
		public function addMessageSender(msgSender:Function):void {
			_messageSender = msgSender;
		}
		
		private function sendMessage(msg:String, body:Object=null):void {
			if (_messageSender != null) _messageSender(msg, body);
		}
		
		/**
		 * Send an event to the server to resize the clients view of the slide in percentage increments
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		public function zoom(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
			move(xOffset, yOffset, widthRatio, heightRatio);
		}
		
		/**
		 * A callback method for zooming in a slide. Called when preseter zooms the slide
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		public function zoomCallback(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
			var e:ZoomEvent = new ZoomEvent(ZoomEvent.ZOOM);
			e.xOffset = xOffset;
			e.yOffset = yOffset;
			e.slideToCanvasWidthRatio = widthRatio;
			e.slideToCanvasHeightRatio = heightRatio;
			dispatcher.dispatchEvent(e);
		}
		
		/**
		 * Send an event to the server to update the presenter's cursor view on the client 
		 * @param xPercent
		 * @param yPercent
		 * 
		 */		
		public function sendCursorUpdate(xPercent:Number, yPercent:Number):void{
			_presentationSO.send("updateCursorCallback", xPercent, yPercent);
		}
		
		/**
		 * A callback method for the cursor update. Called whenever the presenter moves the mouse within the present window
		 * @param xPercent
		 * @param yPercent
		 * 
		 */		
		public function updateCursorCallback(xPercent:Number, yPercent:Number):void{
			var e:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR);
			e.xPercent = xPercent;
			e.yPercent = yPercent;
			dispatcher.dispatchEvent(e);
		}
		
		/**
		 * Send an event to the server to update the size of the slide shows, as a percentage of the default value 
		 * @param newSizeInPercent
		 * 
		 */		
		public function resizeSlide(newSizeInPercent:Number):void{
			_presentationSO.send("resizeSlideCallback", newSizeInPercent);
		}
		
		public function resizeSlideCallback(newSizeInPercent:Number):void{
			var e:ZoomEvent = new ZoomEvent(ZoomEvent.RESIZE);
			e.zoomPercentage = newSizeInPercent;
			dispatcher.dispatchEvent(e);
		}
		
		/**
		 * Sends an event to the server to update the clients with the new slide position 
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		public function move(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
			//_presentationSO.send("moveCallback", xOffset, yOffset, widthRatio, heightRatio);
			nc.call("presentation.resizeAndMoveSlide",// Remote function name
				new Responder(
	        		// participants - On successful result
					function(result:Boolean):void { 
						 
						if (result) {
							LogUtil.debug("Successfully sent resizeAndMoveSlide");							
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
							} 
					}
				), //new Responder
				xOffset,
				yOffset,
				widthRatio,
				heightRatio
			); //_netConnection.call
			
			presenterViewedRegionX = xOffset;
			presenterViewedRegionY = yOffset;
			presenterViewedRegionW = widthRatio;
			presenterViewedRegionH = heightRatio;
		}
		
		/**
		 * A callback method from the server to update the slide position 
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		public function moveCallback(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
			var e:MoveEvent = new MoveEvent(MoveEvent.MOVE);
			e.xOffset = xOffset;
			e.yOffset = yOffset;
			e.slideToCanvasWidthRatio = widthRatio;
			e.slideToCanvasHeightRatio = heightRatio;
			dispatcher.dispatchEvent(e);
		}
		
		/***
		 * A hack for the viewer to sync with the presenter. Have the viewer query the presenter for it's x,y,width and height info.
		 */
		private var presenterViewedRegionX:Number = 0;
		private var presenterViewedRegionY:Number = 0;
		private var presenterViewedRegionW:Number = 100;
		private var presenterViewedRegionH:Number = 100;
		
		private function queryPresenterForSlideInfo():void {
			LogUtil.debug("Query for slide info");
			_presentationSO.send("whatIsTheSlideInfo", UserManager.getInstance().getConference().getMyUserId());
		}
		
		public function whatIsTheSlideInfo(userid:Number):void {
			LogUtil.debug("Rx Query for slide info");
			if (UserManager.getInstance().getConference().amIPresenter()) {
				LogUtil.debug("User Query for slide info");
				_presentationSO.send("whatIsTheSlideInfoReply", userid, presenterViewedRegionX, presenterViewedRegionY, presenterViewedRegionW, presenterViewedRegionH);
			}
		}
		
		public function whatIsTheSlideInfoReply(userId:Number, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
			LogUtil.debug("Rx whatIsTheSlideInfoReply");
			if (UserManager.getInstance().getConference().amIThisUser(userId)) {
				LogUtil.debug("Got reply for Query for slide info");
				var e:MoveEvent = new MoveEvent(MoveEvent.CUR_SLIDE_SETTING);
				e.xOffset = xOffset;
				e.yOffset = yOffset;
				e.slideToCanvasWidthRatio = widthRatio;
				e.slideToCanvasHeightRatio = heightRatio;
				dispatcher.dispatchEvent(e);				
			}

		}
		
		
		/**
		 * Sends an event out for the clients to maximize the presentation module 
		 * 
		 */		
		public function maximize():void{
			_presentationSO.send("maximizeCallback");
		}
		
		/**
		 * A callback method from the server to maximize the presentation 
		 * 
		 */		
		public function maximizeCallback():void{
			dispatcher.dispatchEvent(new ZoomEvent(ZoomEvent.MAXIMIZE));
		}
		
		public function restore():void{
			_presentationSO.send("restoreCallback");
		}
		
		public function restoreCallback():void{
			dispatcher.dispatchEvent(new ZoomEvent(ZoomEvent.RESTORE));
		}
		
		/**
		 * Send an event to the server to clear the presentation 
		 * 
		 */		
		public function clearPresentation() : void {
			_presentationSO.send("clearCallback");			
		}
		
		public function removePresentation(name:String):void {
			nc.call("presentation.removePresentation",// Remote function name
				new Responder(
					function(result:Boolean):void { 						 
						if (result) {
							LogUtil.debug("Successfully assigned presenter to: " + userid);							
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
							} 
					}
				), //new Responder
				name
			); //_netConnection.call
		}
		
		/**
		 * A call-back method for the clear method. This method is called when the clear method has
		 * successfuly called the server.
		 * 
		 */		
		public function clearCallback() : void {
			_presentationSO.setProperty(SHARING, false);
			dispatcher.dispatchEvent(new UploadEvent(UploadEvent.CLEAR_PRESENTATION));
		}

		public function setPresenterName(presenterName:String):void {
			_presentationSO.setProperty(PRESENTER, presenterName);
		}
		
		public function getPresentationInfo():void {
			nc.call( "presentation.getPresentationInfo",// Remote function name
				new Responder(
	        		// participants - On successful result
					function(result:Object):void { 	
						LogUtil.debug("Successfully querried for presentation information.");					 
						if (result.presenter.hasPresenter) {
							dispatcher.dispatchEvent(new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE));						
						}	

						if (result.presentation.xOffset) {
							LogUtil.debug("Sending presenters slide settings");
							var e:MoveEvent = new MoveEvent(MoveEvent.CUR_SLIDE_SETTING);
							e.xOffset = Number(result.presentation.xOffset);
							e.yOffset = Number(result.presentation.yOffset);
							e.slideToCanvasWidthRatio = Number(result.presentation.widthRatio);
							e.slideToCanvasHeightRatio = Number(result.presentation.heightRatio);
							LogUtil.debug("****presenter settings [" + e.xOffset + "," + e.yOffset + "," + e.slideToCanvasWidthRatio + "," + e.slideToCanvasHeightRatio + "]");
							dispatcher.dispatchEvent(e);
						}
						if (result.presentations) {
							for(var p:Object in result.presentations) {
								var u:Object = result.presentations[p]
								LogUtil.debug("Presentation name " + u as String);
								sendPresentationName(u as String);
							}
						}
						
						// Force switching the presenter.
						triggerSwitchPresenter();
						
						if (result.presentation.sharing) {							
							currentSlide = Number(result.presentation.slide);
							LogUtil.debug("The presenter has shared slides and showing slide " + currentSlide);
							var shareEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
							shareEvent.presentationName = String(result.presentation.currentPresentation);
							dispatcher.dispatchEvent(shareEvent);
						}
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
							} 
					}
				) //new Responder
			); //_netConnection.call
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
			
			var dispatcher:Dispatcher = new Dispatcher();
			var meeting:Conference = UserManager.getInstance().getConference();
			if (meeting.amIPresenter()) {		
				LogUtil.debug("trigger Switch to Presenter mode ");
				var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
				e.userid = meeting.getMyUserId();
				e.presenterName = meeting.getMyName();
				e.assignerBy = meeting.getMyUserId();
				
				dispatcher.dispatchEvent(e);													
			} else {				
				
				var p:BBBUser = meeting.getPresenter();
				if (p != null) {
					LogUtil.debug("trigger Switch to Viewer mode ");
					var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
					viewerEvent.userid = p.userid;
					viewerEvent.presenterName = p.name;
					viewerEvent.assignerBy = p.userid;
					
					dispatcher.dispatchEvent(viewerEvent);					
				}
			}
		}
		
		private function sendPresentationName(presentationName:String):void {
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
			uploadEvent.presentationName = presentationName;
			dispatcher.dispatchEvent(uploadEvent)
		}
					
		/**
		 * Send an event out to the server to go to a new page in the SlidesDeck 
		 * @param page
		 * 
		 */		
		public function gotoSlide(num:int) : void {
			nc.call("presentation.gotoSlide",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Boolean):void { 
						 
						if (result) {
							LogUtil.debug("Successfully moved page to: " + num);							
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
							} 
					}
				), //new Responder
				num
			); //_netConnection.call
		}
		
		/**
		 * A callback method. It is called after the gotoPage method has successfully executed on the server
		 * The method sets the clients view to the page number received 
		 * @param page
		 * 
		 */		
		public function gotoSlideCallback(page : Number) : void {
			var e:NavigationEvent = new NavigationEvent(NavigationEvent.GOTO_PAGE)
			e.pageNumber = page;
			dispatcher.dispatchEvent(e);
		}

		public function getCurrentSlideNumber():void {
			if (currentSlide >= 0) {
				var e:NavigationEvent = new NavigationEvent(NavigationEvent.GOTO_PAGE)
				e.pageNumber = currentSlide;
				dispatcher.dispatchEvent(e);
			}
		}
		
		public function sharePresentation(share:Boolean, presentationName:String):void {
			LogUtil.debug("PresentationSOService::sharePresentation()... presentationName=" + presentationName);
			nc.call("presentation.sharePresentation",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Boolean):void { 
						
						if (result) {
							LogUtil.debug("Successfully shared presentation");							
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
							} 
					}
				), //new Responder
				presentationName,
				share
			); //_netConnection.call
		}

		public function sharePresentationCallback(presentationName:String, share:Boolean):void {
			LogUtil.debug("sharePresentationCallback " + presentationName + "," + share);
			if (share) {
				var e:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
				e.presentationName = presentationName;
				dispatcher.dispatchEvent(e);
			} else {
				dispatcher.dispatchEvent(new UploadEvent(UploadEvent.CLEAR_PRESENTATION));
			}
		}
		
		public function removePresentationCallback(presentationName:String):void {
			LogUtil.debug("removePresentationCallback " + presentationName);
			var e:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.PRESENTATION_REMOVED_EVENT);
			e.presentationName = presentationName;
			dispatcher.dispatchEvent(e);
		}
		
		public function pageCountExceededUpdateMessageCallback(conference:String, room:String, 
				code:String, presentationName:String, messageKey:String, numberOfPages:Number, 
				maxNumberOfPages:Number) : void {
			LogUtil.debug("pageCountExceededUpdateMessageCallback:Received update message " + messageKey);
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.PAGE_COUNT_EXCEEDED);
			uploadEvent.maximumSupportedNumberOfSlides = maxNumberOfPages;
			dispatcher.dispatchEvent(uploadEvent);
		}

		public function generatedSlideUpdateMessageCallback(conference:String, room:String, 
				code:String, presentationName:String, messageKey:String, numberOfPages:Number, 
				pagesCompleted:Number) : void {
			LogUtil.debug( "CONVERTING = [" + pagesCompleted + " of " + numberOfPages + "]");					
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_UPDATE);
			uploadEvent.totalSlides = numberOfPages;
			uploadEvent.completedSlides = pagesCompleted;
			dispatcher.dispatchEvent(uploadEvent);	
		}

		public function conversionCompletedUpdateMessageCallback(conference:String, room:String, 
				code:String, presentationName:String, messageKey:String, slidesInfo:String) : void {
			LogUtil.debug("conversionCompletedUpdateMessageCallback:Received update message " + messageKey);
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
			uploadEvent.data = messageKey;
			uploadEvent.presentationName = presentationName;
			dispatcher.dispatchEvent(uploadEvent);
			dispatcher.dispatchEvent(new BBBEvent(BBBEvent.PRESENTATION_CONVERTED));
			var readyEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
			readyEvent.presentationName = presentationName;
			dispatcher.dispatchEvent(readyEvent);
		}
				
		public function conversionUpdateMessageCallback(conference:String, room:String, 
			code:String, presentationName:String, messageKey:String) : void {
			LogUtil.debug("conversionUpdateMessageCallback:Received update message " + messageKey);
			var totalSlides : Number;
			var completedSlides : Number;
			var message : String;
			var uploadEvent:UploadEvent;
			
			switch (messageKey) {
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
					LogUtil.warn("conversionUpdateMessageCallback:GENERATED_THUMBNAIL_KEY " + messageKey);
					break;
				default:
					LogUtil.warn("conversionUpdateMessageCallback:Unknown message " + messageKey);
					break;
			}														
		}	
				
		private function notifyConnectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (_connectionListener != null) {
				_connectionListener(connected, errors);
			}
		}

		private function syncHandler(event:SyncEvent):void {
	//		var statusCode:String = event.info.code;
			LogUtil.debug("!!!!! Presentation sync handler - " + event.changeList.length );
			notifyConnectionStatusListener(true);		
			getPresentationInfo();	
			queryPresenterForSlideInfo();
		}
		
		private function netStatusHandler (event:NetStatusEvent):void {
			var statusCode:String = event.info.code;
			LogUtil.debug("!!!!! Presentation status handler - " + event.info.code );
			switch (statusCode) {
				case "NetConnection.Connect.Success":
					LogUtil.debug(NAME + ":Connection Success");
					notifyConnectionStatusListener(true);		
					getPresentationInfo();	
					break;			
				case "NetConnection.Connect.Failed":
					addError("PresentSO connection failed");			
					break;					
				case "NetConnection.Connect.Closed":
					addError("Connection to PresentSO was closed.");									
					notifyConnectionStatusListener(false, _soErrors);
					break;					
				case "NetConnection.Connect.InvalidApp":
					addError("PresentSO not found in server");				
					break;					
				case "NetConnection.Connect.AppShutDown":
					addError("PresentSO is shutting down");
					break;					
				case "NetConnection.Connect.Rejected":
					addError("No permissions to connect to the PresentSO");
					break;					
				default :
				   LogUtil.debug(NAME + ":default - " + event.info.code );
				   break;
			}
		}
			
		private function asyncErrorHandler (event:AsyncErrorEvent):void {
			addError("PresentSO asynchronous error.");
		}
		
		private function addError(error:String):void {
			if (_soErrors == null) {
				_soErrors = new Array();
			}
			_soErrors.push(error);
		}
	}
}