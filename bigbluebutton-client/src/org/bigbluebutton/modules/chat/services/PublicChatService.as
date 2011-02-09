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
	
	import org.bigbluebutton.modules.chat.events.SendPublicChatMessageEvent;
	
    import org.bigbluebutton.modules.chat.events.cCHAT_RecordMessageEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_HistoryCommandEvent;
    
    import mx.controls.Alert;
    
	public class PublicChatService
	{
		private var attributes:Object;
		
		private var chatSOService:PublicChatSharedObjectService;
		

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function join():void {
			chatSOService = new PublicChatSharedObjectService(attributes.connection);
			chatSOService.join(attributes.uri + "/" + attributes.room);
		}
		
		public function leave():void {
			chatSOService.leave();
		}
		
		public function loadTranscript():void{
			chatSOService.getChatTranscript();
		}
		
		public function sendChatMessageEvent(event:SendPublicChatMessageEvent):void {
			trace("Receive receivedSendPublicChatMessageEvent");
			var newMessage:String;			
			/*newMessage = "<font color=\"#" + event.color + "\"><b>[" + 
						attributes.username +" - "+ event.time + "]</b> " + event.message + "</font><br/>";			*/
			newMessage = event.message + "|" + attributes.username + "|" + event.color + "|" + event.time + "|" + event.language + "|" + attributes.userid;
			chatSOService.sendMessage(newMessage);
		}
        
        /*****************************************************************************
        ;  recordMessageEvent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to send the record status to chatSO
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e :  cCHAT_RecordChatMessageEvent
        ;
        ; IMPLEMENTATION
        ;  send record status to chatSO
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 12-27-2010
        ******************************************************************************/        
        public function recordMessageEvent(e:cCHAT_RecordMessageEvent):void {
            chatSOService.recordMessageEvent(attributes.userid,attributes.username,e.isRecording);
        } /** END FUNCTION 'recordMessageEvent' **/

        /*****************************************************************************
        ;  loadFileList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to call the ChatSO to load file list from server
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   N/A
        ; 
        ; IMPLEMENTATION
        ;  call function loadFileList of chatSOService to load file list from server
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 12-27-2010
        ******************************************************************************/
        public function loadFileList():void{
            chatSOService.loadFileList();
        }/** END FUNCTION 'loadFileList' **/

        /*****************************************************************************
        ;  loadFileContent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to call load file content is chatSO from the server
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e : cCHAT_HistoryCommandEvent
        ;
        ; IMPLEMENTATION
        ;  call function loadFileContent from chatSOService to load the file content 
        ;  from server
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 12-27-2010
        ******************************************************************************/
        public function loadFileContent(e:cCHAT_HistoryCommandEvent):void{
            chatSOService.loadFileContent(e.fileName);
        }/** END FUNCTION 'loadFileContent' **/
	}
}