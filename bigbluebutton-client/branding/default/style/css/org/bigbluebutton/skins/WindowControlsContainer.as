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
package org.bigbluebutton.skins {
	import flash.display.DisplayObject;

	import mx.core.UITextField;

	import flexlib.mdi.containers.MDIWindowControlsContainer;

	public class WindowControlsContainer extends MDIWindowControlsContainer {

		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);

			if (window.showControls) {
				// respect window's showCloseButton property
				closeBtn.visible = closeBtn.includeInLayout = window.showCloseButton;

				// since we're in rawChildren we don't get measured and laid out by our parent
				// this routine finds the bounds of our children and sets our size accordingly
				var minX:Number = 9999;
				var minY:Number = 9999;
				var maxX:Number = -9999;
				var maxY:Number = -9999;
				for each (var child:DisplayObject in this.getChildren()) {
					if (child != window.closeBtn || child == window.closeBtn && window.showCloseButton) {
						minX = Math.min(minX, child.x);
						minY = Math.min(minY, child.y);
						maxX = Math.max(maxX, child.x + child.width);
						maxY = Math.max(maxY, child.y + child.height);
					}
				}
				this.setActualSize(maxX - minX, maxY - minY);

				// now that we're sized we set our position
				// right aligned, respecting border width
				this.x = window.width - this.width - Number(window.getStyle("titlePaddingRight"));
				// vertically centered
				this.y = (window.titleBarOverlay.height - this.height) / 2;
			}

			// lay out the title field and icon (if present)
			var tf:UITextField = window.getTitleTextField();
			var icon:DisplayObject = window.getTitleIconObject();

			tf.x = Number(window.getStyle("titlePaddingLeft"));

			if (icon) {
				icon.x = tf.x;
				tf.x = icon.x + icon.width + 4;
			}

			// ghetto truncation
			if (!window.minimized) {
				tf.width = this.x - tf.x;
			} else {
				tf.width = window.width - tf.x - 4;
			}
		}
	}
}
