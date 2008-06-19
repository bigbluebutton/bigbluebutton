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
package org.bigbluebutton.modules.log.model.vo
{
	import flash.system.Capabilities;
	
	public class Logger
	{		
		/** Flash Player version number inc. debugger flag. */		
		[Bindable] public var flashVersion : String;
				
		/** Log text displayed in the TextArea. */		
		[Bindable] public var messages : String = "";
		

		public function Logger()
		{
			var platformVersion : String = Capabilities.version.substr( String( Capabilities.version ).lastIndexOf(" ") + 1 );
			var manufacturer : String = Capabilities.manufacturer;
			// Get Flash Player version info.
			flashVersion = "Using " + manufacturer + " Flash Player " + platformVersion;
			//
			if ( Capabilities.isDebugger ) 
			{
				// Add debugger info.
				flashVersion += " (Debugger)";
			}

			// Display Flash Player version.
			info( flashVersion);
		}
		
		/**
		 * Handle DEBUG message
		 * @param message to log
		 */
		public function debug(message : String):void
		{
			if (this.debugEnabled) logMessage("[DEBUG] " + message);
		}
		
		/**
		 * Log the message
		 * @param msg Status message to display.
		 */		
		private function logMessage( msg : String) : void 
		{
			var statusMessage : String = iso( new Date() ) + " - " + msg;

			statusText += statusMessage + "<br>";
		}

		/**
		 * Handle INFO message
		 * @param message to log
		 */	
		public function info(message : String):void
		{
			if (this.infoEnabled) logMessage("[INFO] " + message);
		}

		/**
		 * Handle WARN message
		 * @param message to log
		 */	
		public function warn(message : String):void
		{
			if (this.warnEnabled) logMessage("[WARN] " + message);
		}

		/**
		 * Handle WARN message
		 * @param message to log
		 */	
		public function error(message : String):void
		{
			if (this.errorEnabled) logMessage("[ERROR] " + message);
		}
		
		/**
		 * 
		 * @param value
		 * @return 
		 */		
		private function doubleDigits( value : Number ) : String 
		{
			if ( value > 9 ) 
			{
				return String( value );
			} 
			else 
			{ 
				return "0" + value;
			}
		}
		
		/**
		 * 
		 * @param value
		 * @return 
		 */		
		private function tripleDigits( value : Number ) : String 
		{
			var newStr : String = "";
			if ( value > 9 && value < 100 ) 
			{
				newStr = String( value ) + "0";
			} 
			else 
			{ 
				newStr = String( value ) + "00";
			}
			return newStr.substr( 0, 3 );
		}
		
		/**
		 * 
		 * @param date
		 * @return 
		 */		
		private function iso( date : Date ) : String 
		{
			return  doubleDigits( date.getHours() )
					+ ":"
					+ doubleDigits( date.getMinutes() )
					+ ":"
					+ doubleDigits( date.getSeconds() )
					+ ":"
					+ tripleDigits( date.getMilliseconds() );
		}
	}
}