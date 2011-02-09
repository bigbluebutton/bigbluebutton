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
    ;  cCHAT_RecordPrivateMessageEvent
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this class is used to send command to record private chat
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
	public class cCHAT_RecordPrivateMessageEvent extends Event
	{
		public static const RECORD_PRIVATE_CHAT_MESSAGE_EVENT:String = 'RECORD_PRIVATE_CHAT_MESSAGE_EVENT';
        public static const ADD_MESSAGE:String = 'ADD_MESSAGE';
        public static const SAVE_MESSAGE:String = 'SAVE_MESSAGE';
		
		public var message:Object       ;
        public var sender:String          ;
        public var receiverName:String          ;
        public var isRecording:Boolean  ;
        public var receiver:String      ;
		
        /*****************************************************************************
        ;  cCHAT_RecordPrivateMessageEvent
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
		public function cCHAT_RecordPrivateMessageEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{           
			super(type, bubbles, cancelable);
		}/** END FUNCTION 'cCHAT_RecordPrivateMessageEvent' **/
		
	}/** END CLASS 'cCHAT_RecordPrivateMessageEvent' **/
}