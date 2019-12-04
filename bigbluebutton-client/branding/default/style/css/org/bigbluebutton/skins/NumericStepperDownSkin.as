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

////////////////////////////////////////////////////////////////////////////////
//
//  Licensed to the Apache Software Foundation (ASF) under one or more
//  contributor license agreements.  See the NOTICE file distributed with
//  this work for additional information regarding copyright ownership.
//  The ASF licenses this file to You under the Apache License, Version 2.0
//  (the "License"); you may not use this file except in compliance with
//  the License.  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////

package org.bigbluebutton.skins {
	import flash.display.Graphics;

	import mx.skins.Border;

	public class NumericStepperDownSkin extends Border {

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
			return 19;
		}

		//----------------------------------
		//  measuredHeight
		//----------------------------------

		/**
		 *  @private
		 */
		override public function get measuredHeight():Number {
			return 11;
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

			var borderColorUp:uint = getStyle("borderColorUp");
			var borderColorOver:uint = getStyle("borderColorOver");
			var borderColorDown:uint = getStyle("borderColorDown");
			var borderColorDisabled:uint = getStyle("borderColorDisabled");

			var borderThickness:uint = getStyle("borderThickness");

			var fillColorUp:uint = getStyle("fillColorUp");
			var fillColorOver:uint = getStyle("fillColorOver");
			var fillColorDown:uint = getStyle("fillColorDown");
			var fillColorDisabled:uint = getStyle("fillColorDisabled");

			// User-defined styles.
			var arrowColor:uint = getStyle("iconColor");
			var arrowColorOver:uint = getStyle("iconColorOver");
			var arrowColorDown:uint = getStyle("iconColorDown");

			var cornerRadius:Number = getStyle("cornerRadius");

			var cr:Object = {tl: 0, tr: 0, bl: 0, br: cornerRadius};
			var cr1:Object = {tl: 0, tr: 0, bl: 0, br: Math.max(cornerRadius - 1, 0)};

			// Draw the background and border.
			var g:Graphics = graphics;

			g.clear();

			switch (name) {
				case "downArrowUpSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorUp, 1, null, null, null, {x: 1, y: 0, w: w - 2, h: h - 1, r: cr1});

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);

					break;
				}

				case "downArrowOverSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorOver, 1, null, null, null, {x: 1, y: 0, w: w - 2, h: h - 1, r: cr1});

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorOver, 1, null);

					break;
				}

				case "downArrowDownSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorDown, 1);

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDown, 1);

					break;
				}

				case "downArrowDisabledSkin":  {
					// border
					drawRoundRect(0, 0, w, h, cr, borderColorDisabled, 0.5, null, null, null, {x: 1, y: 0, w: w - 2, h: h - 1, r: cr1});

					// button fill
					drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDisabled, 0.5, null);

					arrowColor = getStyle("disabledIconColor");
					break;
				}
			}

			// Draw the arrow.
			g.beginFill(arrowColor);
			g.moveTo(w / 2, h / 2 + 1.5);
			g.lineTo(w / 2 - 3.5, h / 2 - 2.5);
			g.lineTo(w / 2 + 3.5, h / 2 - 2.5);
			g.lineTo(w / 2, h / 2 + 1.5);
			g.endFill();
		}
	}
}

