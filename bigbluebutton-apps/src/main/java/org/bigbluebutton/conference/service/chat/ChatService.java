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
package org.bigbluebutton.conference.service.chat;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;

import org.red5.server.api.Red5;

public class ChatService {
	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application;    
    
    
	public List<String> getChatMessages() {
        String roomName = Red5.getConnectionLocal().getScope().getName();
		return application.getChatMessages(roomName);
	}
	
	public void sendMessage(String message) {
        String roomName = Red5.getConnectionLocal().getScope().getName();
		application.sendMessage(roomName, message);
	}
	public void setChatApplication(ChatApplication a) {
		log.debug("Setting Chat Applications");
		application = a;
	}
	
    /*****************************************************************************
    ;  setRecordStatus
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to set the record status to room
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   isRecording : Boolean, status of recording
    ; 
    ; IMPLEMENTATION
    ;   call chat application to set the record status to the room  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    public void setRecordStatus(Boolean isRecording){
        log.debug("Setting Chat Recording Status {}",isRecording);
        String roomName = Red5.getConnectionLocal().getScope().getName();
        application.setRecordStatus(roomName,isRecording);
    }
    /**
    * END FUNCTION 'setRecordStatus'
    **/
    
	/*****************************************************************************
    ;  getChatMessageFileList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get the file list from the room
    ;
    ; RETURNS : List
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  initialize the ChatRoomHistoryFileManager
    ;  call getFileList to get the file list
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    public List<String> getChatMessagesFileList(){
        log.debug("Get Chat Message Files List");
        String roomName = Red5.getConnectionLocal().getScope().getName();
        ChatRoomHistoryFileManager historyManager = new ChatRoomHistoryFileManager(roomName);
        if ( null == historyManager ){
            log.debug("ERROR INITIALIZE ChatRoomHistoryFileManager");
        }
        return historyManager.getFilesList() ;

    }
    
	/*****************************************************************************
    ;  getHistoryChatMessages
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the message list from a file in the room
    ;
    ; RETURNS : List
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   fileName : String , Name of a file in the room
    ; 
    ; IMPLEMENTATION
    ;  initialize the ChatRoomHistoryFileManager
    ;  call getHistoryFileContent to get the content of a file in the room
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    public List<String> getHistoryChatMessages(String fileName){
        log.debug("Get History File Content {}", fileName);
        String roomName = Red5.getConnectionLocal().getScope().getName();
        ChatRoomHistoryFileManager historyManager = new ChatRoomHistoryFileManager(roomName);
        if ( null == historyManager ){
            log.debug("ERROR INITIALIZE ChatRoomHistoryFileManager");
        }
        return historyManager.getHistoryFileContent(fileName);
    }
    
    public void privateMessage(String message, String sender, String recepient){
		log.debug("Received private message: " + message + " from " + sender + " to " + recepient + " The client scope is: " + Red5.getConnectionLocal().getScope().getName());
		ISharedObject sharedObject = application.handler.getSharedObject(Red5.getConnectionLocal().getScope(), recepient);
		ArrayList<String> arguments = new ArrayList<String>();
		arguments.add(sender);
		arguments.add(message);
		sharedObject.sendMessage("messageReceived", arguments);
	}
}
