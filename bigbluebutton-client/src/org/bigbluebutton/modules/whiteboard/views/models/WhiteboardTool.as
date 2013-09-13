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
package org.bigbluebutton.modules.whiteboard.views.models
{
    import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
    import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;

    /**
    * Class that holds all properties of the currently selected whiteboard tool.
    */
    public class WhiteboardTool
    {
        public var graphicType:String = WhiteboardConstants.TYPE_SHAPE;
        public var toolType:String = DrawObject.PENCIL;
        public var drawColor:uint = 0x000000;
        public var fillColor:uint = 0x000000;
        public var thickness:uint = 1;       
        public var _fontStyle:String = "_sans";
        public var _fontSize:Number = 18;
        public var _textText:String = "Hello BBB!";        
        public var fillOn:Boolean = false;
        public var transparencyOn:Boolean = false;
    }
}