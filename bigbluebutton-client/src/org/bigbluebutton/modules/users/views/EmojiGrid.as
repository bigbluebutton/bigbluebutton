/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.users.views
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.MouseEvent;
	
	import mx.containers.Box;
	import mx.containers.Tile;
	import mx.controls.Button;
	import mx.events.FlexMouseEvent;
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.events.EmojiStatusEvent;

	public class EmojiGrid extends Tile
	{
		private const EMOJIS:Array=["raiseHand", "smile", "confused", "sad"];

		private var dispatcher:Dispatcher;

		public function EmojiGrid()
		{
			dispatcher=new Dispatcher();

			addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, mouseDownOutsideHandler, false, 0, true);

			width=140;
			maxHeight=80;

			drawEmoji();
			if (UserManager.getInstance().getConference().myEmojiStatus != "none")
			{
				addRemoveEmoji();
			}
		}

		private function drawEmoji():void
		{
			for each (var emoji:String in EMOJIS)
			{
				var button:Button=new Button();
				button.id="btn" + emoji;
				button.width=24;
				button.height=24;
				button.toggle=true;
				button.selected=(UserManager.getInstance().getConference().myEmojiStatus == emoji);
				button.enabled=!button.selected;
				button.toolTip=emoji;
				addEventListener(MouseEvent.CLICK, buttonMouseEventHandler);
				addChild(button);
			}
		}

		private function addRemoveEmoji():void
		{
			var box : Box = new Box();
			box.width = this.width - 20;
			
			var button : Button = new Button();
			button.id "btnnone";
			addEventListener(MouseEvent.CLICK, buttonMouseEventHandler);
			box.addChild(button);
			addChild(box);
		}

		protected function buttonMouseEventHandler(event:MouseEvent):void
		{
			var emoji:String=String(event.target.id).replace("btn", "");
			var e:EmojiStatusEvent=new EmojiStatusEvent(EmojiStatusEvent.EMOJI_STATUS, emoji);
			dispatcher.dispatchEvent(e);
			hide();
		}

		protected function mouseDownOutsideHandler(event:FlexMouseEvent):void
		{
			hide();
		}

		/**
		 * Hides the menu
		 */
		public function hide():void
		{
			PopUpManager.removePopUp(this);
		}
	}
}
