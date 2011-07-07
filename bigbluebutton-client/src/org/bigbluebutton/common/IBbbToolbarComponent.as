package org.bigbluebutton.common
{
	/**
	 * If you use the ToolbarButtonEvent to add a UIComponent to the top toolbar, it must implement this interface.
	 * 
	 */	
	public interface IBbbToolbarComponent
	{
		/**
		 * If you want your button to appear to the right or left of other buttons (for visual purposes), return one of
		 * MainToolbar.ALIGN_LEFT
		 * MainToolbar.ALIGN_RIGHT
		 * 
		 */		
		function getAlignment():String;
	}
}