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

package org.bigbluebutton.modules.videoconf.business
{
	import mx.containers.HBox;
	import mx.controls.Button;
	import flash.utils.Dictionary;
	import flash.events.MouseEvent;
	import org.bigbluebutton.common.LogUtil;
	
	public class ButtonsOverlay extends HBox
	{
		private var buttons:Dictionary = new Dictionary;
		private var BUTTONS_SIZE:int = 20;
		private var BUTTONS_PADDING:int = 10;
		
		public function add(name:String, icon:Class, tooltip:String, listener:Function):void {
			var button:Button = new Button;
			button.setStyle("icon", icon);
			button.toolTip = tooltip;
			button.addEventListener(MouseEvent.CLICK, listener);
			button.width = button.height = BUTTONS_SIZE;
			this.addChild(button);
			buttons[name] = button;
		}
		
		public function get(name:String):Button {
			var tmp:Object = buttons[name];
			//return (flash.utils.getQualifiedClassName(tmp) == "mx.controls::Button"? (tmp as Button): null);
			return (tmp as Button);
		}
		
		public function get padding():int {
			return BUTTONS_PADDING;
		}
	}
	
}