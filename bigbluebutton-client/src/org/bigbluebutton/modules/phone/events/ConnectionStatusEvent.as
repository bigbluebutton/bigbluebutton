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

package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class ConnectionStatusEvent extends Event
	{
		public static const SUCCESS:String = 'SUCCESS';
		public static const FAILED:String = 'FAILED';
		public static const CLOSED:String = 'CLOSED';
		public static const REJECTED:String = 'REJECTED';
		public static const UNKNOWN:String = 'UNKNOWN';
		
		public static const CONNECTION_STATUS_EVENT:String = 'CONNECTION_STATUS_EVENT';
		
		public var status:String = 'UNKNOWN';
		public var reason:String = 'unknown';
		
		public function ConnectionStatusEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CONNECTION_STATUS_EVENT, bubbles, cancelable);
		}
		
	}
}