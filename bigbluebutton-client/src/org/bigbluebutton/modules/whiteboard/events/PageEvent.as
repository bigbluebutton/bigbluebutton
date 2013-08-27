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
package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	public class PageEvent extends Event
	{
		public static const CHANGE_PAGE:String = "ChangePage";
		public static const LOAD_PAGE:String = "LoadPage";
		
		public var pageNum:Number;
		public var graphicObjs:ArrayCollection;
		public var isGrid:Boolean;
		
		public function PageEvent(type:String)
		{
			super(type, true, false);
		}

	}
}