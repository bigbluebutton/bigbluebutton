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
package org.bigbluebutton.modules.screenshare.model
{
	import org.bigbluebutton.core.BBB;

	public class ScreenshareOptions
	{
		[Bindable] public var showButton:Boolean = true;
		[Bindable] public var autoStart:Boolean = false;
		[Bindable] public var autoFullScreen:Boolean = false;
		[Bindable] public var baseTabIndex:int;
		[Bindable] public var useWebRTCIfAvailable:Boolean = true;
		[Bindable] public var chromeExtensionKey:String = null;
    [Bindable] public var helpUrl:String;

		public function parseOptions():void {
			var vxml:XML = BBB.getConfigForModule("ScreenshareModule");
			if (vxml != null) {
				if (vxml.@autoStart != undefined) {
					autoStart = (vxml.@autoStart.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@autoFullScreen != undefined){
					autoFullScreen = (vxml.@autoFullScreen.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
				else{
					baseTabIndex = 201;
				}
				if (vxml.@showButton != undefined){
					showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@useWebRTCIfAvailable != undefined) {
					useWebRTCIfAvailable = (vxml.@useWebRTCIfAvailable.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@chromeExtensionKey != undefined) {
					chromeExtensionKey = vxml.@chromeExtensionKey.toString();
				}
        if (vxml.@help != undefined){
          helpUrl = vxml.@help; 
        }
			}
		}
	}
}
