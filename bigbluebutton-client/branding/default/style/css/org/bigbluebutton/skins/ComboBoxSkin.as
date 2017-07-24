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
	import flash.display.Graphics;

	import mx.core.UIComponent;
	import mx.skins.Border;

	public class ComboBoxSkin extends Border {

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
			var arrowColor:uint = getStyle("iconColor");
			var arrowAlpha:Number = 1;

			var borderColorUp:uint = getStyle("borderColorUp");
			var borderColorOver:uint = getStyle("borderColorOver");
			var borderColorDown:uint = getStyle("borderColorDown");
			var borderColorDisabled:uint = getStyle("borderColorDisabled");

			var borderThickness:uint = getStyle("borderThickness");

			var fillColorUp:uint = getStyle("fillColorUp");
			var fillColorOver:uint = getStyle("fillColorOver");
			var fillColorDown:uint = getStyle("fillColorDown");
			var fillColorDisabled:uint = getStyle("fillColorDisabled");

			var cornerRadius:Number = getStyle("cornerRadius");
			var dropdownBorderColor:Number = getStyle("dropdownBorderColor");

			// The dropdownBorderColor is currently only used
			// when displaying an error state.
			if (!isNaN(dropdownBorderColor))
				borderColorUp = dropdownBorderColor;

			var cornerRadius1:Number = Math.max(cornerRadius - 1, 0);
			var cr:Object = {tl: 0, tr: cornerRadius, bl: 0, br: cornerRadius};
			var cr1:Object = {tl: 0, tr: cornerRadius - borderThickness, bl: 0, br: cornerRadius - borderThickness};

			var arrowOnly:Boolean = true;

			// If our name doesn't include "editable", we are drawing the non-edit
			// skin which spans the entire control
			if (name.indexOf("editable") < 0) {
				arrowOnly = false;
				cr.tl = cr.bl = cornerRadius;
				cr1.tl = cr1.bl = cornerRadius1;
			}

			var g:Graphics = graphics;

			g.clear();

			// Draw the border and fill.
			switch (name) {
				case "upSkin":
				case "editableUpSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorUp, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);

					if (!arrowOnly) {
						// line
						drawRoundRect(w - 22, 4, 1, h - 8, 0, borderColorUp, 1);
						drawRoundRect(w - 21, 4, 1, h - 8, 0, 0xFFFFFF, 0.2);
					}

					break;
				}

				case "overSkin":
				case "editableOverSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorOver, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorOver, 1);

					if (!arrowOnly) {
						// line
						drawRoundRect(w - 22, 4, 1, h - 8, 0, borderColorOver, 1);
						drawRoundRect(w - 21, 4, 1, h - 8, 0, 0xFFFFFF, 0.2);
					}

					break;
				}

				case "downSkin":
				case "editableDownSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorDown, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDown, 1);

					if (!arrowOnly) {
						// line
						drawRoundRect(w - 22, 4, 1, h - 8, 0, fillColorDown, 1);
						drawRoundRect(w - 21, 4, 1, h - 8, 0, 0xFFFFFF, 0.2);
					}

					break;
				}

				case "disabledSkin":
				case "editableDisabledSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorDisabled, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDisabled, 1);

					if (!arrowOnly) {
						// line
						drawRoundRect(w - 22, 4, 1, h - 8, 0, 0x999999, 0.5);
					}

					arrowColor = getStyle("disabledIconColor");
					arrowAlpha = 0.45;

					break;
				}
			}

			// Draw the triangle.
			g.beginFill(arrowColor, arrowAlpha);
			g.moveTo(w - 10, h / 2 + 1.9);
			g.lineTo(w - 13, h / 2 - 2);
			g.lineTo(w - 7, h / 2 - 2);
			g.lineTo(w - 10, h / 2 + 1.9);
			g.endFill();
		}
	}
}
