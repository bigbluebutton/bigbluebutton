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
package org.bigbluebutton.common
{
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.messaging.InputPipe;
	import org.bigbluebutton.common.messaging.OutputPipe;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * This is a convinience class you can extend when creating a module. It abstracts away many annoying parts concerning
	 * communication with the BigBlueButton core. 
	 * @author Denis
	 * 
	 */	
	public class ModuleMediator extends Mediator implements IMediator
	{
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		private var displayComponent:MDIWindow;
		private var name:String;
		private var toString:String;
		private var fromString:String;
		
		/**
		 * The Constructor. 
		 * @param viewComponent - Your BigBlueButtonModule class
		 * @param toString - A constant String that the Core program will use to communicate to your module
		 * @param fromString - A constant String that your program will use to communicate to the Core program
		 * 
		 */		
		public function ModuleMediator(viewComponent:BigBlueButtonModule, toString:String, fromString:String)
		{
			super(name, viewComponent);
			router = viewComponent.router;
			this.toString = toString;
			this.fromString = fromString;
			inpipe = new InputPipe(toString);
			outpipe = new OutputPipe(fromString);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			displayComponent = viewComponent.getMDIComponent();
			addWindow();
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
   			msg.setHeader( {MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: fromString,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH );
   			
   			msg.setBody(this.viewComponent as BigBlueButtonModule);
   			outpipe.write(msg);
		}
		
		/**
		 * Messages sent to your module will be received here. Override this function if you wish to receive them 
		 * @param message
		 * 
		 */		
		protected function messageReceiver(message:IPipeMessage):void{
			
		}

	}
}