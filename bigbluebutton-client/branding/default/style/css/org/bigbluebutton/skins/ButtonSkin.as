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
	import mx.core.UIComponent;
	import mx.skins.Border;

	public class ButtonSkin extends Border {

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
			return UIComponent.DEFAULT_MEASURED_MIN_WIDTH;
		}

		//----------------------------------
		//  measuredHeight
		//----------------------------------

		/**
		 *  @private
		 */
		override public function get measuredHeight():Number {
			return UIComponent.DEFAULT_MEASURED_MIN_HEIGHT;
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
			var cornerRadius:Number = getStyle("cornerRadius");

			// Normal state
			var borderColorUp:uint = getStyle("borderColorUp");
			var borderColorOver:uint = getStyle("borderColorOver");
			var borderColorDown:uint = getStyle("borderColorDown");
			var borderColorDisabled:uint = getStyle("borderColorDisabled");

			var borderAlphaUp:uint = getStyle("borderAlphaUp");
			var borderAlphaOver:uint = getStyle("borderAlphaOver");
			var borderAlphaDown:uint = getStyle("borderAlphaDown");
			var borderAlphaDisabled:uint = getStyle("borderAlphaDisabled");

			var borderThickness:uint = getStyle("borderThickness");

			var fillColorUp:uint = getStyle("fillColorUp");
			var fillColorOver:uint = getStyle("fillColorOver");
			var fillColorDown:uint = getStyle("fillColorDown");
			var fillColorDisabled:uint = getStyle("fillColorDisabled");

			// Selected state
			var borderColorSelectedUp:uint = getStyle("borderColorSelectedUp");
			var borderColorSelectedOver:uint = getStyle("borderColorSelectedOver");
			var borderColorSelectedDown:uint = getStyle("borderColorSelectedDown");
			var borderColorSelectedDisabled:uint = getStyle("borderColorSelectedDisabled");

			var fillColorSelectedUp:uint = getStyle("fillColorSelectedUp");
			var fillColorSelectedOver:uint = getStyle("fillColorSelectedOver");
			var fillColorSelectedDown:uint = getStyle("fillColorSelectedDown");
			var fillColorSelectedDisabled:uint = getStyle("fillColorSelectedDisabled");

			// Corner radius
			var cr:Number = Math.max(0, cornerRadius);
			var cr1:Number = Math.max(0, cornerRadius - borderThickness);

			graphics.clear();

			switch (name) {
				case "selectedUpSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorSelectedUp, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorSelectedUp, 1);
					break;
				}

				case "selectedOverSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorSelectedOver, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorSelectedOver, 1);
					break;
				}

				case "selectedDownSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorSelectedDown, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorSelectedDown, 1);
					break;
				}

				case "selectedDisabledSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorSelectedDisabled, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorSelectedDisabled, 1);
					break;
				}

				case "upSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorUp, borderAlphaUp);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);
					break;
				}

				case "overSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorOver, borderAlphaOver);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorOver, 1);
					break;
				}

				case "downSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorDown, borderAlphaDown);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDown, 1);
					break;
				}


				case "disabledSkin":  {
					// button border/edge
					drawRoundRect(0, 0, w, h, cr, borderColorDisabled, borderAlphaDisabled);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDisabled, 1);
					break;
				}

			}
		}
	}
}
