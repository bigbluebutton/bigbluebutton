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
package org.bigbluebutton.modules.breakout.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.breakout.views.BreakoutButton;

	public class BreakoutManager
	{
		private var dispatcher:Dispatcher;
		
		private var button:BreakoutButton;
		
		public function BreakoutManager()
		{
			dispatcher = new Dispatcher();
			button = new BreakoutButton;
		}
		
		public function addButton(attributes:Object):void{
			if (attributes.userrole != "MODERATOR") return;
			var e:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
			e.button = button;
			dispatcher.dispatchEvent(e);
		}
	}
}