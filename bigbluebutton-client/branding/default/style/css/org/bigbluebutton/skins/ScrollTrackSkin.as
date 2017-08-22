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
	import mx.skins.Border;

	public class ScrollTrackSkin extends Border {

		//--------------------------------------------------------------------------
		//
		//  Overridden properties
		//
		//--------------------------------------------------------------------------

		//----------------------------------
		//  measuredWidth
		//----------------------------------

		/**
		 *  @private
		 */
		override public function get measuredWidth():Number {
			return 8;
		}

		//----------------------------------
		//  measuredHeight
		//----------------------------------

		/**
		 *  @private
		 */
		override public function get measuredHeight():Number {
			return 5;
		}

		//--------------------------------------------------------------------------
		//
		//  Overridden methods
		//
		//--------------------------------------------------------------------------

		/**
		 *  @private
		 */
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);

			// User-defined styles.
			var trackColor:uint = getStyle("trackColor");
			var cornerRadius:Number = getStyle("cornerRadius");

			graphics.clear();

			var fillAlpha:Number = 1;

			if (name == "trackDisabledSkin")
				fillAlpha = .2;

			// fill
			drawRoundRect(0, 0, w, h, cornerRadius, trackColor, fillAlpha);
		}
	}
}
