/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	import flash.net.NetConnection;

	public class PlayConnectionReady extends Event
	{
		public static const PLAY_CONNECTION_READY:String = "a netconnetion is ready";

		private var _streamName:String;
		public function get streamName():String { return _streamName; }

		private var _connection:NetConnection;
		public function get connection():NetConnection { return _connection; }

		private var _prefix:String;
		public function get prefix():String { return _prefix; }

		public function PlayConnectionReady(streamName:String, conn:NetConnection, prefix:String)
		{
			_streamName = streamName;
			_connection = conn;
			_prefix = prefix;
			var type:String = PLAY_CONNECTION_READY; 
			var bubbles:Boolean = true;
			var cancelable:Boolean = false;
			super(type, bubbles, cancelable);
		}
	}
}
