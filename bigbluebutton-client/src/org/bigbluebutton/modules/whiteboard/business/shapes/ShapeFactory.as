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

		public function ShapeFactory() {
			super(GraphicFactory.SHAPE_FACTORY);
			drawFactory = new DrawObjectFactory();
		}
		
		/**
		 * Creates a Flash Shape, given a DrawObject representation of it 
		 * @param shape
		 * @return 
		 * 
		 */		
		public function makeShape(graphic:DrawObject):DrawObject{
			if (graphic.getType() == DrawObject.PENCIL){
				return makePencil(graphic as Pencil);
			} else if (graphic.getType() == DrawObject.RECTANGLE){
				return makeRectangle(graphic as Rectangle);
			} else if (graphic.getType() == DrawObject.ELLIPSE){
				return makeEllipse(graphic as Ellipse);
			} else if (graphic.getType() == DrawObject.TRIANGLE){
				return makeTriangle(graphic as Triangle);
			} else if (graphic.getType() == DrawObject.LINE){
				return makeLine(graphic as Line);
			} else if (graphic.getType() == DrawObject.HIGHLIGHTER){
				return makeHighlighter(graphic as Highlighter);
			} else if (graphic.getType() == DrawObject.ERASER){
				return makeEraser(graphic as Eraser);
			}
			return null;
		}
		
		public function createDrawObject(type:String, segment:Array, color:uint, thickness:uint,
										fill:Boolean, fillColor:uint, transparency:Boolean):DrawObject {
			var normSegment:Array = new Array();
			for (var i:int = 0; i < segment.length; i += 2) {
				normSegment[i] = normalize(segment[i] , _parentWidth);
				normSegment[i+1] = normalize(segment[i+1], _parentHeight);
			}
			return makeShape(drawFactory.makeDrawObject(type, normSegment, color, thickness, fill, fillColor, transparency));
		}
		
		/**
		 * Creates a shape from the specified parameters 
		 * @param segment
		 * @param type
		 * @param color
		 * @param thickness
		 * @param fill
		 * @param fillColor
		 * @param trans
		 * @return A Flash Shape object
		 * 
		 */		
		public function makeFeedback(type:String, segment:Array, color:uint, thickness:uint, fill:Boolean, fillColor:uint, trans:Boolean):DrawObject{
			return makeShape(drawFactory.makeDrawObject(type, segment, color, thickness, fill, fillColor, trans));
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
		private function makeHighlighter(e:Highlighter):DrawObject{
			e.makeGraphic(_parentWidth, _parentHeight);
			return e;
		}
		
		/**
		 * Creates a Flash Shape from an Eraser DrawObject 
		 * @param e an Eraser DrawObject
		 * @return a Shape
		 * 
		 */
		private function makeEraser(e:Eraser):DrawObject{
			e.makeGraphic(_parentWidth, _parentHeight);
			return e;
		}
		
		/**
		 * Creates a Flash Shape from an Triangle DrawObject 
		 * @param e an Triangle DrawObject
		 * @return a Shape
		 * 
		 */
		private function makeTriangle(e:Triangle):DrawObject{
			e.makeGraphic(_parentWidth, _parentHeight);
			return e;
		}
	}
}