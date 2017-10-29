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
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;

	public class RemovePresentationEvent extends Event
	{
		// Tell the server to remove the presentation.
		public static const REMOVE_PRESENTATION_EVENT:String = "Remove Presentation Event";
		
		// Presentation has been removed from server.
		public static const PRESENTATION_REMOVED_EVENT:String = "Presentation Removed Event";

		// Presentation removed from the list of downloadable events.
		public static const UPDATE_DOWNLOADABLE_FILES_EVENT:String = "Update Downloadable Files Event";
		
		public var presentationName:String;
		public var podId: String;

		public function RemovePresentationEvent(type:String, _podId: String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			this.podId = _podId;
		}
		
	}
}