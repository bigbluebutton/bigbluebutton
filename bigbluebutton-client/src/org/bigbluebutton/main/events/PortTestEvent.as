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
package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class PortTestEvent extends Event
	{
		public static const TEST_RTMP:String = "TEST_RTMP_CONNECTION";
		public static const TEST_RTMPT:String = "TEST_RTMPT_CONNECTION";
		
		public static const PORT_TEST_SUCCESS:String = "PORT_TEST_SUCESS";
		public static const PORT_TEST_FAILED:String = "PORT_TEST_FAILED";
		public static const PORT_TEST_UPDATE:String = "PORT_TEST_UPDATE";
		public static const TUNNELING_FAILED:String = "RTMTP_ALSO_FAILED";
		
		public var tunnel:Boolean;
		public var hostname:String;
		public var port:String;
		public var app:String;
		
		public function PortTestEvent(type:String)
		{
			super(type, true, false);
		}
	}
}