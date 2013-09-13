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
package org.bigbluebutton.modules.whiteboard.views
{
    import flash.display.Sprite;
    
    public class RectangleFeedbackTextBox extends Sprite
    {
        public function RectangleFeedbackTextBox()
        {
            super();
        }
        
        public function draw(startX:Number, startY:Number, width:Number, height:Number):void {
            graphics.clear();
            graphics.lineStyle(1, 0x0)
            graphics.drawRect(0, 0, width, height);
            x = startX;
            y = startY;
        }
        
        public function clear():void {
            graphics.clear();
        }
    }
}