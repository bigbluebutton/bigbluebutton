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
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.Pipe;
	
	/**
	 * This class is used by the module to send messages to the Router.
	 */
	public class OutputPipe implements IPipeFitting
	{
		private var NAME : String;
		
		// Pipe used to receive messages from the module.
		private var input : Pipe = new Pipe();
		
		public function OutputPipe(name : String)
		{
			NAME = name;
		}

		public function get name() : String
		{
			return NAME;
		}
		
		public function connect( output:IPipeFitting ) : Boolean
		{
			return input.connect(output);
		}
		
		public function disconnect( ) : IPipeFitting
		{
			return input.disconnect();
		}
		
		/**
		 * To send a message, add a header with SRC and TO fields as a convention.
		 * The Router will look at the TO field and routes the message to the
		 * correct inputpipe for a module.
		 * e.g. 			// create a message
   		 *	var messageToSend:IPipeMessage = new Message( Message.NORMAL, 
   		 *											      { SRC:'MAININPUT', TO: 'LOGGERINPUT' },
   		 *												  new XML(<testMessage testAtt='Hello'/>),
   		 *											      Message.PRIORITY_HIGH );
		 */		
		public function write( message:IPipeMessage ) : Boolean
		{
			return input.write(message);
		}
	}
}