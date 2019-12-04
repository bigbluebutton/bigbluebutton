/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.main.views {
	import flash.events.MouseEvent;
	
	import mx.containers.HBox;
	import mx.containers.VBox;
	import mx.controls.Image;
	import mx.core.UIComponent;
	
	import org.as3commons.lang.StringUtils;

	public class StarRating extends HBox {

		[Bindable]
		public var rating:int = 0;

		private function setRating(value:int):void {
			rating = value;
		}

		override protected function createChildren():void {
			super.createChildren();

			for (var i:int = 1; i <= 5; i++) {
				addStar(i);
			}
		}

		private function addStar(index:int):void {
			var starBox:VBox = new VBox();
			starBox.id = "starBox" + index;
			starBox.styleName = "starBoxStyle";
			starBox.width = 50;
			starBox.addEventListener(MouseEvent.MOUSE_OVER, starBoxMouseOverHandler);
			starBox.addEventListener(MouseEvent.MOUSE_OUT, starBoxMouseOutHandler);
			starBox.addEventListener(MouseEvent.CLICK, starBoxClickHandler);
			var starImage:Image = new Image();
			starImage.source = getStyle('emptyStar');
			starBox.addChild(starImage);
			this.addChild(starBox);
		}

		private function starBoxMouseOverHandler(event:MouseEvent):void {
			fillStars(getCurrentBoxIndex(event.currentTarget as UIComponent));
		}

		private function starBoxMouseOutHandler(event:MouseEvent):void {
			fillStars(rating);
		}

		private function fillStars(max:int):void {
			for (var i:int = 1; i <= max; i++) {
				Image(VBox(getChildAt(i - 1)).getChildAt(0)).source = getStyle('filledStar');
			}
			for (var j:int = max + 1; j <= numChildren; j++) {
				Image(VBox(getChildAt(j - 1)).getChildAt(0)).source = getStyle('emptyStar');
			}
		}

		private function starBoxClickHandler(event:MouseEvent):void {
			setRating(getCurrentBoxIndex(event.currentTarget as UIComponent));
		}

		private function getCurrentBoxIndex(component:UIComponent):int {
			return parseInt(StringUtils.remove(component.id, "starBox"));
		}
	}
}
