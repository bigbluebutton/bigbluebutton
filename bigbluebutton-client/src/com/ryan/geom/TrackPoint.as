package com.ryan.geom{
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.ui.Mouse;
	
	public class TrackPoint extends MovieClip {
		
		public var _label:TextField;
		
		public function TrackPoint(label:String = '', p:Point = null):void {
			
			graphics.beginFill(0x000000, 1);
			graphics.drawCircle(0, 0, 3);
			
			_label = new TextField();
			_label.textColor = 0x000000;
			_label.autoSize = TextFieldAutoSize.LEFT;
			_label.x = 8;
			_label.y = 11;
			addChild(_label);
			
			update(label, p);
			//Main.instance.addChild(this);
		}
		
		public function set label(s:String):void {
			_label.text = s;
			_label.mouseEnabled = false;
		}
		
		public function set pos(point:Point):void {
			x = point.x;
			y = point.y;
		}
		
		public function update(label:String = '', p:Point = null):void {
			if (label != '') this.label = label;
			if (p != null) this.pos = p;
		}
		
	}
}