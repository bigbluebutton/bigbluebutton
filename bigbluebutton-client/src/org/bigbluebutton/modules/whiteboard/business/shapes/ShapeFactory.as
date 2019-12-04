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
  import flash.geom.Point;
  
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.AnnotationType;
  
  /**
   * The ShapeFactory receives DrawObjects and converts them to Flash Shapes which can then be displayed
   * <p>
   * This approach is necessary because Red5 does not allow Graphical Objects to be stored 
   * in remote shared objects 
   * @author dzgonjan
   * 
   */  
  public class ShapeFactory extends GraphicFactory
  {
    private var _parentWidth:Number = 0;
    private var _parentHeight:Number = 0;
    
    public function ShapeFactory() {
      super(GraphicFactory.SHAPE_FACTORY);
    }
    
    public function setParentDim(width:Number, height:Number):void {
      _parentWidth = width;
      _parentHeight = height;
    }
    
    public function get parentWidth():Number {
      return _parentWidth;
    }
        
    public function get parentHeight():Number {
      return _parentHeight;
    }
        
    public function makeGraphicObject(a:Annotation):GraphicObject{
        if (a.type == AnnotationType.PENCIL) {
            return new Pencil(a.id, a.type, a.status, a.userId);
        } else if (a.type == AnnotationType.RECTANGLE) {
            return new Rectangle(a.id, a.type, a.status, a.userId);
        } else if (a.type == AnnotationType.ELLIPSE) {
            return new Ellipse(a.id, a.type, a.status, a.userId);
        }  else if (a.type == AnnotationType.LINE) {
            return new Line(a.id, a.type, a.status, a.userId);
        }  else if (a.type == AnnotationType.TRIANGLE) {
            return new Triangle(a.id, a.type, a.status, a.userId);
        }  else if (a.type == AnnotationType.POLL) {
            return new PollResultObject(a.id, a.type, a.status, a.userId);
        } else if (a.type == AnnotationType.TEXT) {
            return new TextObject(a.id, a.type, a.status, a.userId);
        }
        
        return null;
    }
        
    private function createAnnotation(type:String, shape:Array, color:uint, thickness:Number):DrawAnnotation{
            if (type == AnnotationType.PENCIL){
                return new PencilDrawAnnotation(shape, color, thickness);
            } else if (type == AnnotationType.RECTANGLE){
        return new RectangleAnnotation(shape, color, thickness);
      } else if (type == AnnotationType.ELLIPSE){
        return new EllipseAnnotation(shape, color, thickness);
      } else if (type == AnnotationType.LINE){
        return new LineAnnotation(shape, color, thickness);
      } else if (type == AnnotationType.TRIANGLE){
        return new TriangleAnnotation(shape, color, thickness);
      }
            
            return null;
        }
            
    public function createDrawObject(type:String, segment:Array, color:uint, thickness:uint):DrawAnnotation {
      return createAnnotation(type, segment, color, normalize(thickness, _parentWidth));
    }
    
    public function normalizePoint(x:Number, y:Number):Point {
      return new Point(normalize(x, _parentWidth), normalize(y, _parentHeight));
    }
    
    public function createTextAnnotation(txt:String, txtColor:uint, x:Number, y:Number, tbWidth:Number, tbHeight:Number, textSize:Number):TextDrawAnnotation {
      var tobj:TextDrawAnnotation = new TextDrawAnnotation(txt, txtColor, normalize(x , _parentWidth), normalize(y, _parentHeight), 
                                                      normalize(tbWidth , _parentWidth), normalize(tbHeight , _parentHeight), 
                                                      textSize, normalize(textSize, _parentHeight));
            return tobj;
        }
  }
}
