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
package org.bigbluebutton.main.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.chat.ChatModule;
	import org.bigbluebutton.modules.log.LogModule;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.presentation.PresentationModule;
	import org.bigbluebutton.modules.viewers.ViewersModule;
	import org.bigbluebutton.modules.voiceconference.VoiceModule;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
/**
*   This is the Mediator class for MainApplicationShell view compom\nent
*/	
	public class MainApplicationShellMediator extends Mediator
	{
		public static const NAME:String = 'MainApplicationShellMediator';
		public static const OPEN_CHAT_MODULE:String = 'openChatModule';
		public static const OPEN_LOG_MODULE:String = 'openLogModule';
		public static const LOGOUT:String = "Logout";
		public static const START_WEBCAM:String = "Start Webcam";

		public var log:LogModuleFacade = LogModuleFacade.getInstance(LogModule.NAME);
		private var mshell:MainApplicationShell;
		
		private var xPos:Number;
		private var yPos:Number;
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		public var router : Router;
		private var inpipeListener : PipeListener;
		
		private var modules:Array;
		
		private var logModule:LogModule;
		

		/**
		 *  
		 * @param viewComponent:MainApplicationShell
		 * Constructor of class, initializing the router and pipes.
		 * Also starts the presentation and viewer modules 
		 */		
		public function MainApplicationShellMediator( viewComponent:MainApplicationShell )
		{
			super( NAME, viewComponent );
			modules = new Array();
			mshell = viewComponent;
			router = new Router(viewComponent);
			///viewComponent.debugLog.text = "Log Module inited 1";
			viewComponent.addEventListener(OPEN_LOG_MODULE , showLogWindow);
			viewComponent.addEventListener(LOGOUT, logout);
			inpipe = new InputPipe(MainApplicationConstants.TO_MAIN);
			outpipe = new OutputPipe(MainApplicationConstants.FROM_MAIN);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			
			logModule = new LogModule();
			addModule(logModule);
			
			log.debug("red5:" + Constants.HTML_RED5_HOST);
			log.debug("present:" + Constants.HTML_PRES_HOST);
			
			addModule(new ViewersModule());
		
		}
		
		public function runPresentationModule():void{
			addModule(new PresentationModule());
		}
		
		public function runVoiceModule():void{
			addModule(new VoiceModule());
		}
		
		/**
		 * Runs the Chat Module 
		 * @param event
		 * 
		 */		
		public function runChatModule() : void
		{
			addModule(new ChatModule());
		}
		/**
		 * Runs the Log Module 
		 * @param event
		 * 
		 */		
		public function showLogWindow(event:Event) : void
		{
			logModule.openLogWindow();
		}
		
		/**
		 * Adds a module to this application 
		 * @param module
		 * 
		 */		
		public function addModule(module:BigBlueButtonModule):void{
			this.modules.push(module);
			acceptRouter(module);
		}
		
		public function acceptRouter(module:BigBlueButtonModule):void{
			module.acceptRouter(router, mshell);
		}
		
		private function logout(e:Event):void{
			shell.mdiCanvas.windowManager.removeAll();
			
			var c:Number;
			for (c = 0; c< this.modules.length; c++){
				var module:BigBlueButtonModule = modules[c] as BigBlueButtonModule;
				module.logout();
				modules.pop();
			}
			
			modules = new Array();
			logModule = new LogModule();
			addModule(logModule);
			addModule(new ViewersModule());
			shell.toolbar.enabled = false;	
		}
		
		private function setLayout(module:BigBlueButtonModule):void{
			
			shell.mdiCanvas.windowManager.add(module.getMDIComponent());
			shell.mdiCanvas.windowManager.absPos(module.getMDIComponent(), 
								module.getXPosition(), module.getYPosition());			 
		}
		
		private function removeWindow(module:BigBlueButtonModule):void{
			shell.mdiCanvas.windowManager.remove(module.getMDIComponent());
		}
		
		/**
		 * Handles the incoming messages through pipes to shell 
		 * @param message:IPipeMessage
		 * 
		 */		
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			var module :BigBlueButtonModule;
			
			//shell.debugLog.text = "Got message: " + msg;
			
			switch (msg)
			{
				case MainApplicationConstants.ADD_WINDOW_MSG:
					module = message.getBody() as BigBlueButtonModule;
					//shell.mdiCanvas.windowManager.add(window);
					setLayout(module);
					break;
				case MainApplicationConstants.REMOVE_WINDOW_MSG:
					module = message.getBody() as BigBlueButtonModule;
					if(module.name == LogModule.NAME) {
						//shell.toolbar.LogBtn.enabled = true;
						module.getMDIComponent().visible = false;
					} else removeWindow(module);
					break;					
				case MainApplicationConstants.LOGIN_COMPLETE:
					shell.toolbar.enabled = true;
					runPresentationModule();
					runVoiceModule();
					runChatModule();
					break;				
			}
		}
		/**
		 * 
		 * @return : MainApplicationShell
		 * 
		 */				
		protected function get shell():MainApplicationShell
		{
			return viewComponent as MainApplicationShell;
		}
		
	}
}