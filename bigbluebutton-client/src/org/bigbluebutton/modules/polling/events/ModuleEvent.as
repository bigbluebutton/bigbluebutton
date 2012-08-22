/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.polling.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;

	public class ModuleEvent extends Event
	{
		public static const START:String = "Polling Module Start Event";
		public static const STOP:String = "Polling Module Stop Event";
		
		public var module:IBigBlueButtonModule;
		
		public function ModuleEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			this.module = module;
			super(type, bubbles, cancelable);
		}
		
	}
}