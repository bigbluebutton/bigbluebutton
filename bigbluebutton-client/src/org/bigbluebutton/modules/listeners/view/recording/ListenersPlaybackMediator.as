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
package org.bigbluebutton.modules.voiceconference.view.recording
{
	import org.bigbluebutton.modules.voiceconference.VoiceFacade;
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;
	import org.bigbluebutton.modules.voiceconference.model.vo.User;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindow;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	
	public class ListenersPlaybackMediator extends ListenersWindowMediator
	{
		public static const PLAYBACK_ROOM:String = "Playback Room";
		
		public static const JOIN:String = "join";
		public static const TALK:String = "talk";
		public static const LEFT:String = "left";
		
		public function ListenersPlaybackMediator(view:ListenersWindow)
		{
			super(view);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			(facade as VoiceFacade).meetMeRoom = new VoiceConferenceRoom(PLAYBACK_ROOM);
		}
		
		override public function listNotificationInterests():Array{
			return [
					JOIN,
					LEFT,
					TALK
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			var message:XML = notification.getBody() as XML;
			switch(notification.getName()){
				case JOIN:
					listenersWindow.meetMeRoom.dpParticipants.addItem(new User())
					break;
				case LEFT:
					break;
				case TALK:
					break;
			}
		}

	}
}