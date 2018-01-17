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
 
  public class TextDrawAnnotation extends DrawAnnotation
  {
    private var _type:String = AnnotationType.TEXT;
    private var _text:String;
    private var _textBoxWidth:Number = 0;
    private var _textBoxHeight:Number = 0;
    private var _x:Number;
    private var _y:Number;
    private var _fontColor:uint;
    private var _fontStyle:String = "arial";
    private var _fontSize:Number;
    private var _calcedFontSize:Number;
    
    public function TextDrawAnnotation(text:String, color:uint, x:Number, y:Number, width:Number, 
                                       height:Number, fontSize:Number, calcedFontSize:Number)
    {
      _text = text;
      _fontColor = color;
      _x = x;
      _y = y;
      _textBoxWidth = width;
      _textBoxHeight = height;
      _fontSize = fontSize;
      _calcedFontSize = calcedFontSize;
    }
        
    override public function createAnnotation(wbId:String):Annotation {
      var ao:Object = new Object();
      ao["type"] = AnnotationType.TEXT;
      ao["id"] = _id;
      ao["status"] = _status;  
      ao["text"] = _text;
      ao["fontColor"] = _fontColor;
      ao["x"] = _x;
      ao["y"] = _y;
      ao["dataPoints"] = _x + "," + _y;
      ao["fontSize"] = _fontSize;
      ao["calcedFontSize"] = _calcedFontSize;
      ao["textBoxWidth"] = _textBoxWidth;
      ao["textBoxHeight"] = _textBoxHeight;
            
      if (wbId != null) {
        ao["whiteboardId"] = wbId;
      }
            
      return new Annotation(_id, AnnotationType.TEXT, ao);
    }
  }
}