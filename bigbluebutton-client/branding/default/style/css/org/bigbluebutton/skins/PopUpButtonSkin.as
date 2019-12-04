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
    import flash.display.DisplayObject;

    import mx.core.IFlexDisplayObject;
    import mx.core.IProgrammaticSkin;
    import mx.core.UIComponent;
    import mx.core.mx_internal;
    import mx.skins.halo.PopUpIcon;

    use namespace mx_internal;

    public class PopUpButtonSkin extends UIComponent implements IProgrammaticSkin {

        //--------------------------------------------------------------------------
        //
        //  Constructor
        //
        //--------------------------------------------------------------------------

        private var popUpIcon:IFlexDisplayObject;

        /**
         *  Constructor.
         *
         *  @langversion 3.0
         *  @playerversion Flash 9
         *  @playerversion AIR 1.1
         *  @productversion Flex 3
         */
        public function PopUpButtonSkin() {
            super();

            mouseEnabled = false;
        }

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
            return DEFAULT_MEASURED_MIN_WIDTH;
        }

        //----------------------------------
        //  measuredHeight
        //----------------------------------

        /**
         *  @private
         */
        override public function get measuredHeight():Number {
            return DEFAULT_MEASURED_MIN_HEIGHT;
        }

        //--------------------------------------------------------------------------
        //
        //  Overridden methods
        //
        //--------------------------------------------------------------------------

        /**
         * Create resize handles and window controls.
         */
        override protected function createChildren():void {
            popUpIcon = IFlexDisplayObject(getChildByName("popUpIcon"));

            if (!popUpIcon) {
                var popUpIconClass:Class = Class(getStyle("popUpIcon"));
                popUpIcon = new popUpIconClass();
                DisplayObject(popUpIcon).name = "popUpIcon";
                addChild(DisplayObject(popUpIcon));
                DisplayObject(popUpIcon).visible = true;
            }
        }

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

            var arrowButtonWidth:Number = Math.max(getStyle("arrowButtonWidth"), popUpIcon.width + 3 + borderThickness);

            var dividerPosX:Number = w - arrowButtonWidth;

            popUpIcon.move(w - (arrowButtonWidth + popUpIcon.width) / 2, (h - popUpIcon.height) / 2);

            // Corner radius
            var cr:Number = Math.max(0, cornerRadius);
            var cr1:Number = Math.max(0, cornerRadius - borderThickness);

            graphics.clear();

            switch (name) {
                case "upSkin":  {
                    // button border/edge
                    drawRoundRect(0, 0, w, h, cr, borderColorUp, 1);

                    // button fill
                    drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorUp, 1);

                    break;
                }
                case "overSkin": // for hover on the main button (left) side
                {
                    // button border/edge
                    drawRoundRect(0, 0, w, h, cr, borderColorOver, 1);

                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), 0, borderColorOver, 1);

                    // button fill
                    drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);

                    // left/main button fill
                    drawRoundRect(borderThickness, borderThickness, w - arrowButtonWidth - borderThickness, h - (borderThickness * 2), getRadius(cr1, true), fillColorOver, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorOver, 1);

                    break;
                }

                case "popUpOverSkin": // for hover on the arrow-button (right) side
                {
                    arrowColor = arrowColorOver;

                    // button border/edge
                    drawRoundRect(0, 0, w, h, cr, borderColorOver, 1);

                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), 0, borderColorOver, 1);

                    // button fill
                    drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), getRadius(cr1, true), fillColorUp, 1);

                    // right button fill
                    drawRoundRect(dividerPosX + borderThickness, borderThickness, arrowButtonWidth - (borderThickness * 2), h - (borderThickness * 2), getRadius(cr1, false), fillColorOver, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorUp, 1);

                    break;
                }

                case "downSkin": // for press on the main button (left) side
                {
                    // button border/ddge
                    drawRoundRect(0, 0, w, h, cr, borderColorDown, 1);

                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), 0, borderColorDown, 1);

                    // button fill                
                    drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);

                    // left/main button fill
                    drawRoundRect(borderThickness, borderThickness, w - arrowButtonWidth - borderThickness, h - (borderThickness * 2), getRadius(cr1, true), fillColorDown, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorDown, 1);

                    break;
                }

                case "popUpDownSkin": // for press on the arrow-button (right) side
                {
                    arrowColor = arrowColorDown;

                    // button border/edge
                    drawRoundRect(0, 0, w, h, cr, borderColorDown, 1);

                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), 0, borderColorDown, 1);

                    // button fill                
                    drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorUp, 1);

                    // right button fill
                    drawRoundRect(dividerPosX + borderThickness, borderThickness, arrowButtonWidth - (borderThickness * 2), h - (borderThickness * 2), getRadius(cr1, false), fillColorDown, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorDown, 1);

                    break;
                }

                case "disabledSkin":  {
                    arrowColor = getStyle("disabledIconColor");

                    // outer edge
                    drawRoundRect(0, 0, w, h, cornerRadius, fillColorDisabled, 1);

                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), 0, borderColorDisabled, 1);

                    // button fill
                    drawRoundRect(borderThickness, borderThickness, w - (borderThickness * 2), h - (borderThickness * 2), cr1, fillColorDisabled, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorDisabled, 1);

                    // Separator
                    drawRoundRect(dividerPosX, borderThickness, borderThickness, h - (borderThickness * 2), cr, borderColorDisabled, 1);

                    break;
                }

            }

            if (popUpIcon is PopUpIcon)
                PopUpIcon(popUpIcon).arrowColor = arrowColor;
        }

        //--------------------------------------------------------------------------
        //
        //  Methods
        //
        //--------------------------------------------------------------------------

        /**
         *  @private
         */
        private function getRadius(r:Number, left:Boolean):Object {
            return left ? {br: 0, bl: r, tr: 0, tl: r} : {br: r, bl: 0, tr: r, tl: 0};
        }
    }
}
