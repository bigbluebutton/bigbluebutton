package org.bigbluebutton.modules.whiteboard.model.component
{
	/**
	 * The Rectangle class. Extends a DrawObject 
	 * @author dzgonjan
	 * 
	 */	
	public class Rectangle extends DrawObject
	{
		/**
		 * The dafault constructor. Creates a Rectangle DrawObject 
		 * @param segment the array representing the points needed to create this Rectangle
		 * @param color the Color of this Rectangle
		 * @param thickness the thickness of this Rectangle
		 * 
		 */		
		public function Rectangle(segment:Array, color:uint, thickness:uint)
		{
			super(DrawObject.RECTANGLE, segment, color, thickness);
		}
		
		/**
		 * Gets rid of the unnecessary data in the segment array, so that the object can be more easily passed to
		 * the server 
		 * 
		 */		
		override protected function optimize():void{
			var x1:Number = this.shape[0];
			var y1:Number = this.shape[1];
			var x2:Number = this.shape[this.shape.length - 2];
			var y2:Number = this.shape[this.shape.length - 1];
			
			this.shape = new Array();
			this.shape.push(x1);
			this.shape.push(y1);
			this.shape.push(x2);
			this.shape.push(y2);
		}
		
	}
}