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
package org.bigbluebutton.modules.listeners.view
{
	import flash.events.Event;
	import flash.media.Sound;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.modules.listeners.ListenersModuleConstants;
	import org.bigbluebutton.modules.listeners.model.ListenersProxy;
	import org.bigbluebutton.modules.listeners.view.components.ListenersWindow;
	import org.bigbluebutton.modules.listeners.view.events.ListenerSelectedEvent;
	import org.bigbluebutton.modules.listeners.view.events.UserMuteEvent;
	import org.bigbluebutton.modules.listeners.view.events.UserTalkEvent;
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
		
		private var _module:ListenersModule;
		private var _listenersWindow:ListenersWindow;
		private var _recordedAudio:Sound;
		
		public function ListenersWindowMediator(module:ListenersModule)
		{
			super(NAME);
			_module = module;
			_listenersWindow = new ListenersWindow();
			_listenersWindow.addEventListener(ListenersModuleConstants.UNMUTE_ALL, onUnmuteAllUsers);
			_listenersWindow.addEventListener(ListenersModuleConstants.MUTE_ALL, onMuteAllUsers);
			_listenersWindow.addEventListener(ListenersModuleConstants.EJECT_LISTENER_EVENT, onEjectListenerEvent);
			_listenersWindow.addEventListener(ListenersModuleConstants.MUTE_USER_EVENT, onMuteUserEvent);
			_listenersWindow.addEventListener(ListenerSelectedEvent.LISTENER_SELECTED_EVENT, onListenerSelectedEvent);
			
		}

		private function onUnmuteAllUsers(e:Event) : void
   		{
   			proxy.muteAllUsers(false);
   		}
   		
 		
   		private function onMuteAllUsers(e:Event) : void
   		{
   			proxy.muteAllUsers(true);
   		}
   		
   		private function onMuteUserEvent(e:UserMuteEvent):void{
   			proxy.muteUnmuteUser(e.userid, e.mute);
   		}
   				
		private function onEjectListenerEvent(e:Event):void {
			proxy.ejectUser(_listenersWindow.listenersList.selectedItem.userid);
		}
		
		private function onListenerSelectedEvent(e:Event):void {
			_listenersWindow.ejectBtn.enabled = true;
			_listenersWindow.ejectBtn.toolTip = "Click to eject selected voice participant.";
		}
			
		override public function listNotificationInterests():Array{
			return [
					ListenersModuleConstants.OPEN_WINDOW,
					ListenersModuleConstants.CLOSE_WINDOW,
					ListenersModuleConstants.USER_MUTE_NOTIFICATION,
					ListenersModuleConstants.USER_TALKING_NOTIFICATION,
					ListenersModuleConstants.FIRST_LISTENER_JOINED_EVENT,
					ListenersModuleConstants.CONVERTED_RECORDED_MP3_EVENT
					];
		}
			
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case ListenersModuleConstants.OPEN_WINDOW:
					handleOpenListenersWindow();
					break;
				case ListenersModuleConstants.CONVERTED_RECORDED_MP3_EVENT:
					/** If PLAYBACK, pre-load the recorded audio */
					if (_module.mode == 'PLAYBACK') {
						LogUtil.debug("Loading recorded audio " + _module.recordedMP3Url);
						_recordedAudio = new Sound(	new URLRequest(_module.recordedMP3Url));
					}					
					break;
				case ListenersModuleConstants.CLOSE_WINDOW:
					facade.sendNotification(ListenersModuleConstants.REMOVE_WINDOW, _listenersWindow);
					break;	
				case ListenersModuleConstants.USER_MUTE_NOTIFICATION:
					var userid:Number = notification.getBody().userid as Number;
					var mute:Boolean = notification.getBody().mute as Boolean;
					handleUserMuteNotification(userid, mute);
					break;
				case ListenersModuleConstants.USER_TALKING_NOTIFICATION:
					var uid:Number = notification.getBody().userid as Number;
					var talk:Boolean = notification.getBody().talk as Boolean;
					handleUserTalkingNotification(uid, talk);
					break;
				case ListenersModuleConstants.FIRST_LISTENER_JOINED_EVENT:
					_recordedAudio.play();
					break;
			}
		}

		private function handleUserMuteNotification(userid:Number, mute:Boolean):void {
			var e:UserMuteEvent = new UserMuteEvent(ListenersModuleConstants.USER_MUTE_EVENT);
			e.userid = userid;
			e.mute = mute;
			_listenersWindow.listenersList.dispatchEvent(e);
		}

		private function handleUserTalkingNotification(userid:Number, talk:Boolean):void {
			var e:UserTalkEvent = new UserTalkEvent(ListenersModuleConstants.USER_TALK_EVENT);
			e.userid = userid;
			e.talk = talk;
			_listenersWindow.listenersList.dispatchEvent(e);
		}
		
		private function handleOpenListenersWindow():void {
			_listenersWindow.listeners = proxy.listeners;
			_listenersWindow.moderator = proxy.isModerator();
			_listenersWindow.width = 210;
		   	_listenersWindow.height = 220;
		   	_listenersWindow.title = "Voice Participants";
		   	_listenersWindow.showCloseButton = false;
		   	_listenersWindow.xPosition = 0;
		   	_listenersWindow.yPosition = 225;
		   	facade.sendNotification(ListenersModuleConstants.ADD_WINDOW, _listenersWindow); 			
		}	
			   				
		private function get proxy():ListenersProxy {
			return facade.retrieveProxy(ListenersProxy.NAME) as ListenersProxy;
		}

	}
}