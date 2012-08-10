/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
	import flash.display.Shape;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	
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
		private var drawFactory:DrawObjectFactory;
		private var _parentWidth:Number = 0;
		private var _parentHeight:Number = 0;
		
		public function ShapeFactory() {
			super(GraphicFactory.SHAPE_FACTORY);
			drawFactory = new DrawObjectFactory();
		}
		
		public function setParentDim(width:Number, height:Number):void {
			_parentWidth = width;
			_parentHeight = height;
		}
		
		/**
		 * Creates a Flash Shape, given a DrawObject representation of it 
		 * @param shape
		 * @return 
		 * 
		 */		
		public function makeShape(graphic:DrawObject):DrawObject{
/*			if (graphic.type == DrawObject.PENCIL){
				return makePencil(graphic as Pencil);
			} else if (graphic.type == DrawObject.RECTANGLE){
				return makeRectangle(graphic as Rectangle);
			} else if (graphic.type == DrawObject.ELLIPSE){
				return makeEllipse(graphic as Ellipse);
			} else if (graphic.type == DrawObject.TRIANGLE){
				return makeTriangle(graphic as Triangle);
			} else if (graphic.type == DrawObject.LINE){
				return makeLine(graphic as Line);
			}
*/
			return null;
		}

        private function createAnnotation(type:String, shape:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint, trans:Boolean):DrawAnnotation{
            if (type == DrawObject.PENCIL){
                return new PencilDrawAnnotation(shape, color, thickness, trans);
            } 
            
            return null;
//            else if (type == DrawObject.RECTANGLE){
//                d = makeRectangle(shape, color, thickness, fill, fillColor, trans);
//            } else if (type == DrawObject.ELLIPSE){
//                d = makeEllipse(shape, color, thickness, fill, fillColor, trans);
//            }  else if (type == DrawObject.TRIANGLE){
//               d = makeTriangle(shape, color, thickness, fill, fillColor, trans);
//            } else if (type == DrawObject.LINE){
//                d = makeLine(shape, color, thickness, trans);
//            } 
        }
            
		public function createDrawObject(type:String, segment:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint, transparency:Boolean):DrawAnnotation {
			var normSegment:Array = new Array();
			for (var i:int = 0; i < segment.length; i += 2) {
				normSegment[i] = normalize(segment[i] , _parentWidth);
				normSegment[i+1] = normalize(segment[i+1], _parentHeight);
			}
			return createAnnotation(type, normSegment, color, thickness, fill, fillColor, transparency);
		}
				
        public function createTextObject(txt:String, txtColor:uint, bgColor:uint, bgColorVisible:Boolean, x:Number, y:Number, tbWidth:Number, tbHeight:Number, textSize:Number):TextObject {		           
            var tobj:TextObject = new TextObject(txt, txtColor, bgColor, bgColorVisible, normalize(x , _parentWidth), normalize(y, _parentHeight), 
                            normalize(tbWidth , _parentWidth), normalize(tbHeight , _parentWidth), textSize);
            return tobj;
        }
          
        
        /* convenience method for above method, takes a TextObject and returns one with "normalized" coordinates */
        public function makeTextObject(t:Annotation):TextObject {
//            LogUtil.debug("***Making textObject [" + t.type + ", [" + t.annotation.x + "," + t.annotation.y + "]");
            var tobj:TextObject = new TextObject(t.annotation.text, t.annotation.fontColor, t.annotation.backgroundColor, t.annotation.background, 
                                        t.annotation.x, t.annotation.y, t.annotation.textBoxWidth, t.annotation.textBoxHeight, t.annotation.fontSize);
            tobj.makeGraphic(_parentWidth,_parentHeight);
//            LogUtil.debug("***Made textObject [" + tobj.text + ", [" + tobj.x + "," + tobj.y + "," + tobj.textSize + "]");
            return tobj;
        }
        
        public function redrawTextObject(a:Annotation, t:TextObject):TextObject {
 //           LogUtil.debug("***Redraw textObject [" + a.type + ", [" + a.annotation.x + "," + a.annotation.y + "]");
            var tobj:TextObject = new TextObject(a.annotation.text, a.annotation.fontColor, a.annotation.backgroundColor, a.annotation.background, 
                        a.annotation.x, a.annotation.y, a.annotation.textBoxWidth, a.annotation.textBoxHeight, a.annotation.fontSize);
            tobj.redrawText(t.oldParentWidth, t.oldParentHeight, _parentWidth,_parentHeight);
 //           LogUtil.debug("***Redraw textObject [" + tobj.text + ", [" + tobj.x + "," + tobj.y + "," + tobj.textSize + "]");
            return tobj;
        }        
        
		
		/**
		 * Creates a Flash Shape from a Pencil DrawObject 
		 * @param p a Pencil DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makePencil(p:Pencil):DrawObject{
			p.makeGraphic(_parentWidth, _parentHeight);	
	        return p;
		}
		
		/**
		 * Creates a Flash Shape from a Rectangle DrawObject 
		 * @param r a Rectangle DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makeRectangle(r:Rectangle):DrawObject{
			r.makeGraphic(_parentWidth, _parentHeight);			
			return r;	
		}
		
		/**
		 * Creates a Flash Shape from an Ellipse DrawObject 
		 * @param e an Ellipse DrawObject
		 * @return a Shape
		 * 
		 */		
		private function makeEllipse(e:Ellipse):DrawObject{
			e.makeGraphic(_parentWidth, _parentHeight);
			return e;
		}
		
		/**
		 * Creates a Flash Shape from an Line DrawObject 
		 * @param e an Line DrawObject
		 * @return a Shape
		 * 
		 */
		private function makeLine(e:Line):DrawObject{
			e.makeGraphic(_parentWidth, _parentHeight);
			return e;
		}
		
		/**
		 * Creates a Flash Shape from an Highlighter DrawObject 
		 * @param e an Highlighter DrawObject
		 * @return a Shape
		 * 
		 */
//		private function makeHighlighter(e:Highlighter):DrawObject{
//			e.makeGraphic(_parentWidth, _parentHeight);
////			return e;
//		}
		
		/**
		 * Creates a Flash Shape from an Eraser DrawObject 
		 * @param e an Eraser DrawObject
		 * @return a Shape
		 * 
		 */
//		private function makeEraser(e:Eraser):DrawObject{
//			e.makeGraphic(_parentWidth, _parentHeight);
//			return e;
//		}
		
		/**
		 * Creates a Flash Shape from an Triangle DrawObject 
		 * @param e an Triangle DrawObject
		 * @return a Shape
		 * 
		 */
		private function makeTriangle(e:Triangle):DrawObject{
//			e.makeGraphic(_parentWidth, _parentHeight);
			return e;
		}
	}
}