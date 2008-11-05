package org.bigbluebutton.modules.presentation.model.business
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ProgressNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	
	public class PresentSOService implements IPresentService
	{
		public static const NAME:String = "PresentSOService";

		private static const SHAREDOBJECT : String = "presentationSO";
		private static const PRESENTER : String = "presenter";
		private static const SHARING : String = "sharing";
		private static const UPDATE_MESSAGE : String = "updateMessage";
		private static const CURRENT_PAGE : String = "currentPage";
		
		private static const UPDATE_RC : String = "UPDATE";
		private static const SUCCESS_RC : String = "SUCCESS";
		private static const FAILED_RC : String = "FAILED";
		private static const EXTRACT_RC : String = "EXTRACT";
		private static const CONVERT_RC : String = "CONVERT";
		
		private var _presentationSO : SharedObject;
		private var netConnectionDelegate: NetConnectionDelegate;
		
		private var _slides:IPresentationSlides;
		private var _uri:String;
		private var _connectionListener:Function;
		private var _messageSender:Function;
		
		public function PresentSOService(uri:String, slides:IPresentationSlides)
		{			
			_uri = uri;
			_slides = slides;
			netConnectionDelegate = new NetConnectionDelegate(uri, connectionListener);			
		}
		
		public function connect():void {
			netConnectionDelegate.connect();
		}
			
		public function disconnect():void {
			leave();
			netConnectionDelegate.disconnect();
		}
		
		private function connectionListener(connected:Boolean):void {
			if (connected) {
				join();
			} else {
				leave();
				notifyConnectionStatusListener(false);
			}
		}
		
	    private function join() : void
		{
			_presentationSO = SharedObject.getRemote(SHAREDOBJECT, _uri, false);			
			_presentationSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_presentationSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_presentationSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);			
			_presentationSO.client = this;
			_presentationSO.connect(netConnectionDelegate.connection);
			trace(NAME + ": PresentationModule is connected to Shared object");
			notifyConnectionStatusListener(true);			
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
		public function clear() : void
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

		/**
		 * Send an event out to the server to go to a new page in the SlidesDeck 
		 * @param page
		 * 
		 */		
		public function gotoSlide(num:int) : void
		{
			_presentationSO.send("gotoPageCallback", num);
			trace("Going to slide " + num);
			_presentationSO.setProperty(CURRENT_PAGE, num);
		}
		
		/**
		 * A callback method. It is called after the gotoPage method has successfully executed on the server
		 * The method sets the clients view to the page number received 
		 * @param page
		 * 
		 */		
		public function gotoPageCallback(page : Number) : void
		{
			sendMessage(PresentModuleConstants.DISPLAY_SLIDE, page);
		}

		public function getCurrentSlideNumber():void {
			if (_presentationSO.data[CURRENT_PAGE] != null) {
				sendMessage(PresentModuleConstants.DISPLAY_SLIDE, _presentationSO.data[CURRENT_PAGE]);
			}				
		}
		
		public function sharePresentation(share:Boolean):void {
			trace('SO Sharing presentation = ' + share);
			_presentationSO.data[SHARING] = share;
			_presentationSO.setDirty(SHARING);
		}

	
		
		/**
		 * Event called automatically once a SharedObject Sync method is received 
		 * @param event
		 * 
		 */								
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			trace( "Presentation::sharedObjectSyncHandler " + event.changeList.length);
		
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				trace( "Presentation::handlingChanges[" + event.changeList[i].name + "][" + i + "]");
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
						trace( UPDATE_MESSAGE + " = [" + _presentationSO.data.updateMessage.returnCode + "]");
						processUpdateMessage(_presentationSO.data.updateMessage.returnCode);
//					}
					
					break;
															
				case SHARING :			
					if (_presentationSO.data[SHARING]) {
						trace( "SHARING =[" + _presentationSO.data[SHARING] + "]");
						sendMessage(PresentModuleConstants.START_SHARE);	
			
					} else {
						trace( "SHARING =[" + _presentationSO.data[SHARING] + "]");
					}
					break;

				case CURRENT_PAGE :
//						presentation.decks.selected = presentationSO.data.currentPage.pagenumber;
//						trace("Current page is " + presentationSO.data.currentPage.pagenumber);
//						sendNotification(PresentationFacade.UPDATE_PAGE, presentationSO.data.currentPage.pagenumber);
					break;
							
				default:
					trace( "default = [" + code + "," + name + "," + oldValue + "]");				 
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
					message = _presentationSO.data.updateMessage.message;
					sendMessage(PresentModuleConstants.CONVERT_SUCCESS_EVENT, message);
					trace("PresentationDelegate - SUCCESS_RC");
					break;
					
				case UPDATE_RC:
					message = _presentationSO.data.updateMessage.message;
					sendMessage(PresentModuleConstants.UPDATE_PROGRESS_EVENT, message);
					trace("PresentationDelegate - UPDATE_RC");
					break;
										
				case FAILED_RC:
					trace("PresentationDelegate - FAILED_RC");
					break;
				case EXTRACT_RC:
					totalSlides = _presentationSO.data.updateMessage.totalSlides;
					completedSlides = _presentationSO.data.updateMessage.completedSlides;
					trace( "EXTRACTING = [" + completedSlides + " of " + totalSlides + "]");
					
					sendMessage(PresentModuleConstants.EXTRACT_PROGRESS_EVENT,
										new ProgressNotifier(totalSlides,completedSlides));
					
					break;
				case CONVERT_RC:
					totalSlides = _presentationSO.data.updateMessage.totalSlides;
					completedSlides = _presentationSO.data.updateMessage.completedSlides;
					trace( "CONVERTING = [" + completedSlides + " of " + totalSlides + "]");
					
					sendMessage(PresentModuleConstants.CONVERT_PROGRESS_EVENT,
										new ProgressNotifier(totalSlides, completedSlides));							
					break;			
				default:
			
					break;	
			}															
		}		

		private function notifyConnectionStatusListener(connected:Boolean):void {
			if (_connectionListener != null) {
				_connectionListener(connected);
			}
		}

		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			var statusCode : String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					trace(NAME + ":Connection Success");		
					notifyConnectionStatusListener(true);			
					break;
			
				case "NetConnection.Connect.Failed" :			
					trace(NAME + ":Connection to viewers application failed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Closed" :									
					trace(NAME + ":Connection to viewers application closed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					trace(NAME + ":Viewers application not found on server");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					trace(NAME + ":Viewers application has been shutdown");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Rejected" :
					trace(NAME + ":No permissions to connect to the viewers application" );
					notifyConnectionStatusListener(false);
					break;
					
				default :
				   trace(NAME + ":default - " + event.info.code );
				   notifyConnectionStatusListener(false);
				   break;
			}
		}
			
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			trace( "participantsSO asyncErrorHandler " + event.error);
			notifyConnectionStatusListener(false);
		}
	}
}