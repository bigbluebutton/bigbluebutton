package org.bigbluebutton.modules.presentation.model.business
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ProgressNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	
	public class PresentSOService implements IPresentService
	{
		public static const NAME:String = "PresentSOService";

		private static const SHAREDOBJECT:String = "presentationSO";
		private static const PRESENTER:String = "presenter";
		private static const SHARING:String = "sharing";
		private static const UPDATE_MESSAGE:String = "updateMessage";
		private static const CURRENT_PAGE:String = "currentPage";
		
		private static const UPDATE_RC:String = "UPDATE";
		private static const SUCCESS_RC:String = "SUCCESS";
		private static const FAILED_RC:String = "FAILED";
		private static const EXTRACT_RC:String = "EXTRACT";
		private static const CONVERT_RC:String = "CONVERT";
		
		private var _presentationSO:SharedObject;
		
		private var _slides:IPresentationSlides;
		private var _module:PresentationModule;
		private var _connectionListener:Function;
		private var _messageSender:Function;
		private var _soErrors:Array;
		
		private var currentSlide:Number = -1;

		
		private var presentationNames:Array = new Array();
		
		
		public function PresentSOService(module:PresentationModule, slides:IPresentationSlides)
		{			
			_module = module;
			_slides = slides;			
		}
		
		public function connect():void {
//			netConnectionDelegate.connect();
			join();
			notifyConnectionStatusListener(true);
		}
			
		public function disconnect():void {
			leave();
			notifyConnectionStatusListener(false, ["Disconnected to presetation application"]);
//			netConnectionDelegate.disconnect();
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
		
	    private function join() : void
		{
			_presentationSO = SharedObject.getRemote(SHAREDOBJECT, _module.uri, false);			
			_presentationSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_presentationSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_presentationSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);			
			_presentationSO.client = this;
			_presentationSO.connect(_module.connection);
			LogUtil.debug(NAME + ": PresentationModule is connected to Shared object");
			notifyConnectionStatusListener(true);	
			if (_module.mode == 'LIVE')	getPresentationInfo();		
		}
		
	    private function leave():void
	    {
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
			//LogUtil.debug('sending zoomcallback');
			sendMessage(PresentModuleConstants.ZOOM_SLIDE, new ZoomNotifier(slideHeight, slideWidth));
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
			//LogUtil.debug('sending movecallback');
		   sendMessage(PresentModuleConstants.MOVE_SLIDE, new MoveNotifier(slideXPosition, slideYPosition));
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
			sendMessage(PresentModuleConstants.MAXIMIZE_PRESENTATION);
		}
		
		public function restore():void{
			_presentationSO.send("restoreCallback");
		}
		
		public function restoreCallback():void{
			sendMessage(PresentModuleConstants.RESTORE_PRESENTATION);
		}
		
		/**
		 * Send an event to the server to clear the presentation 
		 * 
		 */		
		public function clearPresentation() : void
		{
			_presentationSO.send("clearCallback");			
		}
		
		/**
		 * A call-back method for the clear method. This method is called when the clear method has
		 * successfuly called the server.
		 * 
		 */		
		public function clearCallback() : void
		{
			_presentationSO.setProperty(SHARING, false);
			sendMessage(PresentModuleConstants.CLEAR_EVENT);
		}

		public function setPresenterName(presenterName:String):void {
			_presentationSO.setProperty(PRESENTER, presenterName);
		}
		
		public function getPresentationInfo():void {
			var nc:NetConnection = _module.connection;
			nc.call(
				"presentation.getPresentationInfo",// Remote function name
				new Responder(
	        		// participants - On successful result
					function(result:Object):void { 	
						LogUtil.debug("Successfully querried for presentation information.");					 
						if (result.presenter.hasPresenter) {
							sendMessage(PresentModuleConstants.VIEWER_MODE);							
						}	
						
						if (result.presentation.sharing) {
							currentSlide = Number(result.presentation.slide);
							sendMessage(PresentModuleConstants.START_SHARE);
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
			var nc:NetConnection = _module.connection;
			nc.call(
				"presentation.assignPresenter",// Remote function name
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
			if (userid == _module.userid) {
				LogUtil.debug("assignPresenterCallback - sending presenter mode");
				sendMessage(PresentModuleConstants.PRESENTER_MODE, {userid:userid, presenterName:name, assignedBy:assignedBy});
			} else {
				LogUtil.debug("assignPresenterCallback - sending viewer mode");
				sendMessage(PresentModuleConstants.VIEWER_MODE);
			}
		}
		
		/**
		 * Send an event out to the server to go to a new page in the SlidesDeck 
		 * @param page
		 * 
		 */		
		public function gotoSlide(num:int) : void
		{
			var nc:NetConnection = _module.connection;
			nc.call(
				"presentation.gotoSlide",// Remote function name
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
		public function gotoSlideCallback(page : Number) : void
		{
			sendMessage(PresentModuleConstants.DISPLAY_SLIDE, page);
		}

		public function getCurrentSlideNumber():void {
			if (currentSlide >= 0) {
				sendMessage(PresentModuleConstants.DISPLAY_SLIDE, currentSlide);
			}				
		}
		
		public function sharePresentation(share:Boolean, presentationName:String):void {
			LogUtil.debug("PresentationSOService::sharePresentation()... presentationName=" + presentationName);
			var nc:NetConnection = _module.connection;
			nc.call(
				"presentation.sharePresentation",// Remote function name
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
				sendMessage(PresentModuleConstants.START_SHARE, {presentationName:presentationName});
			}
		}
		
		/**
		 * Event called automatically once a SharedObject Sync method is received 
		 * @param event
		 * 
		 */								
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			//LogUtil.debug( "Presentation::sharedObjectSyncHandler " + event.changeList.length);
		
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				//LogUtil.debug( "Presentation::handlingChanges[" + event.changeList[i].name + "][" + i + "]");
				handleChangesToSharedObject(event.changeList[i].code, 
						event.changeList[i].name, event.changeList[i].oldValue);
			}
		}
		
		/**
		 * See flash.events.SyncEvent
		 */
		private function handleChangesToSharedObject(code : String, name : String, oldValue : Object) : void
		{
			switch (name)
			{
				case UPDATE_MESSAGE:
//					if (presentation.isPresenter) {
						//LogUtil.debug( UPDATE_MESSAGE + " = [" + _presentationSO.data.updateMessage.returnCode + "]");
						processUpdateMessage(_presentationSO.data.updateMessage.returnCode);
//					}
					
					break;
															
				case SHARING :			
					if (_presentationSO.data[SHARING]) {
						//LogUtil.debug( "SHARING =[" + _presentationSO.data[SHARING] + "]");
						sendMessage(PresentModuleConstants.START_SHARE);	
					} else {
						//LogUtil.debug( "SHARING =[" + _presentationSO.data[SHARING] + "]");
					}
					break;

				case PRESENTER:
					if (_presentationSO.data[PRESENTER] != null)
						sendMessage(PresentModuleConstants.PRESENTER_NAME, _presentationSO.data[PRESENTER]);
					break;
							
				default:
					LogUtil.debug( "default = [" + code + "," + name + "," + oldValue + "]");				 
					break;
			}
		}
		
		/**
		 *  Called when there is an update from the server
		 * @param returnCode - an update message from the server
		 * 
		 */		
		private function processUpdateMessage(returnCode : String) : void
		{
			var totalSlides : Number;
			var completedSlides : Number;
			var message : String;
			
			switch (returnCode)
			{
				case SUCCESS_RC:
					LogUtil.debug("PresentSOService::processUpdateMessage() .... SUCCESS:presentationName=" + _presentationSO.data.updateMessage.presentationName);
					presentationNames.push({label:String(_presentationSO.data.updateMessage.presentationName)});
					var info:Object = new Object();
					info["message"] = _presentationSO.data.updateMessage.message;
					info["presentationName"] = _presentationSO.data.updateMessage.presentationName;
					sendMessage(PresentModuleConstants.CONVERT_SUCCESS_EVENT, info);
					break;
					
				case UPDATE_RC:
					message = _presentationSO.data.updateMessage.message;
					sendMessage(PresentModuleConstants.UPDATE_PROGRESS_EVENT, message);
					//LogUtil.debug("PresentationDelegate - UPDATE_RC");
					break;
										
				case FAILED_RC:
					//LogUtil.debug("PresentationDelegate - FAILED_RC");
					break;
				case EXTRACT_RC:
					totalSlides = _presentationSO.data.updateMessage.totalSlides;
					completedSlides = _presentationSO.data.updateMessage.completedSlides;
					LogUtil.debug( "EXTRACTING = [" + completedSlides + " of " + totalSlides + "]");					
					sendMessage(PresentModuleConstants.EXTRACT_PROGRESS_EVENT,
										new ProgressNotifier(totalSlides,completedSlides));
					
					break;
				case CONVERT_RC:
					totalSlides = _presentationSO.data.updateMessage.totalSlides;
					completedSlides = _presentationSO.data.updateMessage.completedSlides;
					LogUtil.debug( "CONVERTING = [" + completedSlides + " of " + totalSlides + "]");					
					sendMessage(PresentModuleConstants.CONVERT_PROGRESS_EVENT,
										new ProgressNotifier(totalSlides, completedSlides));							
					break;			
				default:
			
					break;	
			}															
		}		

		public function getPresentationNames():Array
		{
         	//presentationNames = [{label:"00"}, {label:"11"}, {label:"22"} ];
			return presentationNames;
		}

		private function notifyConnectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (_connectionListener != null) {
				_connectionListener(connected, errors);
			}
		}

		private function netStatusHandler (event:NetStatusEvent):void
		{
			var statusCode:String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success":
					LogUtil.debug(NAME + ":Connection Success");		
					//notifyConnectionStatusListener(true);			
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
					//addError("ChatSO " + event.info.code);
				   LogUtil.debug(NAME + ":default - " + event.info.code );
				   break;
			}
		}
			
		private function asyncErrorHandler (event:AsyncErrorEvent):void
		{
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