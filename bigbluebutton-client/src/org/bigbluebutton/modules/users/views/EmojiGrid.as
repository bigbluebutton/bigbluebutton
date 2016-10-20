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
	
	import mx.containers.HBox;
	import mx.containers.Tile;
	import mx.containers.VBox;
	import mx.controls.Button;
	import mx.controls.Label;
	import mx.core.ScrollPolicy;
	import mx.events.FlexMouseEvent;
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.common.Images;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.events.EmojiStatusEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class EmojiGrid extends VBox {
		private const EMOJIS:Array = ["raiseHand", "happy", "neutral", "sad", "confused", "away", "thumbsUp", "thumbsDown", "applause"];

		private var dispatcher:Dispatcher;

		private var images:Images;

		public function EmojiGrid() {
			dispatcher = new Dispatcher();
			images = new Images();
			addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, mouseDownOutsideHandler, false, 0, true);
			this.horizontalScrollPolicy = ScrollPolicy.OFF;
			this.verticalScrollPolicy = ScrollPolicy.OFF;
			drawEmoji();
			addRemoveEmoji();
			this.setStyle("paddingBottom", 10);
		}

		private function drawEmoji():void {
			var box:VBox = new VBox();
			box.styleName = "emojiGridTile";
			box.horizontalScrollPolicy = ScrollPolicy.OFF;
			this.verticalScrollPolicy = ScrollPolicy.OFF;
			for each (var emoji:String in EMOJIS) {
				var button:Button = new Button();
				button.id = "btn" + emoji;
				button.width = 24;
				button.height = 24;
				button.toggle = true;
				button.setStyle("icon", images["emoji_" + emoji]);
				button.selected = (UserManager.getInstance().getConference().myEmojiStatus == emoji);
				button.toggle = button.selected;
				button.toolTip = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.' + emoji);
				button.addEventListener(MouseEvent.CLICK, buttonMouseEventHandler);
				
				var label:Label = new Label();
				label.text = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.' + emoji);
				
				var hbox:HBox = new HBox();
				hbox.setStyle("verticalAlign", "middle");
				hbox.addChild(button);
				hbox.addChild(label);
				
				box.addChild(hbox);
			}
			this.addChild(box);
		}

		private function addRemoveEmoji():void {
			var button:Button = new Button();
			button.id = "btnnone";
			button.height = 24;
			if (UserManager.getInstance().getConference().myEmojiStatus != "none") {
				button.label = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.clear');
				button.toolTip = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.clear.toolTip');
				button.accessibilityName = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.clear.toolTip');
			} else {
				button.label = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.close');
				button.toolTip = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.close.toolTip');
				button.accessibilityName = ResourceUtil.getInstance().getString('bbb.users.emojiStatus.close.toolTip');
			}
			button.addEventListener(MouseEvent.CLICK, buttonMouseEventHandler);
			this.addChild(button);
		}

		protected function buttonMouseEventHandler(event:MouseEvent):void {
			var clickedButton:Button = event.target as Button;
			if (!clickedButton.toggle) {
				var emoji:String = String(event.target.id).replace("btn", "");
				var e:EmojiStatusEvent = new EmojiStatusEvent(EmojiStatusEvent.EMOJI_STATUS, emoji);
				dispatcher.dispatchEvent(e);
			} else {
				dispatcher.dispatchEvent(new EmojiStatusEvent(EmojiStatusEvent.EMOJI_STATUS, "none"));
			}
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
