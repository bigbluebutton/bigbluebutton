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
			if (UserManager.getInstance().getConference().amIPresenter) {
				LogUtil.debug("User Query for slide info");
				_presentationSO.send("whatIsTheSlideInfoReply", userid, presenterViewedRegionX, presenterViewedRegionY, presenterViewedRegionW, presenterViewedRegionH);
			}
		}
		
		public function whatIsTheSlideInfoReply(userID:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
			LogUtil.debug("Rx whatIsTheSlideInfoReply");
			if (UserManager.getInstance().getConference().amIThisUser(userID)) {
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
			
		private function sendPresentationName(presentationName:String):void {
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CONVERT_SUCCESS);
			uploadEvent.presentationName = presentationName;
			dispatcher.dispatchEvent(uploadEvent)
		}
					
		public function getCurrentSlideNumber():void {
			if (currentSlide >= 0) {
				var e:NavigationEvent = new NavigationEvent(NavigationEvent.GOTO_PAGE)
				e.pageNumber = currentSlide;
				dispatcher.dispatchEvent(e);
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
			queryPresenterForSlideInfo();
		}
		
		private function netStatusHandler (event:NetStatusEvent):void {
			var statusCode:String = event.info.code;
			LogUtil.debug("!!!!! Presentation status handler - " + event.info.code );
			switch (statusCode) {
				case "NetConnection.Connect.Success":
					LogUtil.debug(NAME + ":Connection Success");
					notifyConnectionStatusListener(true);		
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