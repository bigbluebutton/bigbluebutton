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
package org.bigbluebutton.modules.presentation.model
{
				
	import flash.net.FileReference;
	
	import mx.collections.ArrayCollection;
	import mx.collections.IViewCursor;
	import mx.rpc.IResponder;
	import mx.utils.ArrayUtil;
	
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.bigbluebutton.modules.presentation.model.business.PresentationDelegate;
	import org.bigbluebutton.modules.presentation.model.services.FileUploadService;
	import org.bigbluebutton.modules.presentation.model.services.PresentationService;
	import org.bigbluebutton.modules.presentation.model.vo.SlidesDeck;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.bigbluebutton.modules.log.LogModuleFacade;
			
	/**
	 * The PresentationApplication class is the ApplicationMediator class of the Presentation Module
	 * <p>
	 * This class extends the Proxy class of the pureMVC framework
	 * <p>
	 * This class implements the IResponder interface 
	 * @author Denis Zgonjanin
	 * 
	 */						
	public class PresentationApplication extends Mediator implements IMediator, IResponder
	{
		public static const NAME:String = "PresentationApplication";
		
		public static const LEAVE:String = "Leave Presentation";
		public static const JOIN:String = "Join Presentation";
		public static const SHARE:String = "Share Presentation";

		private var _url : String;
		private var _userid : Number;
		private var _room : String;
		private var _docServiceAddress : String = "http://localhost:8080";
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		
		/**
		 * The default constructor 
		 * @param userid - the clients userid
		 * @param room - the room the presentation module is connected to
		 * @param url - the url of the presentation server
		 * @param docServiceAddress
		 * 
		 */		
		public function PresentationApplication(userid : Number, room : String, 
				url : String, docServiceAddress : String) : void 
		{
			super(NAME);
			_url = url;
			_userid = userid;
			_room = room;
			_docServiceAddress = docServiceAddress;
		}
		
		private function get model():PresentationModel{
			return facade.retrieveMediator(PresentationModel.NAME) as PresentationModel;
		}
				
		/**
		 * returns the Presentation Proxy class, which it retrieves from the facade 
		 * @return 
		 * 
		 */		
		public function get presentationProxy():PresentationDelegate{
			return facade.retrieveProxy(PresentationDelegate.ID) as PresentationDelegate;
		}
		
		override public function listNotificationInterests():Array{
			return [
					LEAVE,
					JOIN,
					SHARE,
					PresentationFacade.READY_EVENT
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case LEAVE:
					leave();
					break;
				case JOIN:
					join();
					break;
				case SHARE:
					sharePresentation(notification.getBody() as Boolean);
					break;
				case PresentationFacade.READY_EVENT:
					loadPresentation();
					break;
			}
		}
		
		/**
		 * Call the proxy to send out a join request to the server 
		 * 
		 */		
		public function join() : void
		{	
			presentationProxy.join(_userid, _url, _room);		
		}
		
		/**
		 * Sends a request to the proxy to leave the presentation and disconnect from the server 
		 * 
		 */		
		public function leave() : void
		{
			presentationProxy.leave();
		}
		
		/**
		 * Upload a presentation to the server 
		 * @param fileToUpload - A FileReference class of the file we wish to upload
		 * 
		 */		
		public function uploadPresentation(fileToUpload : FileReference) : void
		{
			log.presentation("In uploadPresentation()... " + Constants.relativeFileUpload + "/upload");
			var fullUri : String = _docServiceAddress + Constants.relativeFileUpload + "/upload";
						
			var service:FileUploadService = new FileUploadService(fullUri, _room);
			facade.registerProxy(service);
			log.presentation("using flash FileUploadService...");
			service.upload(fileToUpload);
		}
		
		/**
		 * Loads a presentation from the server. creates a new PresentationService class 
		 * 
		 */		
		public function loadPresentation() : void
		{
			var fullUri : String = _docServiceAddress + Constants.relativeFileUpload + "/xmlslides?room=" + _room;	
			model.presentationLoaded = false;
			
			var service:PresentationService = new PresentationService(fullUri, this);
		}
		
		/**
		 * Share the presentation with the rest of the room 
		 * @param share
		 * 
		 */		
		public function sharePresentation(share : Boolean) : void
		{
			if (share) {	
				presentationProxy.share(true);		
			} else {
				presentationProxy.share(false);					
			}		
		}
		
		/**
		 * Assign a presented to the presentation 
		 * @param userid
		 * @param name
		 * 
		 */		
		public function assignPresenter(userid : Number, name : String) : void
		{
			presentationProxy.givePresenterControl(userid, name);		
		}
		
		/**
		 * This is the response event. It is called when the PresentationService class sends a request to
		 * the server. This class then responds with this event 
		 * @param event
		 * 
		 */		
		public function result(event : Object):void
		{
			//log.debug("Got result [" + event.result.toString() + "]");
		
			if (event.result.presentations == null)	return;
			
		    var result:ArrayCollection = event.result.presentations.presentation is ArrayCollection
		        ? event.result.presentations.presentation as ArrayCollection
		        : new ArrayCollection(ArrayUtil.toArray(event.result.presentations.presentation));
		    
		    var temp:ArrayCollection = new ArrayCollection();
		    var cursor:IViewCursor = result.createCursor();
		    
		    while (!cursor.afterLast)
		    {
		    	var deck:SlidesDeck = new SlidesDeck(cursor.current);
		    	//log.debug("Got gallery [" + deck.title + "]");
				model.newDeckOfSlides(deck);
		        cursor.moveNext();
		    }
		}

		/**
		 * Event is called in case the call the to server wasn't successful. This method then gets called
		 * instead of the result() method above 
		 * @param event
		 * 
		 */
		public function fault(event : Object):void
		{
			//log.debug("Got fault [" + event.fault.toString() + "]");		
		}		
	}
}