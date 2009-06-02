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
package org.bigbluebutton.common.messaging
{
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeFitting;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.Junction;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.TeeMerge;
	
	/**
	 * The Router is responsible for routing messages between cores/modules
	 * in the BigBlueButton system.
	 * 
	 * Modules register an InputPipe where it wants to receive messages and
	 * an OutputPipe where it uses to send messages to other modules. 
	 */ 
	public class Router
	{
		// Listens from messages from the core and routes messages.
		private var inputMessageRouter : PipeListener;
		
		// Merges all OutputPipes from the modules so that the Router
		// will have only one listener.
		//    outpipe --->|
		//    outpipe --->|---> listener ---> inputpipe
		//    outpipe --->|
		//
		private var teeMerge:TeeMerge = new TeeMerge( );
		
		// Stores all our INPUT and OUTPUT Pipes
		private var junction : Junction = new Junction();
		
		public function Router()
		{
			inputMessageRouter = new PipeListener(this, routeMessage);
			teeMerge.connect(inputMessageRouter);
		}
		
		/**
		 * Register an InputPipe to receive a message from the Router.
		 */
		public function registerInputPipe(name : String, pipe: IPipeFitting) : void
		{
			LogUtil.debug("Registering input pipe: " + name);
			// Register the pipe as an OUTPUT because the Router will use this
			// pipe to send OUT to the module.
			junction.registerPipe(name, Junction.OUTPUT, pipe);
		}
		
		/**
		 * Register an OutputPipe to send a message to other modules through the Router.
		 */
		public function registerOutputPipe(name : String, pipe: IPipeFitting) : void
		{
			LogUtil.debug("Registering output pipe: " + name);
			// Register the pipe as an INPUT because the Router will use this
			// pipe to receive messages from the module.
			junction.registerPipe(name, Junction.INPUT, pipe);
			teeMerge.connectInput(pipe);
		}
		
		/**
		 * Routes the message using the TO field in the Message Header.
		 * The TO field contains the name of the INPUT Pipe.
		 */
		private function routeMessage(message:IPipeMessage):void
		{
			LogUtil.debug('routing message to ' + message.getHeader().TO);			
			var TO : String = message.getHeader().TO;
			var haspipe : Boolean = junction.hasOutputPipe(TO);
			//LogUtil.debug('There is a pipe with name ' + message.getHeader().TO + " = " + haspipe);
			var success: Boolean = junction.sendMessage(TO, message);
			//LogUtil.debug('Successfully routed message ' + message.getHeader().MSG + ' to ' + message.getHeader().TO + " = " + success);				
		}
	}
}