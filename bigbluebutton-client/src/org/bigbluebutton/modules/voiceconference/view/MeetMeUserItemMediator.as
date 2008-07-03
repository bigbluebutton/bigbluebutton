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
	import org.bigbluebutton.modules.voiceconference.control.notifiers.MuteNotifier;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	
	/**
	 * This is the mediator class for the MeerMeUserItem GUI component
	 * <p>
	 * This class extends the Mediator class of the PureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class MeetMeUserItemMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "MeetMeUserItemMediator";
		public static const MUTE_UNMUTE_USER:String = "Mute-Unmute User";
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		/**
		 * The defualt constructor 
		 * @param view - The gui component which this class mediates
		 * 
		 */		
		public function MeetMeUserItemMediator(view:MeetMeUserItem)
		{
			super(NAME, view);
			view.addEventListener(MUTE_UNMUTE_USER, muteUnmuteUser);
			log.voice("this is in MeetMeUserItemMediator's constructor: adding MUTE_UNMUTE_USER event listener");
		}
		
		/**
		 * 
		 * @return - the gui component of this mediator 
		 * 
		 */		
		public function get meetMeUserItem():MeetMeUserItem{
			return viewComponent as MeetMeUserItem;
		}
		
		/**
		 * 
		 * @return - the events which this class listens 
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
		 * Handles a received notification 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VoiceConferenceFacade.USER_JOIN_EVENT:
					onNewMeetMeEvent(notification);
					break;
			}
		}
		
		/**
		 * Mutes or unmutes a user 
		 * 
		 */		
		private function muteUnmuteUser(e:Event) : void
   		{
   			//if (meetMeUserItem. == true) 
   			//{
   			sendNotification(VoiceConferenceFacade.MUTE_EVENT, new MuteNotifier(meetMeUserItem.data.userid, !meetMeUserItem.data.isMuted));
   			log.voice("MeetMeUserItemMediator::muteUnmuteUser() : [" + meetMeUserItem.data.userid + "," + !meetMeUserItem.data.isMuted + "]");
   			//}
   			//else return;
   		}
   		
   		/**
   		 * Changes the display when a New MeetMeEvent is received 
   		 * @param note
   		 * 
   		 */   		
   		private function onNewMeetMeEvent(note:INotification) : void
   		{
   			//log.debug("Got newMeetMeEvent."); // comment out as generates too much noise

   			meetMeUserItem.displayStatusIcon();	
   		}

	}
}