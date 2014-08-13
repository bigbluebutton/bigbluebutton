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
package org.bigbluebutton.skins
{
    import flash.display.Graphics;
    import flash.events.Event;
    import flash.geom.Point;

    import mx.managers.ToolTipManager;
    import mx.skins.halo.ToolTipBorder;

    public class ToolTipSkin extends ToolTipBorder
    {

		private static const TOP : String = "top";
        private static const BOTTOM : String = "bottom";

        private var _arrowPosition : String = TOP;

        public function ToolTipSkin() {
            super();
            visible = false;
            addEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
        }

        private function enterFrameHandler( event : Event ) : void {
            this.position();
        }

        private function position() : void {
            if (!stage || !ToolTipManager.currentToolTip || !ToolTipManager.currentTarget)
            {
                removeEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
                return;
            }
            var speed : Number = 5;
            var parentCoords : Point = new Point(ToolTipManager.currentTarget.mouseX, ToolTipManager.currentTarget.mouseY);
            var globalPoint : Point = ToolTipManager.currentTarget.localToGlobal(parentCoords);
            var xp : Number = globalPoint.x + 5 - (ToolTipManager.currentToolTip.width / 2);
            var yp : Number = globalPoint.y + ToolTipManager.currentToolTip.height;

            var overhangRight : Number = ToolTipManager.currentToolTip.width + xp;
            var overhangBottom : Number = ToolTipManager.currentToolTip.height + yp;
            updateArrowPosition(TOP);

            if (overhangRight > stage.stageWidth) {
                xp = stage.stageWidth - ToolTipManager.currentToolTip.width;
            }
            if (overhangBottom > stage.height) {
                yp = globalPoint.y - ToolTipManager.currentToolTip.height - 10;
                updateArrowPosition(BOTTOM);
            }
            if (xp < 0) {
                xp = 0;
            }
            if ((yp) < 0) {
                yp = 0;
            }
            if (visible) {
                ToolTipManager.currentToolTip.x += (xp - ToolTipManager.currentToolTip.x) / speed;
                ToolTipManager.currentToolTip.y += (yp - ToolTipManager.currentToolTip.y) / speed;
            }
            else {
                ToolTipManager.currentToolTip.x = xp;
                ToolTipManager.currentToolTip.y = yp;
                visible = true;
            }

        }


        private function updateArrowPosition( value : String ) : void {
            if (_arrowPosition != value) {
                _arrowPosition = value;
                validateDisplayList();
            }
        }


        //--------------------------------------------------------------------------
        //
        //  Overridden methods
        //
        //--------------------------------------------------------------------------


        override protected function updateDisplayList( w : Number, h : Number ) : void {
            super.updateDisplayList(w, h);

            var backgroundColor : uint = getStyle("backgroundColor");
            var backgroundAlpha : Number = getStyle("backgroundAlpha");
            var borderColor : uint = getStyle("borderColor");
            var cornerRadius : Number = getStyle("cornerRadius");

            var g : Graphics = graphics;
            g.clear();

            filters = [];

            // face
            drawRoundRect(
                3, 1, w - 6, h - 4, cornerRadius,
                backgroundColor, backgroundAlpha)

            // top pointer
            if (_arrowPosition == TOP) {
                g.beginFill(backgroundColor, backgroundAlpha);
                g.moveTo((w / 2) - 6, 1);
                g.lineTo((w / 2), -10);
                g.lineTo((w / 2) + 6, 1);
                g.moveTo((w / 2) - 5, -10);
                g.endFill();
            }
            else {
                g.beginFill(backgroundColor, backgroundAlpha);
                g.moveTo((w / 2) - 6, h - 3);
                g.lineTo((w / 2), h + 7);
                g.lineTo((w / 2) + 6, h - 3);
                g.moveTo((w / 2) - 5, h + 7);
                g.endFill();
            }

        }
    }
}
