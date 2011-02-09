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
package org.bigbluebutton.modules.chat.services
{
	import flash.events.IEventDispatcher;
	
    import org.bigbluebutton.modules.chat.events.cCHAT_RecordPrivateMessageEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_HistoryFileListEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_AddRecordUserEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_ButtonEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_HistoryCommandEvent;
		
    import org.bigbluebutton.modules.chat.events.SendPrivateChatMessageEvent;
    import org.bigbluebutton.modules.chat.model.MessageVO;
    import mx.controls.Alert; 
	

	public class PrivateChatService
	{
		/** This property is injected by the application. */
		public var dispatcher:IEventDispatcher;
		
		private var attributes:Object;

		private var chatSOService:PrivateChatSharedObjectService;
		

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function join():void {
			chatSOService = new PrivateChatSharedObjectService(attributes.connection, dispatcher);
			chatSOService.join(attributes.userid, attributes.uri + "/" + attributes.room);
		}
		
		public function leave():void {
			chatSOService.leave();
		}
		
		public function sendChatMessageEvent(event:SendPrivateChatMessageEvent):void {
			trace("Receive receivedSendPrivateChatMessageEvent");
			var newMessage:String;			
			/*newMessage = "<font color=\"#" + event.color + "\"><b>[" + 
						attributes.username +" - "+ event.time + "]</b> " + event.message + "</font><br/>";*/
			newMessage = event.message + "|" + attributes.username + "|" + event.color + "|" + event.time + "|" + event.language + "|" + attributes.userid;
			var messageVO:MessageVO = new MessageVO(newMessage, attributes.userid, event.toUser);
			chatSOService.sendMessage(messageVO);
		}
        
		public function queryForParticipants():void {
			chatSOService.queryForParticipants();
		}
        
        /*****************************************************************************
        ;  recordMessageEvent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to handle the event from private record chat
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_RecordPrivateMessageEvent
        ; 
        ; IMPLEMENTATION
        ;  call function from chatSOService to record message
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 01-16-2010
        ******************************************************************************/
        public function recordMessageEvent(e:cCHAT_RecordPrivateMessageEvent):void{
            chatSOService.recordMessageEvent(e,attributes.username);
        }/** END OF 'recordMessageEvent'**/
        
        /*****************************************************************************
        ;  addUserToList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used add record user to list
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_AddRecordUserEvent
        ; 
        ; IMPLEMENTATION
        ;  call function from chatSOService to add user to list
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 01-16-2010
        ******************************************************************************/
        public function addUserToList(e:cCHAT_AddRecordUserEvent):void{
            chatSOService.addUserToList(e);
        }/** END OF 'addUserToList'**/
        
        /*****************************************************************************
        ;  removeUserFromList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to remove user from list
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_AddRecordUserEvent
        ; 
        ; IMPLEMENTATION
        ;  call function from chatSOService to remove user from list
        ;
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 01-16-2010
        ******************************************************************************/
        public function removeUserFromList(e:cCHAT_AddRecordUserEvent):void{
            chatSOService.removeUserFromList(e);
        }/** END OF 'removeUserFromList'**/
        
        
        /*****************************************************************************
        ;  loadFileList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to load the file list from server
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_HistoryFileListEvent
        ; 
        ; IMPLEMENTATION
        ;  call function from chatSOService to load file list
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 01-16-2010
        ******************************************************************************/
        public function loadFileList(e:cCHAT_HistoryFileListEvent):void{
            chatSOService.loadFileList(e);
        }/** END OF 'loadFileList'**/
        
        /*****************************************************************************
        ;  loadFileContent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to load the file content from server
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_HistoryCommandEvent
        ; 
        ; IMPLEMENTATION
        ;  call function from chatSOService to load file content
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 01-16-2010
        ******************************************************************************/
        public function loadFileContent(e:cCHAT_HistoryCommandEvent):void{
            chatSOService.loadFileContent(e);
        }/** END OF 'loadFileContent'**/
	}
}