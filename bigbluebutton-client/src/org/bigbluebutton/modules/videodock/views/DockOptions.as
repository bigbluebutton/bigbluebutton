package org.bigbluebutton.modules.videodock.views
{
	import org.bigbluebutton.core.BBB;

	public class DockOptions
	{
		[Bindable]
		public var autoDock:Boolean = true;
		
		[Bindable]
		public var maximize:Boolean = false;
		
		[Bindable]
		public var position:String = "bottom-right";
		
		[Bindable]
		public var width:int = 172;
		
		[Bindable]
		public var height:int = 179;
		
		[Bindable]
		public var layout:String = LAYOUT_SMART;
		static public const LAYOUT_NONE:String = "NONE";
		static public const LAYOUT_HANGOUT:String = "HANGOUT";
		static public const LAYOUT_SMART:String = "SMART";
		
		[Bindable]
		public var oneAlwaysBigger:Boolean = false;
		
		public function DockOptions()
		{
			var vxml:XML = BBB.getConfigForModule("VideodockModule");
			if (vxml != null) {
				if (vxml.@autoDock != undefined) {
					autoDock = (vxml.@autoDock.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@maximizeWindow != undefined) {
					maximize = (vxml.@maximizeWindow.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@position != undefined) {
					position = vxml.@position.toString();
				}
				if (vxml.@width != undefined) {
					width = Number(vxml.@width);
				}
				if (vxml.@height != undefined) {
					height = Number(vxml.@height);
				}
				if (vxml.@layout != undefined) {
					layout = vxml.@layout.toString().toUpperCase();
					if (layout != LAYOUT_NONE && layout != LAYOUT_HANGOUT && layout != LAYOUT_SMART)
						layout = LAYOUT_NONE;					
				}
				if (vxml.@oneAlwaysBigger != undefined) {
					oneAlwaysBigger = (vxml.@oneAlwaysBigger.toString().toUpperCase() == "TRUE") ? true : false;
				}
			}
		}
	}
}