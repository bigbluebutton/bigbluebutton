/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.presentation.model.business
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ProgressNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	import org.bigbluebutton.modules.presentation.model.PresentationModel;
	import org.bigbluebutton.modules.presentation.model.vo.SlidesDeck;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
					
	/**
	 * The PresentationDelegate class handles calls to and from the server 
	 * In most cases the communication with the Red5 server is handles using a shared object
	 * <p>
	 * This class extends the Proxy class of the PureMVC framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */					
	public class PresentationDelegate extends Proxy implements IProxy
	{
		public static const ID : String = "PresentationDelegate";
		
		private static const SHAREDOBJECT : String = "presentationSO";
		private static const PRESENTER : String = "presenter";
		private static const SHARING : String = "sharing";
		private static const UPDATE_MESSAGE : String = "updateMessage";
		
		private static const UPDATE_RC : String = "UPDATE";
		private static const SUCCESS_RC : String = "SUCCESS";
		private static const FAILED_RC : String = "FAILED";
		private static const EXTRACT_RC : String = "EXTRACT";
		private static const CONVERT_RC : String = "CONVERT";
		
		private var presentationSO : SharedObject;
		private var connDelegate : NetConnectionDelegate;
				
		/**
		 * The default constructor. Creates a new NetConnectionDelegate
		 * 
		 */				
		public function PresentationDelegate(nc:NetConnection)
		{
			super(ID);
			connDelegate = new NetConnectionDelegate(this);
			connDelegate.setNetConnection(nc);
		}	
		
		private function get presentation():PresentationModel{
			return facade.retrieveMediator(PresentationModel.NAME) as PresentationModel;
		}
				
		/**
		 * The event is called when a successful connection is established
		 * 
		 */				
		public function connectionSuccess() : void
		{
			presentation.isConnected = true;
			
			joinConference();
		}
		
		/**
		 * The event is called when a connection could not be established 
		 * @param message - the reason the connection was not established
		 * 
		 */			
		public function connectionFailed(message : String) : void 
		{
			if (presentationSO != null) presentationSO.close();
			
			presentation.isConnected = false;
		}		
		
		/**
		 * Attempt to join a room on the server 
		 * @param userid - Our userid
		 * @param host - The host we're trying to connect to 
		 * @param room - The room on the host we're trying to connect to
		 * 
		 */		
		public function join(userid: Number, host : String, room : String) : void
		{			
			presentation.userid = userid;
			presentation.host = host;
			presentation.room = room;
						
			connDelegate.connect(host, room);
			sendNotification(PresentationFacade.LOAD_COMMAND);
		}
		
		/**
		 * Leave the server, close the connection 
		 * 
		 */		
		public function leave() : void
		{
			givePresenterControl(0, PresentationModel.DEFAULT_PRESENTER);
			presentationSO.close();
			connDelegate.disconnect();
		}
		
		/**
		 * Send an event out to the server to go to a new page in the SlidesDeck 
		 * @param page
		 * 
		 */		
		public function gotoPage(page : Number) : void
		{
			presentationSO.send("gotoPageCallback", page);
		}
		
		/**
		 * A callback method. It is called after the gotoPage method has successfully executed on the server
		 * The method sets the clients view to the page number received 
		 * @param page
		 * 
		 */		
		public function gotoPageCallback(page : Number) : void
		{
			presentation.decks.selected = page;
			sendNotification(PresentationFacade.UPDATE_PAGE, page);
		}
		
		/**
		 * Send an event to the server to update the clients with a new slide zoom ratio
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		public function zoom(slideHeight:Number, slideWidth:Number):void{
			presentationSO.send("zoomCallback", slideHeight, slideWidth);
		}
		
		/**
		 * A callback method for zooming in a slide. Called once zoom gets executed 
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		public function zoomCallback(slideHeight:Number, slideWidth:Number):void{
			sendNotification(PresentationFacade.ZOOM_SLIDE, new ZoomNotifier(slideHeight, slideWidth));
		}
		
		/**
		 * Sends an event to the server to update the clients with the new slide position 
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		public function move(slideXPosition:Number, slideYPosition:Number):void{
			presentationSO.send("moveCallback", slideXPosition, slideYPosition);
		}
		
		/**
		 * A callback method from the server to update the slide position 
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		public function moveCallback(slideXPosition:Number, slideYPosition:Number):void{
		   sendNotification(PresentationFacade.MOVE_SLIDE, new MoveNotifier(slideXPosition, slideYPosition));
		}
		
		/**
		 * Sends an event out for the clients to maximize the presentation module 
		 * 
		 */		
		public function maximize():void{
			presentationSO.send("maximizeCallback");
		}
		
		/**
		 * A callback method from the server to maximize the presentation 
		 * 
		 */		
		public function maximizeCallback():void{
			sendNotification(PresentationFacade.MAXIMIZE_PRESENTATION);
		}
		
		public function restore():void{
			presentationSO.send("restoreCallback");
		}
		
		public function restoreCallback():void{
			sendNotification(PresentationFacade.RESTORE_PRESENTATION);
		}
		
		/**
		 * Send an event to the server to clear the presentation 
		 * 
		 */		
		public function clear() : void
		{
			presentationSO.send("clearCallback");			
		}
		
		/**
		 * A call-back method for the clear method. This method is called when the clear method has
		 * successfuly called the server.
		 * 
		 */		
		public function clearCallback() : void
		{
			presentationSO.setProperty(SHARING, false);
			sendNotification(PresentationFacade.CLEAR_EVENT);
		}
		
		/**
		 * Calls the server in order to give the presentation control to someone else
		 * @param userid
		 * @param name
		 * 
		 */		
		public function givePresenterControl(userid : Number, name : String) : void
		{
			// Force unshare of presentation
			share(false);
			
			presentationSO.setProperty(PRESENTER, {userid : userid, name : name});
			//log.debug("Assign presenter control to [" + name + "]");
		}
		
		/**
		 * Stop sharing the presentation 
		 * 
		 */		
		public function stopSharing() : void
		{
			presentationSO.setProperty(SHARING, false);
		}
		
		/**
		 * Start sharing the presentation 
		 * @param sharing
		 * 
		 */		
		public function share(sharing : Boolean) : void
		{
			if (sharing) {
				/**
				 * We have to explicitly copy the data into a new Object, otherwise, the
			 	 * ShareObject won't sync.
			 	 */			
				var name : String = presentation.decks.name;
				var title : String = presentation.decks.title;
				var curPage : Number = presentation.decks.selected;
				
				var slides : Array = new Array();			
				for (var i : uint = 0; i < presentation.decks.slides.source.length; i++)
				{
					slides.push(presentation.decks.slides.source[i]);
				}

//				presentationSO.setProperty(SHARING, {share : sharing, 
//						presentation : {id : name, description : title, page : curPage, slide : slides}});	
				presentationSO.setProperty(SHARING, {share : sharing});		
			} else {
				presentationSO.setProperty(SHARING, {share : sharing});
			}
		}
				
		/**
		 * Joins a conference on the server 
		 * 
		 */				
		private function joinConference() : void
		{
			presentationSO = SharedObject.getRemote(SHAREDOBJECT, connDelegate.connUri, false);
			
			presentationSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			presentationSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			presentationSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			
			presentationSO.client = this;

			presentationSO.connect(connDelegate.getConnection());
			//log.debug( "PresentationDelegate::joinConference");
		}

		/**
		 * Remove the events that the presentationSO:SharedObject of this class listens to 
		 * 
		 */
		private function removeListeners() : void
		{
			presentationSO.removeEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			presentationSO.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			presentationSO.removeEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
		}		
								
		/**
		 * Event called automatically once a SharedObject Sync method is received 
		 * @param event
		 * 
		 */								
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			//log.debug( "Presentation::sharedObjectSyncHandler " + event.changeList.length);
						
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				//log.debug( "Presentation::handlingChanges[" + event.changeList[i].name + "][" + i + "]");
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
					if (presentation.isPresenter) {
						//log.debug( UPDATE_MESSAGE + " =[" + presentationSO.data.updateMessage.returnCode + "]");
						processUpdateMessage(presentationSO.data.updateMessage.returnCode);
					}
					
					break;
										
				case PRESENTER :
					//log.debug("Giving presenter control to [" + presentationSO.data.presenter.name + "]");
					if (presentation.isSharing) presentation.isSharing = false;
					
					if (presentation.presentationLoaded) presentation.presentationLoaded = false;
//					presentation.decks = null;
												
					if (presentation.userid == presentationSO.data.presenter.userid) {
						// The user has been given presenter role
						presentation.isPresenter = true;						
					} else {
						if (presentation.isPresenter) {
							// Someone else has become the presenter
							presentation.isPresenter = false;	
						}
					}
					presentation.presenterName = presentationSO.data.presenter.name;
					break;
					
				case SHARING :
					presentation.isSharing = presentationSO.data.sharing.share;
				
					if (presentationSO.data.sharing.share) {
						//log.debug( "SHARING =[" + presentationSO.data.sharing.share + "]");
//						log.debug( "SHARING true =[" + presentationSO.data.sharing.presentation.slide.length  + "]");
										
//						processSharedPresentation(presentationSO.data.sharing.presentation);
						
//						var viewEvent : ViewEvent = new ViewEvent();
//						viewEvent.dispatch();
					sendNotification(PresentationFacade.READY_EVENT);
					
					} else {
						//log.debug( "SHARING =[" + presentationSO.data.sharing.share + "]");
						// Should send a stop sharing event. This will allow UIs to do what they want 
						// (e.g. clear the screen).
						if (! presentation.isPresenter) {
						//	presentation.decks = null;
						}
						sendNotification(PresentationFacade.CLEAR_EVENT);
					}
					break
					
				default:
					//log.debug( "default =[" + code + "," + name + "," + oldValue + "]");				 
					break;
			}
		}
		
		/**
		 * Processes a new SlideDeck
		 * @param pres - an Object representing a SlideDeck
		 * 
		 */		
		private function processSharedPresentation(pres : Object) : void
		{
			var deck:SlidesDeck = new SlidesDeck(pres);
			
			presentation.newDeckOfSlides(deck);		
			presentation.decks.selected = pres.page;	
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
					message = presentationSO.data.updateMessage.message;
					sendNotification(PresentationFacade.CONVERT_SUCCESS_EVENT, message);
					//log.debug("PresentationDelegate - Success Note sent");
					break;
					
				case UPDATE_RC:
					message = presentationSO.data.updateMessage.message;
					sendNotification(PresentationFacade.UPDATE_PROGRESS_EVENT, message);
					
					break;
										
				case FAILED_RC:
			
					break;
				case EXTRACT_RC:
					totalSlides = presentationSO.data.updateMessage.totalSlides;
					completedSlides = presentationSO.data.updateMessage.completedSlides;
					//log.debug( "EXTRACTING = [" + completedSlides + " of " + totalSlides + "]");
					
					sendNotification(PresentationFacade.EXTRACT_PROGRESS_EVENT,
										new ProgressNotifier(totalSlides,completedSlides));
					
					break;
				case CONVERT_RC:
					totalSlides = presentationSO.data.updateMessage.totalSlides;
					completedSlides = presentationSO.data.updateMessage.completedSlides;
					//log.debug( "CONVERTING = [" + completedSlides + " of " + totalSlides + "]");
					
					sendNotification(PresentationFacade.CONVERT_PROGRESS_EVENT,
										new ProgressNotifier(totalSlides, completedSlides));							
					break;			
				default:
			
					break;	
			}															
		}
		
		/**
		 * Method is called when a new NetStatusEvent is received 
		 * @param event
		 * 
		 */		
		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			//log.debug( "netStatusHandler " + event.info.code );
		}
		
		/**
		 * Method is called when a new AsyncErrorEvent is received 
		 * @param event
		 * 
		 */		
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			//log.debug( "asyncErrorHandler " + event.error);
		}
	}
}