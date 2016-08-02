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
package org.bigbluebutton.modules.deskshare.events
{
	import flash.events.Event;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopPublishWindow;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopViewWindow;

	public class ShareEvent extends Event
	{
		public static const START_SHARING:String = "START SHARING";
		public static const STOP_SHARING:String = "STOP SHARING";

		public static const CREATE_DESKTOP_PUBLISH_TAB:String = "CREATE DESKTOP PUBLISH TAB";
		public static const CLEAN_DESKTOP_PUBLISH_TAB:String = "CLEAN DESKTOP PUBLISH TAB";

		public static const OPEN_DESKTOP_VIEW_TAB:String = "OPEN DESKTOP VIEW TAB";
		public static const CLOSE_DESKTOP_VIEW_TAB:String = "CLOSE DESKTOP VIEW TAB";

		public static const SHARE_SCREEN:String = "SHARE SCREEN";
		public static const CHANGE_VIDEO_DISPLAY_MODE:String = "CHANGE VIDEO DISPLAY MODE";
		
		public var publishTabContent:DesktopPublishWindow;
		public var viewTabContent:DesktopViewWindow;
		public var fullScreen:Boolean;

		public function ShareEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}