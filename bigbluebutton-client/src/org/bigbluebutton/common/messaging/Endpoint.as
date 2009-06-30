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
package org.bigbluebutton.common.messaging
{
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;

	public class Endpoint
	{
		private var _router:Router;
		private var _fromAddress:String;
		private var _toAddress:String;
		private var _outpipe : OutputPipe;
		private var _inpipe : InputPipe;
		private var _inpipeListener : PipeListener;
				
		public function Endpoint(router:Router, fromAddress:String, toAddress:String, messageReceiver:Function)
		{
			_router = router;
			_fromAddress = fromAddress;
			_toAddress = toAddress;
			
			_inpipe = new InputPipe(_toAddress);
			_outpipe = new OutputPipe(_fromAddress);
			_inpipeListener = new PipeListener(this, messageReceiver);
			_inpipe.connect(_inpipeListener);
			_router.registerOutputPipe(_outpipe.name, _outpipe);
			_router.registerInputPipe(_inpipe.name, _inpipe)			
		}

		public function sendMessage(message:String, dest:String, body:Object):void {
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:message, SRC: _fromAddress,
   						TO: dest });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			msg.setBody(body);
   			_outpipe.write(msg);
		}
	}
}