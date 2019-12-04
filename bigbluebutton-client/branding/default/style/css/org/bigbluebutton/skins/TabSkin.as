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
	import flash.display.DisplayObjectContainer;
	import flash.utils.describeType;
	import flash.utils.getQualifiedClassName;

	import mx.core.EdgeMetrics;
	import mx.core.UIComponent;
	import mx.skins.Border;
	import mx.styles.IStyleClient;

	public class TabSkin extends Border {

		//--------------------------------------------------------------------------
		//
		//  Overridden properties
		//
		//--------------------------------------------------------------------------

		//----------------------------------
		//  borderMetrics
		//----------------------------------

		/**
		 *  @private
		 *  Storage for the borderMetrics property.
		 */
		private var _borderMetrics:EdgeMetrics = new EdgeMetrics(1, 1, 1, 1);

		/**
		 *  @private
		 */
		override public function get borderMetrics():EdgeMetrics {
			return _borderMetrics;
		}

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
			var backgroundAlpha:Number = getStyle("backgroundAlpha");
			var backgroundColor:Number = getStyle("backgroundColor");
			var borderColor:uint = getStyle("borderColor");
			var cornerRadius:Number = getStyle("cornerRadius");

			var fillColorUp:uint = getStyle("fillColorUp");
			var fillColorOver:uint = getStyle("fillColorOver");
			var fillColorDown:uint = getStyle("fillColorDown");
			var fillColorDisabled:uint = getStyle("fillColorDisabled");

			var iconVisible:uint = getStyle("iconVisible");
			var iconColor:uint = getStyle("iconColor");

			var parentedByTabNavigator:Boolean = parent != null && parent.parent != null && parent.parent.parent != null && isTabNavigator(parent.parent.parent);

			var tabOffset:Number = 1;
			if (parentedByTabNavigator)
				tabOffset = Object(parent.parent.parent).borderMetrics.top;

			var drawBottomLine:Boolean = parentedByTabNavigator && IStyleClient(parent.parent.parent).getStyle("borderStyle") != "none" && tabOffset >= 0;

			var cornerRadius2:Number = Math.max(cornerRadius - 2, 0);
			var cr:Object = {tl: cornerRadius, tr: cornerRadius, bl: 0, br: 0};
			var cr2:Object = {tl: cornerRadius2, tr: cornerRadius2, bl: 0, br: 0};

			graphics.clear();

			switch (name) {
				case "upSkin":  {
					// outer edge
					drawRoundRect(0, 0, w, h - 1, cr, borderColor, 1);

					// tab fill
					drawRoundRect(1, 1, w - 2, h - 2, cr2, fillColorUp, 1);

					// tab bottom line
					if (drawBottomLine) {
						drawRoundRect(0, h - tabOffset, w, tabOffset, 0, borderColor, 1);
					}

					break;
				}

				case "overSkin":  {
					// outer edge
					drawRoundRect(0, 0, w, h - 1, cr, borderColor, 1);

					// tab fill
					drawRoundRect(1, 1, w - 2, h - 2, cr2, fillColorOver, 1);

					// tab bottom line
					if (drawBottomLine) {
						drawRoundRect(0, h - tabOffset, w, tabOffset, 0, borderColor, 1);
					}

					break;
				}

				case "disabledSkin":  {
					// outer edge
					drawRoundRect(0, 0, w, h - 1, cr, borderColor, 1);

					// tab fill
					drawRoundRect(1, 1, w - 2, h - 2, cr2, fillColorDisabled, 1);

					// tab bottom line
					if (drawBottomLine) {
						drawRoundRect(0, h - tabOffset, w, tabOffset, 0, borderColor, 1);
					}

					break;
				}

				case "downSkin":
				case "selectedUpSkin":
				case "selectedDownSkin":
				case "selectedOverSkin":
				case "selectedDisabledSkin":  {
					if (isNaN(backgroundColor)) {
						// Walk the parent chain until we find a background color
						var p:DisplayObjectContainer = parent;

						while (p) {
							if (p is IStyleClient)
								backgroundColor = IStyleClient(p).getStyle("backgroundColor");

							if (!isNaN(backgroundColor))
								break;

							p = p.parent;
						}

						// Still no backgroundColor? Use white.
						if (isNaN(backgroundColor))
							backgroundColor = 0xFFFFFF;
					}

					// outer edge
					drawRoundRect(0, 0, w, h - 1, cr, borderColor, 1);

					// tab fill color
					drawRoundRect(1, 1, w - 2, h - 2, cr2, backgroundColor, backgroundAlpha);

					// tab bottom line
					if (drawBottomLine) {
						drawRoundRect(1, h - tabOffset, w - 2, tabOffset, 0, backgroundColor, backgroundAlpha);
					}

					break;
				}
			}

			if (iconVisible) {
				// Draw the icon
				graphics.beginFill(iconColor, 1);
				graphics.drawCircle(10, (h / 2) - 1.5, 3);
				graphics.endFill();
			}

		}


		private static var tabnavs:Object = {};

		private static function isTabNavigator(parent:Object):Boolean {
			var s:String = getQualifiedClassName(parent);
			if (tabnavs[s] == 1)
				return true;

			if (tabnavs[s] == 0)
				return false;

			if (s == "mx.containers::TabNavigator") {
				tabnavs[s] == 1;
				return true;
			}

			var x:XML = describeType(parent);
			var xmllist:XMLList = x.extendsClass.(@type == "mx.containers::TabNavigator");
			if (xmllist.length() == 0) {
				tabnavs[s] = 0;
				return false;
			}

			tabnavs[s] = 1;
			return true;
		}
	}
}
