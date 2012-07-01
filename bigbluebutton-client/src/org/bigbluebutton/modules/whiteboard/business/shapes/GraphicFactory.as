package org.bigbluebutton.modules.whiteboard.business.shapes
{
	public class GraphicFactory
	{
		public static const SHAPE_FACTORY:String = "SHAPE_FACTORY";
		public static const TEXT_FACTORY:String = "TEXT_FACTORY";
		
		public var factory_type:String;
		
		public function GraphicFactory(type:String) {
			this.factory_type = type;
		}
		
	}
}