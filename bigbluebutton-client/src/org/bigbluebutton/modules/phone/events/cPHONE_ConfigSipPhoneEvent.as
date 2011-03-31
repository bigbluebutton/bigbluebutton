/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	/*****************************************************************************
	 ;  cPHONE_ConfigSipPhoneEvent
	 ;----------------------------------------------------------------------------
	 ; DESCRIPTION
	 ;   this class is used to send command to configure web phone
	 ;  
	 ; HISTORY
	 ; __date__ :        PTS:            Description
	 ; 2011-3-02						 Switching web phone(applet or flash)
	 ******************************************************************************/
	public class cPHONE_ConfigSipPhoneEvent extends Event
	{
		
		public static const JOIN_VIOCE_BY_SIP_APPLET:String 	= "JOIN_VIOCE_BY_SIP_APPLET";
		public static const UPDATE_CONFIG:String				= "UPDATE_CONFIG";
		
		public var _isAppletConf:Boolean = true;
		
		/*****************************************************************************
		 ;  cPHONE_ConfigSipPhoneEvent
		 ;----------------------------------------------------------------------------
		 ; DESCRIPTION
		 ;   this routine is the constructor of the class
		 ;   
		 ; RETURNS : N/A
		 ;
		 ; INTERFACE NOTES
		 ;   type:	(String)event type
		 ;
		 ; IMPLEMENTATION
		 ;
		 ; HISTORY
		 ; __date__ :        PTS:            Description
		 ; 2011-3-02						 Switching web phone(applet or flash)
		 ******************************************************************************/
		public function cPHONE_ConfigSipPhoneEvent(type:String)
		{
			super(type, true, false);
		}/** END FUNCTION 'cPHONE_ConfigSipPhoneEvent' **/
		
	}
}