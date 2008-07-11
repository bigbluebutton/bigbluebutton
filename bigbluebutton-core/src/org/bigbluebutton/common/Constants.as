/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.common
{
	import flash.external.ExternalInterface;
	
	/**
	 * Holds various constants
	 * NOTE: PLEASE DON'T CHANGE THE CONSTANTS, JUST CHANGE THE STATIC VARIABLES. ADD YOUR OWN CONSTANTS IF
	 * YOU WANT 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class Constants
	{	
		public static const RELATIVE_FILE_UPLOAD:String = "/bigbluebutton/file";
				
		public static var red5Host:String;
		public static var presentationHost:String;
		public static var relativeFileUpload:String = RELATIVE_FILE_UPLOAD;
		
		public static const TEST_URL:String = testURL();
		
		/**
		 * If the client is being run from a server, the URLs will be retrieved from the index.template.html
		 * file. If we're running the client from an IDE, it will connect to the Carleton demo server.
		 * This is basicaly meant to ease development. Call this method when the application starts up. 
		 * 
		 */		
		public static function setHost():void{ 
			if (testURL() != null){
				red5Host = testURL();
				presentationHost = testURL();
			} else if (ExternalInterface.available){
				red5Host = ExternalInterface.call("getRed5");
				presentationHost = ExternalInterface.call("getPresentationHost");
			}
			//If all else fails, do the default
			if (red5Host == null){
				red5Host = "present.carleton.ca";
				presentationHost = "present.carleton.ca";
			}
		}
		
		public static function testURL():String{
			if (!ExternalInterface.available) return null;
			
			var url:String = ExternalInterface.call("testURL");
			if (url == null) return null;
			
			var index:Number = url.indexOf("http://");
			
			if (index == -1) return null;
			
			url = url.substr(index + 7);
			index = url.indexOf("/");
			
			url = url.substr(0, index);
			
			return url;
		}

	}
}