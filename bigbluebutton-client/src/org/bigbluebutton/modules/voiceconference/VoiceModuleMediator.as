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
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindow;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindowMediator;
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
			inpipe = new InputPipe(VoiceModuleConstants.TO_VOICE_MODULE);
			outpipe = new OutputPipe(VoiceModuleConstants.FROM_VOICE_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG;
		}
		
		/**
		 * Adds the presentation window gui component to the main application shell via puremvc piping 
		 * 
		 */		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: VoiceModuleConstants.FROM_VOICE_MODULE,
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