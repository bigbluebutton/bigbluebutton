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
package org.bigbluebutton.common {
	import flash.events.Event;

	import mx.controls.ComboBox;
	import mx.core.mx_internal;
	import mx.styles.ISimpleStyleClient;
	import mx.styles.StyleProtoChain;

	/**
	 * This ComboboxHas a special behaviour. If its CSS property `closePopUpOnStyleUpdate`
	 * is set to false all the default behaviour will be exectued without closing the open
	 * popup component. If set to true it will behave like a classical MX ComboBox
	 */
	public class ComboBox2 extends ComboBox {

		/**
		 *  @private
		 *  Static constant representing no cached layout direction style value.
		 */
		private static const LAYOUT_DIRECTION_CACHE_UNSET:String = "layoutDirectionCacheUnset";

		/**
		 *  @private
		 *  Cached layout direction style
		 */
		private var layoutDirectionCachedValue:String = LAYOUT_DIRECTION_CACHE_UNSET;

		/**
		 *  @private
		 */
		override public function styleChanged(styleProp:String):void {
			if (getStyle('closePopUpOnStyleUpdate') == true) {
				super.styleChanged(styleProp);
				return;
			}
			// Do not call destroyDropdown(); but continue processing
			// the remaining component parts

			if (mx_internal::downArrowButton)
				mx_internal::downArrowButton.styleChanged(styleProp);

			if (textInput)
				textInput.styleChanged(styleProp);

			if (mx_internal::border && mx_internal::border is ISimpleStyleClient)
				ISimpleStyleClient(mx_internal::border).styleChanged(styleProp);

			var allStyles:Boolean = !styleProp || styleProp == "styleName";

			StyleProtoChain.styleChanged(this, styleProp);

			if (!allStyles) {
				if (hasEventListener(styleProp + "Changed"))
					dispatchEvent(new Event(styleProp + "Changed"));
			} else {
				if (hasEventListener("allStylesChanged"))
					dispatchEvent(new Event("allStylesChanged"));
			}

			if (allStyles || styleProp == "layoutDirection")
				layoutDirectionCachedValue = LAYOUT_DIRECTION_CACHE_UNSET;
		}

		/**
		 *  @inheritDoc
		 */
		override public function get layoutDirection():String {
			if (layoutDirectionCachedValue == LAYOUT_DIRECTION_CACHE_UNSET) {
				layoutDirectionCachedValue = getStyle("layoutDirection");
			}
			return layoutDirectionCachedValue;
		}
	}
}
