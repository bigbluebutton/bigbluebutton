package org.bigbluebutton.modules.whiteboard.model.component
{
	/**
	 * The Ellipse class. Extends the DrawObject 
	 * @author dzgonjan
	 * 
	 */	
	public class Ellipse extends DrawObject
	{
		/**
		 * The default constructor. Creates an Ellipse object 
		 * <p>
		 * The constructor automaticaly optimizes this shape by calling the optimize method to get rid of the
		 * unnecessary data
		 * @param segment the array representing the points needed to create this Ellipse
		 * @param color the Color of this Ellipse
		 * @param thickness the thickness of this Ellipse
		 * 
		 */		
		public function Ellipse(segment:Array, color:uint, thickness:uint)
		{
			super(DrawObject.ELLIPSE, segment, color, thickness);
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