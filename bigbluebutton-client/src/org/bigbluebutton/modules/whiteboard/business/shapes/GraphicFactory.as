package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import flash.display.DisplayObject;

	public class GraphicFactory
	{
		public static const SHAPE_FACTORY:String = "SHAPE_FACTORY";
		public static const TEXT_FACTORY:String = "TEXT_FACTORY";
		
		public var factory_type:String;
		
		public function GraphicFactory(type:String) {
			this.factory_type = type;
		}
		
		public function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		public function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
	}
}