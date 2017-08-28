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
package org.bigbluebutton.modules.classyaudio.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.classyaudio.events.CallConnectedEvent;
	import org.bigbluebutton.modules.classyaudio.events.PushToTalkEvent;
	import org.bigbluebutton.modules.classyaudio.views.PushToTalkButton;

	public class ClassyAudioManager
	{
		private static const LOGGER:ILogger = getClassLogger(ClassyAudioManager);

		private var connectionManager:ConnectionManager;
		private var streamManager:StreamManager;
		private var onCall:Boolean = false;
		private var attributes:Object;
		
		private var dispatcher:Dispatcher;
		
		public function ClassyAudioManager()
		{
			dispatcher = new Dispatcher();
			connectionManager = new ConnectionManager();
			streamManager = new StreamManager();
		}
		
		public function setAttributes(attributes:Object):void{
			this.attributes = attributes;
			joinVoice();
			
			if (attributes.pushToTalkEnabled == "true") enablePushToTalkButton();
		}
		
		public function stopModule():void{
			
		}
		
		public function joinVoice():void {
			//Start listening
			//streamManager.initWithNoMicrophone();
			//streamManager.initMicrophone();
			
			var uid:String = String( Math.floor( new Date().getTime() ) );
			connectionManager.connect(uid, attributes.externUserID, attributes.username, attributes.room, attributes.uri);
		}
		
		public function dialConference():void {
			LOGGER.debug("Dialing....{0}....{1}", [attributes.webvoiceconf, attributes.externUserID]);
			connectionManager.doCall(attributes.webvoiceconf);
		}
		
		public function callConnected(event:CallConnectedEvent):void {
			LOGGER.debug("Call connected...");
			setupConnection();
			LOGGER.debug("callConnected: Connection Setup");
			streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec);
			LOGGER.debug("callConnected::onCall set");
			onCall = true;
			
			//Mute if the user is not the presenter at start
			var t:Timer = new Timer(500, 1);
			t.addEventListener(TimerEvent.TIMER, muteIfNotPresenter);
			t.start();
		}
		
		public function hangup():void {
			LOGGER.debug("PhoneManager hangup");
			if (onCall) {
				LOGGER.debug("PM OnCall");
				streamManager.stopStreams();
				connectionManager.doHangUp();
				LOGGER.debug("PM hangup::doHangUp");
				onCall = false;
			}			
		}
		
		private function setupConnection():void {
			streamManager.setConnection(connectionManager.getConnection());
		}
	
		public function switchToPresenter(e:MadePresenterEvent):void{
			streamManager.unmute();
		}
		
		public function switchToViewer(e:MadePresenterEvent):void{
			streamManager.mute();
		}
		
		public function buttonPushed(e:PushToTalkEvent):void{
			streamManager.unmute();
		}
		
		public function buttonReleased(e:PushToTalkEvent):void{
			streamManager.mute();
		}
		
		private function enablePushToTalkButton():void{
			var e:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
			e.button = new PushToTalkButton();
			e.module="Microphone";
			dispatcher.dispatchEvent(e);
		}
		
		private function muteIfNotPresenter(e:Event = null):void{
			if (UsersUtil.amIPresenter){
				streamManager.unmute();
			} else {
				streamManager.mute();
			}
		}
	}
}