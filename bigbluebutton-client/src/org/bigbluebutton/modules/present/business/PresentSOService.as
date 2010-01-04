/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.present.business {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.present.events.MoveEvent;
	import org.bigbluebutton.modules.present.events.NavigationEvent;
	import org.bigbluebutton.modules.present.events.UploadEvent;
	import org.bigbluebutton.modules.present.events.ZoomEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
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
			_presentationSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_presentationSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
			_presentationSO.client = this;
			_presentationSO.connect(nc);
			LogUtil.debug(NAME + ": PresentationModule is connected to Shared object");
			notifyConnectionStatusListener(true);		
			getPresentationInfo();		
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
		 * Send an event to the server to update the clients with a new slide zoom ratio
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		public function zoom(slideHeight:Number, slideWidth:Number):void{
			_presentationSO.send("zoomCallback", slideHeight, slideWidth);
		}
		
		/**
		 * A callback method for zooming in a slide. Called once zoom gets executed 
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		public function zoomCallback(slideHeight:Number, slideWidth:Number):void{
			var e:ZoomEvent = new ZoomEvent(ZoomEvent.ZOOM);
			e.slideWidth = slideWidth;
			e.slideHeight = slideHeight;
			dispatcher.dispatchEvent(e);
		}
		
		/**
		 * Sends an event to the server to update the clients with the new slide position 
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		public function move(slideXPosition:Number, slideYPosition:Number):void{
			_presentationSO.send("moveCallback", slideXPosition, slideYPosition);
		}
		
		/**
		 * A callback method from the server to update the slide position 
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		public function moveCallback(slideXPosition:Number, slideYPosition:Number):void{
		   dispatcher.dispatchEvent(new MoveEvent(MoveEvent.MOVE, slideXPosition, slideYPosition));
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
		
		public function assignPresenter(userid:Number, name:String, assignedBy:Number):void {
			nc.call("presentation.assignPresenter",// Remote function name
				new Responder(
	        		// participants - On successful result
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
				userid,
				name,
				assignedBy
			); //_netConnection.call
		}
		
		/**
		 * Called by the server to assign a presenter
		 */
		public function assignPresenterCallback(userid:Number, name:String, assignedBy:Number):void {
			LogUtil.debug("assignPresenterCallback " + userid + "," + name + "," + assignedBy);
			if (this.userid == userid) {
				var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
				e.userid = userid;
				e.presenterName = name;
				e.assignerBy = assignedBy;
				dispatcher.dispatchEvent(e);
				
				setPresenterName(name);
			} else {
				var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
				viewerEvent.userid = userid;
				viewerEvent.presenterName = name;
				viewerEvent.assignerBy = assignedBy;
				dispatcher.dispatchEvent(viewerEvent);
			}
		}
		
		/**
		 * Send an event out to the server to go to a new page in the SlidesDeck 
		 * @param page
		 * 
		 */		
		public function gotoSlide(num:int) : void {
			nc.call("presentation.gotoSlide",// Remote function name
				new Responder(
	        		// participants - On successful result
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
	        		// participants - On successful result
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
				presentationName, // hardocde this for now...this will be used later to pre-upload multiple presentation
				share
			); //_netConnection.call
		}

		public function sharePresentationCallback(presentationName:String, share:Boolean):void {
			LogUtil.debug("sharePresentationCallback " + presentationName + "," + share);
			if (share) {
				var e:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
				e.presentationName = presentationName;
				dispatcher.dispatchEvent(e);
			}
		}
		
		public function pageCountExceededUpdateMessageCallback(conference:String, room:String, 
				code:String, presentationName:String, messageKey:String, numberOfPages:Number, 
				maxNumberOfPages:Number) : void {
			LogUtil.debug("pageCountExceededUpdateMessageCallback:Received update message " + messageKey);
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_ERROR);
			uploadEvent.data = ResourceUtil.getInstance().getString('bbb.presentation.error.convert.maxnbpagereach')
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
					break;
				case OFFICE_DOC_CONVERSION_FAILED_KEY :
					break;
				case SUPPORTED_DOCUMENT_KEY :
					break;
				case UNSUPPORTED_DOCUMENT_KEY :
					uploadEvent = new UploadEvent(UploadEvent.CONVERT_ERROR);
					uploadEvent.data = ResourceUtil.getInstance().getString('bbb.presentation.error.convert.format')
					dispatcher.dispatchEvent(uploadEvent);
					break;
				case GENERATING_THUMBNAIL_KEY :	
					dispatcher.dispatchEvent(new UploadEvent(UploadEvent.THUMBNAILS_UPDATE));
					break;			
				case PAGE_COUNT_FAILED_KEY :
					break;
				case GENERATED_THUMBNAIL_KEY :
					break;
			}														
		}	
				
		private function notifyConnectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (_connectionListener != null) {
				_connectionListener(connected, errors);
			}
		}

		private function netStatusHandler (event:NetStatusEvent):void {
			var statusCode:String = event.info.code;
			
			switch (statusCode) {
				case "NetConnection.Connect.Success":
					LogUtil.debug(NAME + ":Connection Success");			
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