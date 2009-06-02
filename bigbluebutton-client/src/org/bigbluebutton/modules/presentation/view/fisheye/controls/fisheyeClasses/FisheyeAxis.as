package org.bigbluebutton.modules.presentation.view.fisheye.controls.fisheyeClasses {

	public class FisheyeAxis {
		private static const measuredValues:Array = ["measuredWidth","measuredHeight"];
		private static const minValues:Array = ["minWidth","minHeight"];
		private static const measuredMinValues:Array = ["measuredMinWidth","measuredMinHeight"];
		private static const explicitOrMeasuredValues:Array = ["eomWidth","eomHeight"];
		private static const unscaledValues:Array = ["unscaledWidth","unscaledHeight"];
		private static const mouseValues:Array = ["mouseX","mouseY"];
		private static const posValues:Array = ["x","y"];
		private static const transValues:Array = ["tx","ty"];
		private static const alignValues:Array = ["horizontalAlign","verticalAlign"];
	
		private var _directionIndex:int = 0;
		
		public function set direction(value:String):void
		{
			if(value == "vertical")
				_directionIndex = 1;
			else
				_directionIndex = 0;
		}
		public function get measured():String { return measuredValues[_directionIndex]; }
		public function get min():String { return minValues[_directionIndex]; }
		public function get EOM():String { return explicitOrMeasuredValues[_directionIndex]; }
		public function get unscaled():String { return unscaledValues[_directionIndex]; }
		public function get mouse():String { return mouseValues[_directionIndex]; }
		public function get pos():String { return posValues[_directionIndex]; }
		public function get trans():String { return transValues[_directionIndex]; }
		public function get align():String { return alignValues[_directionIndex]; }
		public function get measuredMin():String { return measuredMinValues[_directionIndex]; }

	}
}