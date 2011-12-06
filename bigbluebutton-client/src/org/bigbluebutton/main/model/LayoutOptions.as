package org.bigbluebutton.main.model
{
	import org.bigbluebutton.core.BBB;

	public class LayoutOptions
	{
		[Bindable] public var showDebugWindow:Boolean = true;
		[Bindable] public var showLogButton:Boolean = true;
		[Bindable] public var showVideoLayout:Boolean = true;
		[Bindable] public var showResetLayout:Boolean = true;
		[Bindable] public var showToolbar:Boolean = true;
		[Bindable] public var showHelpButton:Boolean = true;
		[Bindable] public var showLogoutWindow:Boolean = true;
		
		public function parseOptions():void {
			var vxml:XML = BBB.initConfigManager().config.layout;
			if (vxml != null) {
				if (vxml.@showDebugWindow != undefined) {
					showDebugWindow = (vxml.@showDebugWindow.toString().toUpperCase() == "TRUE") ? true : false;
				}

				if (vxml.@showLogButton != undefined) {
					showLogButton = (vxml.@showLogButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@showVideoLayout != undefined) {
					showVideoLayout = (vxml.@showVideoLayout.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@showResetLayout != undefined) {
					showResetLayout = (vxml.@showResetLayout.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@showToolbar != undefined) {
					showToolbar = (vxml.@showToolbar.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@showHelpButton != undefined) {
					showHelpButton = (vxml.@showHelpButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@showLogoutWindow != undefined) {
					showLogoutWindow = (vxml.@showLogoutWindow.toString().toUpperCase() == "TRUE") ? true : false;
				}
			}
		}
		
	}
}