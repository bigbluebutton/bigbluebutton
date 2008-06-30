package org.bigbluebutton.modules.presentation.controller.notifiers
{
	/**
	 * A convinience class for sending more than one pience of information through a pureMVC notification 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ZoomNotifier
	{
		private var newHeight:Number;
		private var newWidth:Number;
		
		public function ZoomNotifier(newHeight:Number, newWidth:Number)
		{
			this.newHeight = newHeight;
			this.newWidth = newWidth;
		}

	}
}