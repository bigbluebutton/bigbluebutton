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

	public class PlayStreamStatusEvent extends Event
	{
		public static const STREAM_NOT_FOUND:String = 'STREAM_NOT_FOUND';
		public static const FAILED:String = 'FAILED';
		public static const START:String = 'START';
		public static const STOP:String = 'STOP';
		public static const BUFFER_FULL:String = 'BUFFER_FULL';
		public static const UNKNOWN:String = 'UNKNOWN';
		
		public static const PLAY_STREAM_STATUS_EVENT:String = 'PLAY_STREAM_STATUS_EVENT';
		
		public var status:String = UNKNOWN;
		
		public function PlayStreamStatusEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(PLAY_STREAM_STATUS_EVENT, bubbles, cancelable);
		}
		
	}
}