/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;
	import flash.utils.Dictionary;
    /*****************************************************************************
    ;  ChatHistoryCommandEvent
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this class is used to add command to chat event
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
	public class ChatHistoryCommandEvent extends Event
	{
		public static const OPEN_FILE:String = 'OPEN_FILE';
        public static const DOWNLOAD_FILE:String = 'DOWNLOAD_FILE';
        public static const SAVE_FILE:String = 'SAVE_FILE';
        public static const OPEN_PRIVATE_FILE:String = 'OPEN_PRIVATE_FILE';
        
        public var fileName:String ;
        public var message:Object ;
        public var userid:String ;
		
        /*****************************************************************************
        ;  ChatHistoryCommandEvent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is the constructor of the class
        ;   
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;
        ; IMPLEMENTATION
        ;
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 12-27-2010
        ******************************************************************************/
		public function ChatHistoryCommandEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}/** END FUNCTION 'ChatHistoryCommandEvent' **/
		
	}/** END CLASS 'ChatHistoryCommandEvent' **/
}