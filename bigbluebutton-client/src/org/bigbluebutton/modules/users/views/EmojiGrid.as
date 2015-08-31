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
package org.bigbluebutton.modules.users.views {
	
	import com.asfusion.mate.events.Dispatcher;
	import flash.events.MouseEvent;
	import mx.containers.Tile;
	import mx.containers.VBox;
	import mx.controls.Button;
	import mx.core.ScrollPolicy;
	import mx.events.FlexMouseEvent;
	import mx.managers.PopUpManager;
	import org.bigbluebutton.common.Images;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.events.EmojiStatusEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class EmojiGrid extends VBox {
		private const EMOJIS:Array = ["smile", "happy", "sad", "confused", "neutral", "raiseHand", "away"];
		
		private var dispatcher:Dispatcher;
		
		private var images:Images;
		
		public function EmojiGrid() {
			dispatcher = new Dispatcher();
			images = new Images();
			addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, mouseDownOutsideHandler, false, 0, true);
			this.horizontalScrollPolicy = ScrollPolicy.OFF;
			this.verticalScrollPolicy = ScrollPolicy.OFF;
			width = 140;
			minHeight = 80;
			drawEmoji();
			if (UserManager.getInstance().getConference().myEmojiStatus != "none") {
				addRemoveEmoji();
			}
		}
		
		private function drawEmoji():void {
			var tile:Tile = new Tile();
			tile.width = 140;
			tile.styleName = "emojiGridTile";
			tile.horizontalScrollPolicy = ScrollPolicy.OFF;
			this.verticalScrollPolicy = ScrollPolicy.OFF;
			for each (var emoji:String in EMOJIS) {
				var button:Button = new Button();
				button.id = "btn" + emoji;
				button.width = 24;
				button.height = 24;
				button.toggle = true;
				button.setStyle("icon", images["emoji_" + emoji]);
				button.selected = (UserManager.getInstance().getConference().myEmojiStatus == emoji);
				button.enabled = !button.selected;
				button.toolTip = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.' + emoji);
				addEventListener(MouseEvent.CLICK, buttonMouseEventHandler);
				tile.addChild(button);
			}
			this.addChild(tile);
		}
		
		private function addRemoveEmoji():void {
			var button:Button = new Button();
			button.id = "btnnone";
			button.height = 64;
			button.height = 24;
			button.label = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.remove');
			button.addEventListener(MouseEvent.CLICK, buttonMouseEventHandler);
			this.addChild(button);
		}
		
		protected function buttonMouseEventHandler(event:MouseEvent):void {
			var emoji:String = String(event.target.id).replace("btn", "");
			var e:EmojiStatusEvent = new EmojiStatusEvent(EmojiStatusEvent.EMOJI_STATUS, emoji);
			dispatcher.dispatchEvent(e);
			hide();
		}
		
		protected function mouseDownOutsideHandler(event:FlexMouseEvent):void {
			hide();
		}
		
		/**
		 * Hides the menu
		 */
		public function hide():void {
			PopUpManager.removePopUp(this);
		}
	}
}
