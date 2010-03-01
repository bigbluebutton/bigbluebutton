package org.bigbluebutton.modules.highlighter.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	public class PageEvent extends Event
	{
		public static const CHANGE_PAGE:String = "ChangePage";
		
		public var pageNum:Number;
		public var shapes:ArrayCollection;
		
		public function PageEvent(type:String)
		{
			super(type, true, false);
		}

	}
}