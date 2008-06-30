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
	import mx.core.Application;
	
	/**
	 * Holds various constants
	 * NOTE: PLEASE DON'T CHANGE THE CONSTANTS, JUST CHANGE THE STATIC VARIABLES. ADD YOUR OWN CONSTANTS IF
	 * YOU WANT 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class Constants
	{
		public static const DEMO_RED5_HOST:String = "present.carleton.ca";
		public static const DEMO_PRESENTATION_HOST:String = "present.carleton.ca";		
		public static const KIRUS_COMP:String = "134.117.58.103";
		
		public static const HTML_RED5_HOST:String = mx.core.Application.application.parameters.red5Host;
		public static const HTML_PRES_HOST:String = mx.core.Application.application.parameters.presentationHost;
		
		public static const NEW_RELATIVE_FILE_UPLOAD:String = "/bigbluebutton/file";
		//The old relative file upload is used for testing the new client on the old server 
		//at present.carleton.ca. The reference to this string can be found in the 
		//PresentationApplication class, in the presentation module under model
		public static const OLD_RELATIVE_FILE_UPLOAD:String = "/blindside/file";
				
		public static var red5Host:String = HTML_RED5_HOST;
		public static var presentationHost:String = HTML_PRES_HOST;
		public static var relativeFileUpload:String = NEW_RELATIVE_FILE_UPLOAD;
		
		/**
		 * If the client is being run from a server, the URLs will be retrieved from the index.template.html
		 * file. If we're running the client from an IDE, it will connect to the Carleton demo server.
		 * This is basicaly meant to ease development. Call this method when the application starts up. 
		 * 
		 */		
		public static function setHost():void{
			
			//red5Host = DEMO_RED5_HOST;
			//presentationHost = DEMO_PRESENTATION_HOST;
			if (HTML_RED5_HOST == null) red5Host = DEMO_RED5_HOST;
			if (HTML_PRES_HOST == null) presentationHost = DEMO_PRESENTATION_HOST;

		}

	}
}