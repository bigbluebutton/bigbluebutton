package org.bigbluebutton.modules.whiteboard.model.component
{
	/**
	 * The DrawObject class provides an interface for other geometric representations.
	 * This is a simple implementation of the Template design pattern. Other classes extend the
	 * DrawObject class and inherit it's methods.
	 * <p>
	 * The use of the Template pattern allows other classes to create and call methods on the DrawObject
	 * without having to know anything about the different implementations of those method
	 * @author dzgonjan
	 * 
	 */	
	public class DrawObject
	{
		public static const PENCIL:String = "pencil";
		public static const RECTANGLE:String = "rectangle";
		public static const ELLIPSE:String = "ellipse";
		
		protected var type:String;
		protected var shape:Array;
		protected var color:uint;
		protected var thickness:uint;
		
		/**
		 * The default constructor for the DrawObject 
		 * 
		 */		
		public function DrawObject(type:String, segment:Array, color:uint, thickness:uint)
		{
			this.type = type;
			this.shape = segment;
			this.color = color;
			this.thickness = thickness;
			this.optimize();
		}
		
		/**
		 * Returns the type of DrawObject this class is 
		 * @return a string representing the type
		 * 
		 */		
		public function getType():String{
			return this.type;
		}
		
		/**
		 * Returns the array of integers holding the different points needed to build this particular DrawObject 
		 * @return 
		 * 
		 */		
		public function getShapeArray():Array{
			return this.shape;
		}
		
		/**
		 * Returns the Color of the DrawObject
		 * @return The color, represented as a uint 
		 * 
		 */		
		public function getColor():uint{
			return this.color;
		}
		
		/**
		 * Returns the thickness of the DrawObject 
		 * @return The thickness, represented as a uint
		 * 
		 */		
		public function getThickness():uint{
			return this.thickness;
		}
		
		protected function optimize():void{
			
		}

	}
}