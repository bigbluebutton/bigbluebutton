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
package org.bigbluebutton.modules.video.view.events
{
	import flash.events.Event;

	public class CloseViewCameraWindowEvent extends Event
	{
		public static const CLOSE_VIEW_CAMERA_WINDOW_EVENT:String = "CLOSE_VIEW_CAMERA_WINDOW_EVENT";
		public var streamName:String;
					
		public function CloseViewCameraWindowEvent(streamName:String)
		{
			super(CLOSE_VIEW_CAMERA_WINDOW_EVENT);
			this.streamName = streamName;
		}
		
	}
}