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
package org.bigbluebutton.modules.video.model.services
{
	import flash.net.NetConnection;
	
	public class StreamFactory
	{
		private var _conn:NetConnection;
		
		public function StreamFactory(connection:NetConnection)
		{
			_conn = connection;
		}

		public function createBroadcastStream():BroadcastStream {
			return new BroadcastStream(_conn);
		}
		
		public function createPlayStream():PlayStream {
			return new PlayStream(_conn);
		}
	}
}