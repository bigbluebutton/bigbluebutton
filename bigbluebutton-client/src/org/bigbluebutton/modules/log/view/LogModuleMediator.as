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
package org.bigbluebutton.modules.log.view
{
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.log.LogModule;
	import org.bigbluebutton.modules.log.LogModuleConstants;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.log.view.components.LogWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	

	/**
	 * 
	 * Mediator for LogModule and LogWindow
	 * 
	 */    
	public class LogModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'LogModuleMediator';

		private var debug : Boolean;
		private var warn : Boolean;
		private var error : Boolean;
		private var info : Boolean;
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		public var logWindow : LogWindow;
		
		/**
		 * Constructor, initializing the router, pipes, and listeners 
		 * @param viewComponent
		 * 
		 */		
		public function LogModuleMediator( viewComponent:LogModule )
		{
			super( NAME, viewComponent );	
			viewComponent.mediator = this;
			//viewComponent.mshell.debugLog.text = "in logmodule mediator";
			router = viewComponent.router;
			inpipe = new InputPipe(LogModuleConstants.TO_LOG_MODULE);
			outpipe = new OutputPipe(LogModuleConstants.FROM_LOG_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			//viewComponent.mshell.debugLog.text = "in logmodule mediator 2";
			addWindow();
			
			
		}
		
		/**
		 * initializing notifiers 
		 * @param key
		 * 
		 */
		override public function initializeNotifier(key:String):void
		{
			super.initializeNotifier(key);
		} 
		
		/**
		 * notification(s) that should be taken care off
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array
		{
			return [
					LogModuleFacade.DEBUG,
					LogModuleFacade.WARNING,
					LogModuleFacade.ERROR,
					LogModuleFacade.INFO,
					LogModuleFacade.CLEAR,
					LogModuleFacade.CHAT,
					LogModuleFacade.VOICE,
					LogModuleFacade.VIDEO,
					LogModuleFacade.PRESENTATION,
					LogModuleFacade.VIEWER
				   ];
		}
		/**
		 * handlers for the notifiers this mediator is listening to 
		 * @param note
		 * 
		 */		
		override public function handleNotification(note:INotification):void
		{
			
			switch ( note.getName() )
			{
				case LogModuleFacade.DEBUG:
				this.logWindow.logMessages.addItem({Module:"To be redirected" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.ERROR:
				this.logWindow.logMessages.addItem({Module:"To be redirected" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.WARNING:
				this.logWindow.logMessages.addItem({Module:"To be redirected" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.INFO:
				this.logWindow.logMessages.addItem({Module:"To be redirected" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.CLEAR:
				break;
				
				case LogModuleFacade.CHAT:
				this.logWindow.logMessages.addItem({Module:"Chat" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.VIDEO:
				this.logWindow.logMessages.addItem({Module:"Video" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.PRESENTATION:
				this.logWindow.logMessages.addItem({Module:"Presentation" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.VOICE:
				this.logWindow.logMessages.addItem({Module:"Voice" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
				case LogModuleFacade.VIEWER:
				this.logWindow.logMessages.addItem({Module:"Viewer" , logs:"[" + time() + "] " + (note.getBody() as String)}); 
				break;
			}
		}
		/**
		 * prepare Log window and send it through pipes to Shell 
		 * 
		 */		
		public function addWindow() : void
		{
			// create a message
   			var msg:IPipeMessage = new Message(Message.NORMAL);
   			msg.setHeader( {MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: LogModuleConstants.FROM_LOG_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH );
   			
   			logWindow = new LogWindow();
			logWindow.width = 500;
			logWindow.height = 220;
			logWindow.title = LogWindow.TITLE;
			
			//logWindow.visible = false;
			
			msg.setBody(viewComponent as LogModule);
			//viewComponent.mshell.debugLog.text = "in logmodule mediator: addWindow()";
			outpipe.write(msg);
			
			// Adding listeners
			//logWindow.clear_Btn.addEventListener(MouseEvent.CLICK , clear);
			//logWindow.debug_box.addEventListener(Event.CHANGE,changeLevel);
			//logWindow.info_box.addEventListener(Event.CHANGE,changeLevel);
			//logWindow.warn_box.addEventListener(Event.CHANGE,changeLevel);
			//logWindow.error_box.addEventListener(Event.CHANGE,changeLevel);
			//logWindow.closeBtn.addEventListener(MouseEvent.CLICK, removeWindow);
			//logWindow.debug_box.selected = true;
			//logWindow.error_box.selected = true;
			//logWindow.info_box.selected = true;
			//logWindow.warn_box.selected = true;
			//logWindow.visible = false;
			
					
		}
		
		/**
		 * Preparing a message to remove the window and sending it through pipes to shell
		 * @param event:Event
		 * 
		 */		
		private function removeWindow(event:Event) : void
		{
			var msg:IPipeMessage = new Message(Message.NORMAL);
   			msg.setHeader( {MSG:MainApplicationConstants.REMOVE_WINDOW_MSG, SRC: LogModuleConstants.FROM_LOG_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH );
   			
   			//Removing listeners
   			logWindow.clear_Btn.removeEventListener(MouseEvent.CLICK , clear);
			//logWindow.debug_box.removeEventListener(Event.CHANGE,changeLevel);
			//logWindow.info_box.removeEventListener(Event.CHANGE,changeLevel);
			//logWindow.warn_box.removeEventListener(Event.CHANGE,changeLevel);
			//logWindow.error_box.removeEventListener(Event.CHANGE,changeLevel);
			logWindow.closeBtn.removeEventListener(MouseEvent.CLICK, removeWindow);
   			
   			msg.setBody(viewComponent as LogModule);
   			outpipe.write(msg);
		}
		/**
		 * getting logModule 
		 * @return LogModule
		 * 
		 */		
		protected function get logModule():LogModule
		{
			return viewComponent as LogModule;
		}
		/**
		 * Handles incoming messages through pipes  
		 * @param message
		 * 
		 */
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG;
		}
		/**
		 * Getting current date and time 
		 * @return Date + Time as String
		 * 
		 */		
		private function time() : String
		{
			var date:Date = new Date();
			var t:String = date.toLocaleTimeString();
			var d:String = date.toLocaleDateString();
			return (t + ", " + d) as String;
		}
		/**
		 * clears Log dispaly 
		 * @param e:Event
		 * 
		 */		
		private function clear(e:MouseEvent)  : void
		{
			//this.logWindow.status_txt.text = "";
		}
		/**
		 * Handler for logWindow checkboxes
		 * @param e:Event
		 * 
		 */		
		/*private function changeLevel(e:Event) : void
		{
			if( logWindow.debug_box.selected) debug = true else debug = false;
			if( logWindow.warn_box.selected) warn = true else warn = false;
			if( logWindow.info_box.selected) info = true else info = false;
			if( logWindow.error_box.selected) error = true else error = false;
		}*/
	}
}