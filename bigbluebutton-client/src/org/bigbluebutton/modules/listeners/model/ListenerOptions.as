package org.bigbluebutton.modules.listeners.model
{
	import org.bigbluebutton.core.BBB;

	public class ListenerOptions
	{
		[Bindable] public var windowVisible:Boolean = true;		
		[Bindable] public var position:String = "bottom-left";
		[Bindable] public var baseTabIndex:int;
		
		public function ListenerOptions()
		{
			var vxml:XML = BBB.getConfigForModule("ListenersModule");
			if (vxml != null) {
				if (vxml.@position != undefined) {
					position = vxml.@position.toString();
				}
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
					//LogUtil.debug("WATERFALL-OPTIONS About to leave ViewerOptions, baseTabIndex is " + baseTabIndex);
				}
				windowVisible = (vxml.@windowVisible.toString().toUpperCase() == "TRUE") ? true : false;
			}
			
		}

	}
}