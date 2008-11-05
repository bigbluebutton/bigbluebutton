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
	 * The class is used by the module to receive messages from the Router.
	 */
	public class InputPipe implements IPipeFitting
	{
		private var NAME : String;
		
		// Pipe used to send message into the module.
		private var output : Pipe = new Pipe();
		
		public function InputPipe(name : String)
		{
			NAME = name;
		}
		
		public function get name() : String
		{
			return NAME;
		}
		
		/**
		 * Used by the router to send message into the module.
		 */
        public function write( message:IPipeMessage ) : Boolean
        {
            return output.write( message );
        }

		public function connect( listener:IPipeFitting ) : Boolean
		{
			return output.connect(listener);			
		}
		
		public function disconnect( ) : IPipeFitting
		{
			return output.disconnect();
		}
	}
}