package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

	public class RectangleAnnotation extends DrawAnnotation
	{
		private var _type:String = DrawObject.RECTANGLE;
		private var _shape:Array;
		private var _color:uint;
		private var _fillColor:uint;
		private var _thickness:uint;
		private var _fill:Boolean;
		private var _transparent:Boolean;
		
		public function RectangleAnnotation(segment:Array, color:uint, thickness:uint, trans:Boolean)
		{
			_shape = segment;
			_color = color;
			_thickness = thickness;
			_transparent = trans;
		}
		
		private function optimize(segment:Array):Array {
			var x1:Number = segment[0];
			var y1:Number = segment[1];
			var x2:Number = segment[segment.length - 2];
			var y2:Number = segment[segment.length - 1];
			
			var shape:Array = new Array();
			shape.push(x1);
			shape.push(y1);
			shape.push(x2);
			shape.push(y2);
			
			return shape;
		}
		
		override public function createAnnotation(wbModel:WhiteboardModel, ctrlKeyPressed:Boolean=false):Annotation {
			var ao:Object = new Object();
			ao["type"] = _type;
			ao["points"] = optimize(_shape);
			ao["color"] = _color;
			ao["thickness"] = _thickness;
			ao["id"] = _id;
			ao["status"] = _status;
			ao["transparency"] = _transparent;
			
			if (ctrlKeyPressed) {
				ao["square"] = true;
			} else {
				ao["square"] = false;
			}
			
      var pn:Object = wbModel.getCurrentPresentationAndPage();
      if (pn != null) {
        ao["presentationID"] = pn.presentationID;
        ao["pageNumber"] = pn.currentPageNumber;
      }
      
			return new Annotation(_id, _type, ao);
		}
	}
}