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
package org.bigbluebutton.modules.chat.views
{
	import mx.controls.List;
	import flash.events.MouseEvent;
	import mx.controls.Alert;
	import org.bigbluebutton.modules.chat.views.ChatToolbar;

  
  	public class AdvancedList extends List
  {

	public var toolbar:ChatToolbar;

	public function AdvancedList()
	{
	  toolbar = new ChatToolbar();
	  this.addChild(toolbar);
	  addEventListener(MouseEvent.MOUSE_OVER, handleMouseEvent);
	  addEventListener(MouseEvent.MOUSE_OUT, handleMouseEvent);
	  super();
	}
	
	override protected function measure():void
	{
	  super.measure();
	  //sovled on forum by Flex HarUI
	  measuredHeight = measureHeightOfItems() + viewMetrics.top + viewMetrics.bottom;
	}

	private function mouseIn(e:MouseEvent):void{
		toolbar.positionToolbar();
	}

	private function mouseOut(e:MouseEvent):void{
		toolbar.closeToolbar();
	}

	private function handleMouseEvent(e:MouseEvent):void{
		/*
		Alert.show(e.type, "", Alert.OK);
		return;
		*/
		switch(e.type){
			case MouseEvent.MOUSE_OVER:
				mouseIn(e);
				break;

			case MouseEvent.MOUSE_OUT:
				mouseOut(e)
				break;
		}
	}
  }
}