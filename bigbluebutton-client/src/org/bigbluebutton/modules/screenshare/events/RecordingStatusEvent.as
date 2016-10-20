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
package org.bigbluebutton.modules.screenshare.events
{
	import flash.events.Event;

	public class RecordingStatusEvent extends Event
	{
		public static const DESKSHARE_RECORD_EVENT = "SCREENSHARE RECORD EVENT";
		
		public static const RECORD_STOPPED_EVENT = "SCREENSHARE RECORD STOPPED EVENT";
		public static const RECORD_STARTED_EVENT = "SCREENSHARE RECORD STARTED EVENT";
		public static const RECORD_UPDATED_EVENT = "SCREENSHARE RECORD UPDATED EVENT";
		public static const RECORD_ERROR_EVENT = "SCREENSHARE RECORD ERROR EVENT";
		
		public var status:String;
		
		public function RecordingStatusEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}