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
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;
    import com.asfusion.mate.events.Dispatcher;
    /*****************************************************************************
    ;  RecordChatMessageEvent
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this class is used to send command to record public chat
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
	public class RecordChatMessageEvent extends Event
	{
		public static const RECORD_CHAT_MESSAGE_EVENT:String = 'RECORD_CHAT_MESSAGE_EVENT';
		
		public var message:String       ;
        public var username:String          ;
        public var userid:String           ;
        public var isRecording:Boolean  ;
		
        /*****************************************************************************
        ;  RecordChatMessageEvent
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
		public function RecordChatMessageEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{           
			super(type, bubbles, cancelable);
		}/** END FUNCTION 'RecordChatMessageEvent' **/
		
	}/** END CLASS 'RecordChatMessageEvent' **/
}