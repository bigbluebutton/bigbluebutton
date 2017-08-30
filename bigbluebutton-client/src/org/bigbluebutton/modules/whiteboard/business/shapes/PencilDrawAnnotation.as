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
package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.models.AnnotationType;

    public class PencilDrawAnnotation extends DrawAnnotation
    {
        private var _type:String = AnnotationType.PENCIL;
        private var _points:Array;
        private var _color:uint;
        private var _thickness:Number;
        private var _dimensions:Array;

        
        public function PencilDrawAnnotation(segment:Array, color:uint, thickness:Number)
        {
            _points = segment;
            _color = color;
            _thickness = thickness;
        }
        
        public function addDimensions(dimensions:Array):void {
            _dimensions = dimensions;
        }
        
        override public function createAnnotation(wbId:String):Annotation {
            var ao:Object = new Object();
            ao["type"] = _type;
            ao["points"] = _points;
            ao["color"] = _color;
            ao["thickness"] = _thickness;
            ao["id"] = _id;
            ao["status"] = _status;

            if (_dimensions) {
                ao["dimensions"] = _dimensions;
            }
            
            if (wbId != null) {
                ao["whiteboardId"] = wbId;
            }
                      
            return new Annotation(_id, _type, ao);
        }
    }
}