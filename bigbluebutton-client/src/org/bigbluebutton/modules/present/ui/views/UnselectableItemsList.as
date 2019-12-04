/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.present.ui.views {
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.ui.Keyboard;

	import mx.controls.List;
	import mx.controls.listClasses.IListItemRenderer;

	public class UnselectableItemsList extends List {
		/**
		 *  The function to apply that determines if the item is "selectable" or not.
		 *  Takes one argument, which is the data item
		 *  Returns true if item can be selected.
		 */
		public var selectableFunction:Function;

		public function UnselectableItemsList():void {
			super();
			this.addEventListener(Event.ADDED, addedEventHandler);
		}

		private function addedEventHandler(event:Event):void {
			if (automationOwner.hasOwnProperty('selectableFunction')) {
				this.selectableFunction = automationOwner['selectableFunction'];
			}
		}

		override protected function mouseEventToItemRenderer(event:MouseEvent):IListItemRenderer {
			var listItem:IListItemRenderer = super.mouseEventToItemRenderer(event);
			if (selectableFunction && listItem && listItem.data && !selectableFunction(listItem.data)) {
				return null;
			}
			return listItem;
		}

		private var selectionUpward:Boolean;

		override protected function moveSelectionVertically(code:uint, shiftKey:Boolean, ctrlKey:Boolean):void {
			if (code == Keyboard.DOWN) {
				selectionUpward = false;
			} else {
				selectionUpward = true;
			}
			super.moveSelectionVertically(code, shiftKey, ctrlKey);
		}

		override protected function finishKeySelection():void {
			super.finishKeySelection();

			var i:int;
			var uid:String;
			var rowCount:int = listItems.length;
			var partialRow:int = (rowInfo[rowCount - 1].y + rowInfo[rowCount - 1].height > listContent.height) ? 1 : 0;

			var listItem:IListItemRenderer;
			listItem = listItems[caretIndex - verticalScrollPosition][0];
			if (listItem && listItem.data && !selectableFunction(listItem.data)) {
				// find another visible item that is enabled
				// assumes there is one that is fully visible
				rowCount = rowCount - partialRow;
				var idx:int = caretIndex - verticalScrollPosition;
				if (selectionUpward) {
					// look up;
					for (i = idx - 1; i >= 0; i--) {
						listItem = listItems[i][0];
						if (selectableFunction(listItem.data)) {
							selectedIndex = i - verticalScrollPosition;
							return;
						}
					}
					for (i = idx + 1; i < rowCount; i++) {
						listItem = listItems[i][0];
						if (selectableFunction(listItem.data)) {
							selectedIndex = i - verticalScrollPosition;
							return;
						}
					}
				} else {
					// look down;
					for (i = idx + 1; i < rowCount; i++) {
						listItem = listItems[i][0];
						if (selectableFunction(listItem.data)) {
							selectedIndex = i - verticalScrollPosition;
							return;
						}
					}
					for (i = idx - 1; i >= 0; i--) {
						listItem = listItems[i][0];
						if (selectableFunction(listItem.data)) {
							selectedIndex = i - verticalScrollPosition;
							return;
						}
					}
				}
			}
		}
	}
}
