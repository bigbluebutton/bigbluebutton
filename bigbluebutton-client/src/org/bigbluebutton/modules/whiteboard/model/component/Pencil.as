package org.bigbluebutton.modules.whiteboard.model.component
{
	/**
	 * The Pencil class. Extends a DrawObject 
	 * @author dzgonjan
	 * 
	 */	
	public class Pencil extends DrawObject
	{
		/**
		 * the default constructor. Creates a Pencil DrawObject. 
		 * @param segment the array representing the points needed to create this Pencil
		 * @param color the Color of this Pencil
		 * @param thickness the thickness of this Pencil
		 * 
		 */		
		public function Pencil(segment:Array, color:uint, thickness:uint)
		{
			super(DrawObject.PENCIL, segment, color, thickness);
		}
		
	}
}