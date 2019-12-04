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
package org.bigbluebutton.modules.present.ui.views.models {

	public class SlideCalcUtil {
		public static const HUNDRED_PERCENT:Number = 100;

		// After lots of trial and error on why synching doesn't work properly, I found I had to 
		// multiply the coordinates by 2. There's something I don't understand probably on the
		// canvas coordinate system. (ralam feb 22, 2012)
		public static const MYSTERY_NUM:int = 2;

		/**
		 * Calculate the viewed region width
		 */
		public static function calcViewedRegionWidth(vpw:Number, cpw:Number):Number {
			var width:Number = (vpw / cpw) * HUNDRED_PERCENT;
			if (width > HUNDRED_PERCENT)
				return HUNDRED_PERCENT;
			return width;
		}

		public static function calcViewedRegionHeight(vph:Number, cph:Number):Number {
			var height:Number = (vph / cph) * HUNDRED_PERCENT;
			if (height > HUNDRED_PERCENT)
				return HUNDRED_PERCENT;
			return height;
		}

		public static function calcCalcPageSizeWidth(ftp:Boolean, vpw:Number, vrw:Number):Number {
			if (ftp) {
				return (vpw / vrw) * HUNDRED_PERCENT;
			} else {
				return vpw;
			}
		}

		public static function calcCalcPageSizeHeight(ftp:Boolean, vph:Number, vrh:Number, cpw:Number, cph:Number, opw:Number, oph:Number):Number {
			if (ftp) {
				return (vph / vrh) * HUNDRED_PERCENT;
			} else {
				return (cpw / opw) * oph;
			}
		}

		public static function calcViewedRegionX(cpx:Number, cpw:Number):Number {
			return (cpx * HUNDRED_PERCENT) / cpw;
		}

		public static function calcViewedRegionY(cpy:Number, cph:Number):Number {
			return (cpy * HUNDRED_PERCENT) / cph;
		}

		public static function calculateViewportX(vpw:Number, pw:Number):Number {
			if (vpw == pw) {
				return 0;
			} else {
				return (pw - vpw) / MYSTERY_NUM;
			}
		}

		public static function calculateViewportY(vph:Number, ph:Number):Number {
			if (vph == ph) {
				return 0;
			} else {
				return (ph - vph) / MYSTERY_NUM;
			}
		}
	}
}
