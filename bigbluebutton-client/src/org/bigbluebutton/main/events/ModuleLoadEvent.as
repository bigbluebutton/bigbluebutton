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

	public class ModuleLoadEvent extends Event
	{
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const ALL_MODULES_LOADED:String = "ALL_MODULES_LOADED";
		public static const MODULE_LOADING_STARTED:String = "MODULE_LOADING_START";
		public static const START_ALL_MODULES:String = "START_ALL_MODULES";
		public static const LAYOUT_MODULE_STARTED:String = "LAYOUT_MODULE_STARTED";
    
		public var moduleName:String;
		public var progress:Number;
		
		
		public function ModuleLoadEvent(type:String)
		{
			super(type, true, false);
		}
	}
}