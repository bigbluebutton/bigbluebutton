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
	[Bindable]
	public class Streams {		
		public var streamNames:Array = new Array();
		public var streamUrls:Array = new Array();
		public var streamIds:Array = new Array();
		
		
		public function getStreamNameAndUrl(streamId:String):Object {
			var streamIndex:int = 0;
			for (var i:int = 0; i < streamIds.length; i++) {
				if (streamId == streamIds[i]) {
					var info:Object = new Object();
					info["name"] = streamNames[i];
					info["url"] = streamUrls[i];
					return info;
				}
			}
			
			return null;
		} 
		
		public function getStreamIndex(streamId:String):Number {
			var streamIndex:int = 0;
			for (var i:int = 0; i < streamIds.length; i++) {
				if (streamId == streamIds[i]) {
					return i;
				}
			}
			
			return 0;
		}
	}
}