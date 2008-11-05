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
package org.bigbluebutton.modules.voiceconference
{
	import org.bigbluebutton.common.messaging.InputPipe;
	import org.bigbluebutton.common.messaging.OutputPipe;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.voiceconference.model.business.VoiceConfConnectResponder;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindow;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindowMediator;
	import org.bigbluebutton.modules.voiceconference.view.recording.ListenersPlaybackMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * The VoiceModuleMediator is a mediator class for the VoiceModule. It extends the Mediator class of the
	 * PureMVC framework. 
	 * @author dzgonjan
	 * 
	 */	
	public class VoiceModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "VoiceModuleMediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		
		private var voiceWindow:ListenersWindow = new ListenersWindow();
		private var module:VoiceModule;
		
		private static const TO_VOICE_MODULE:String = "TO_VOICE_MODULE";
		private static const FROM_VOICE_MODULE:String = "FROM_VOICE_MODULE";
		
		private static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		private static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
		
		/**
		 * The constructor. Registers this class with the VoiceModule 
		 * @param view
		 * 
		 */		
		public function VoiceModuleMediator(view:VoiceModule)
		{
			super(NAME,view);
			module = view;
			router = view.router;
			inpipe = new InputPipe(TO_VOICE_MODULE);
			outpipe = new OutputPipe(FROM_VOICE_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG as String;
			switch(msg){
				case PLAYBACK_MODE:
					switchToPlaybackMode();
					break;
				case PLAYBACK_MESSAGE:
					playMessage(message.getBody() as XML);
					break;
			}
		}
		
		private function switchToPlaybackMode():void{
			facade.removeMediator(VoiceConfConnectResponder.NAME);
			var window:ListenersWindow = 
			(facade.retrieveMediator(ListenersWindowMediator.NAME) as ListenersWindowMediator).listenersWindow;
			
			facade.removeMediator(ListenersWindowMediator.NAME);
			
			facade.registerMediator(new ListenersPlaybackMediator(window));
		}
		
		private function playMessage(message:XML):void{
			//Alert.show(message.toXMLString());
			switch(String(message.@event)){
				case ListenersPlaybackMediator.JOIN:
					sendNotification(ListenersPlaybackMediator.JOIN, message);
					break;
				case ListenersPlaybackMediator.LEFT:
					sendNotification(ListenersPlaybackMediator.LEFT, message);
					break;
				case ListenersPlaybackMediator.TALK:
					sendNotification(ListenersPlaybackMediator.TALK, message);
					break;
			}
		}
		
		/**
		 * Adds the presentation window gui component to the main application shell via puremvc piping 
		 * 
		 */		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: FROM_VOICE_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			voiceWindow.height = 200;
   			voiceWindow.width = 210;
   			voiceWindow.title = ListenersWindow.TITLE;
   			voiceWindow.showCloseButton = false;
   			module.activeWindow = voiceWindow;
   			msg.setBody(viewComponent as VoiceModule);
   			outpipe.write(msg);
		}
		
		/**
		 * Register this mediator with the voice facade 
		 * @param key
		 * 
		 */		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			facade.registerMediator(new ListenersWindowMediator(voiceWindow));
		}

	}
}