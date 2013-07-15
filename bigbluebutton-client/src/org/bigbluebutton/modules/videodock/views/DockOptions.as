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
package org.bigbluebutton.modules.videodock.views
{
	import org.bigbluebutton.core.BBB;

	public class DockOptions
	{
    [Bindable]
    public var showControls:Boolean = true;
    
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
		
		[Bindable] public var baseTabIndex:int;
		
		public function DockOptions()
		{
			var vxml:XML = BBB.getConfigForModule("VideodockModule");
			if (vxml != null) {
        if (vxml.@showControls != undefined) {
          showControls = (vxml.@showControls.toString().toUpperCase() == "TRUE") ? true : false;
        }
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
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
				else{
					baseTabIndex = 501;
				}
			}
		}
	}
}