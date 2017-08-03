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
	import flash.utils.describeType;
	import flash.utils.getQualifiedClassName;

	import mx.core.mx_internal;
	import mx.skins.halo.PanelSkin;

	use namespace mx_internal;

	public class PanelSkin extends mx.skins.halo.PanelSkin {

		/**
		 *  We don't use 'is' to prevent dependency issues
		 *
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		private static var panels:Object = {};

		private static function isPanel(parent:Object):Boolean {
			var s:String = getQualifiedClassName(parent);
			if (panels[s] == 1)
				return true;

			if (panels[s] == 0)
				return false;

			if (s == "mx.containers::Panel") {
				panels[s] == 1;
				return true;
			}

			var x:XML = describeType(parent);
			var xmllist:XMLList = x.extendsClass.(@type == "mx.containers::Panel");
			if (xmllist.length() == 0) {
				panels[s] = 0;
				return false;
			}

			panels[s] = 1;
			return true;
		}

		override mx_internal function drawBackground(w:Number, h:Number):void {
			super.drawBackground(w, h);

			if (getStyle("showHeaderSeparator") == true) {
				var g:Graphics = graphics;

				var hasPanelParent:Boolean = isPanel(parent);
				var hHeight:Number = hasPanelParent ? Object(parent).getHeaderHeightProxy() : NaN;

				// Fill in the content area
				g.beginFill(Number(backgroundColor), 1);

				g.lineStyle(1, getStyle("borderColor"), 1);
				g.moveTo(1, hHeight);
				g.lineTo(w - 1, hHeight);
				g.endFill();
			}
		}

	}
}
