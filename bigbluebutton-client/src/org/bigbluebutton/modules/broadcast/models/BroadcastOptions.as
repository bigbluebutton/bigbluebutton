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
package org.bigbluebutton.modules.broadcast.models
{
	import org.bigbluebutton.core.BBB;

	public class BroadcastOptions {
		[Bindable]
		public var streamsUri:String;
				
		[Bindable]
		public var position:String = "absolute";
		
    public var showWindowControls:Boolean = false;
    public var showStreams:Boolean = true;
    public var autoPlay:Boolean = false;
    	
		public function BroadcastOptions() {
			var cxml:XML = 	BBB.getConfigForModule("BroadcastModule");
			if (cxml != null) {
				if (cxml.@streamsUri != undefined) {
					streamsUri = cxml.@streamsUri.toString();
				}
        if (cxml.@showWindowControls != undefined) {
          showWindowControls = (cxml.@showWindowControls.toString().toUpperCase() == "TRUE") ? true : false;
        }
        if (cxml.@showStreams != undefined) {
          showStreams = (cxml.@showStreams.toString().toUpperCase() == "TRUE") ? true : false;
        }
        if (cxml.@autoPlay != undefined) {
          autoPlay = (cxml.@autoPlay.toString().toUpperCase() == "TRUE") ? true : false;
        }
				if (cxml.@position != undefined) {
					position = cxml.@position.toString();
				}
			}
		}
	}
}