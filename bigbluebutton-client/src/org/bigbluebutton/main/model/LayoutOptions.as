/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
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
    [Bindable] public var showFooter:Boolean = true;
    [Bindable] public var showMeetingName:Boolean = true;
		[Bindable] public var showHelpButton:Boolean = true;
		[Bindable] public var showLogoutWindow:Boolean = true;
		[Bindable] public var showLayoutTools:Boolean = true;
		[Bindable] public var showNetworkMonitor:Boolean = true;
		[Bindable] public var confirmLogout:Boolean = true;
		[Bindable] public var showRecordingNotification:Boolean = true;
		
		
    public var defaultLayout:String = "Default";
    
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
				
				if (vxml.@confirmLogout != undefined) {
					confirmLogout = (vxml.@confirmLogout.toString().toUpperCase() == "TRUE") ? true : false;
				}

        if (vxml.@showFooter != undefined) {
          showFooter = (vxml.@showFooter.toString().toUpperCase() == "TRUE") ? true : false;
        }
        
                if (vxml.@showMeetingName != undefined) {
                    showMeetingName = (vxml.@showMeetingName.toString().toUpperCase() == "TRUE") ? true : false;
                }
        
				if (vxml.@showHelpButton != undefined) {
					showHelpButton = (vxml.@showHelpButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				
				if (vxml.@showLogoutWindow != undefined) {
					showLogoutWindow = (vxml.@showLogoutWindow.toString().toUpperCase() == "TRUE") ? true : false;
				}
        
        if (vxml.@defaultLayout != undefined) {
          defaultLayout = vxml.@defaultLayout.toString();
        }
		
		if(vxml.@showLayoutTools != undefined){
			showLayoutTools = (vxml.@showLayoutTools.toString().toUpperCase() == "TRUE") ? true : false;
		}
		
		if(vxml.@showNetworkMonitor != undefined){
			showNetworkMonitor = (vxml.@showNetworkMonitor.toString().toUpperCase() == "TRUE") ? true : false;
		}
		
		if(vxml.@showRecordingNotification != undefined){
			showRecordingNotification = (vxml.@showRecordingNotification.toString().toUpperCase() == "TRUE") ? true : false;
		}
			}
		}
		
	}
}