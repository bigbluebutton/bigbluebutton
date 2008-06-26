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
package org.bigbluebutton.modules.voiceconference.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.voiceconference.VoiceConferenceFacade;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The ListenersWindowMediator is a Mediator class for the ListenersWindow mxml component
	 * <p>
	 * This class extends the Mediator class of the PureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ListenersWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ListenersWindowMediator";
		public static const UNMUTE_ALL:String = "Unmute All Users";
		public static const MUTE_ALL:String = "Mute All Users";
		public static const EJECT_USER:String = "Eject User";
		
		/**
		 * The default constructor. Assigns this class to a certain GUI component 
		 * @param view - the gui component which this class Mediates
		 * 
		 */		
		public function ListenersWindowMediator(view:ListenersWindow)
		{
			super(NAME, view);
			view.addEventListener(UNMUTE_ALL, unmuteAllUsers);
			view.addEventListener(MUTE_ALL, muteAllUsers);
			view.addEventListener(EJECT_USER, ejectUser);
		}
		
		/**
		 *  
		 * @return The GUI component of this mediator
		 * 
		 */		
		public function get listenersWindow():ListenersWindow{
			return viewComponent as ListenersWindow;
		}
		
		/**
		 *  
		 * @return The array of strings representing which notifications this class listens to
		 * <p>
		 * This class listens to the following notifications:
		 * 	MeetMeFacade.USER_JOIN_EVENT
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					VoiceConferenceFacade.USER_JOIN_EVENT
					];
		}
		
		/**
		 * Decides how to handle a notification received by this class 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VoiceConferenceFacade.USER_JOIN_EVENT:
					listenersWindow.participantsList.dataProvider = VoiceConferenceFacade.getInstance().meetMeRoom.dpParticipants;
					//log.debug("Participants: " + VoiceConferenceFacade.getInstance().meetMeRoom.dpParticipants.length);
					break;
			}
		}
		
		/**
		 * Sends a MUTE_ALL_USERS_COMMAND notification (false - unmutes all users)
		 * @param e - the event which generated the call to this method
		 * 
		 */		
		private function unmuteAllUsers(e:Event) : void
   		{
   			sendNotification(VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND, false);
   		}
   		
   		/**
   		 * Sends a MUTE_ALL_USERS_COMMAND notification (true - mutes all users)
   		 * @param e - the event which generated the call to this method
   		 * 
   		 */   		
   		private function muteAllUsers(e:Event) : void
   		{
   			sendNotification(VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND, true);
   		}
   		
   		/**
   		 * Sends an EJECT_USER_COMMAND notification 
   		 * @param e - the event which generated the call to this method
   		 * 
   		 */   		
   		private function ejectUser(e:Event):void{
   			sendNotification(VoiceConferenceFacade.EJECT_USER_COMMAND, listenersWindow.userid);
   		}

	}
}