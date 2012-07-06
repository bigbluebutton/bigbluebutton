package com.ryan.geom {
	import flash.display.DisplayObject;
	import flash.display.SpreadMethod;
	import flash.display.Sprite;
	import flash.events.Event;
	
	/**
	 * FreeTransformEvent
	 * 
	 * @author Ryan
	 */
	public class FreeTransformEvent extends Event{
		
		
		public static const ON_TRANSFORM:String = "ontransform";
		public static const ON_FOCUS:String = "onfocus";		
		public var targetObject:DisplayObject;
		public var x:Number;
		public var y:Number;
		public var _rotation:Number;
		public var scale:Number;
		
		

		public function FreeTransformEvent(type:String, targetObject:DisplayObject, x:Number=0, y:Number=0, rotation:Number=0, scale:Number=0, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.targetObject = targetObject;
			this.x = x;
			this.y = y;
			this._rotation = rotation;
			this.scale = scale;
		}
		
		public function get rotation():Number {
			return _rotation;
		}
		
		public function get rotationInDeg():Number {
			return _rotation / (Math.PI / 180);
		}
		
		/*
		public override function clone():FreeTransformEvent {
			return new FreeTransformEvent(_targetObject, _x, _y, _rotation, _scale);
		}
		*/
		
	}

}