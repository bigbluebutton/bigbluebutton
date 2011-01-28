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
    private boolean isRecord ;
    private PrivateChatMessageRecorder priRecorder ;
    private ArrayList<String> messages ;
    
    
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
    public void setRecordStatus(String userid, String username, Boolean isRecording){
        String roomName = Red5.getConnectionLocal().getScope().getName();
        application.setRecordStatus(roomName,userid,username,isRecording);
    }/** END FUNCTION 'setRecordStatus' **/
    
	/*****************************************************************************
    ;  getChatMessagesFileList
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
    ;  call getFilesList to get the file list
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

    }/** END FUNCTION 'getChatMessagesFileList' **/
    
	/*****************************************************************************
    ;  getHistoryChatMessages
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the message content from a file in the room
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
        
        log.debug("getHistoryFileChatMessage {}" , historyManager.getHistoryFileContent(fileName));
        return historyManager.getHistoryFileContent(fileName);
    }/** END FUNCTION 'getHistoryChatMessages' **/
    
    
    public void privateMessage(String message, String sender, String recepient){
		log.debug("Received private message: " + message + " from " + sender + " to " + recepient + " The client scope is: " + Red5.getConnectionLocal().getScope().getName());
		ISharedObject sharedObject = application.handler.getSharedObject(Red5.getConnectionLocal().getScope(), recepient);
		ArrayList<String> arguments = new ArrayList<String>();
		arguments.add(sender);
		arguments.add(message);
		sharedObject.sendMessage("messageReceived", arguments);
	}
    
    /*****************************************************************************
    ;  recordChatMessage
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to record messages
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid `: id of user
    ;   toUser  :   to user
    ;   message :   message
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void recordChatMessage(String userid, String toUser, String message){
        log.debug("isRecord private message from : " + userid + " to " + toUser + " " + message );
        if ( null == priRecorder ){
            initializePrivateChatRecorder() ;
        }

        priRecorder.addChatHistory(userid,toUser,message);
        
    }/** END FUNCTION 'recordChatMessage' **/
    
    /*****************************************************************************
    ;  setPrivateRecordStatus
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set record status
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   toUser `: to user
    ;   record  : status record
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void setPrivateRecordStatus(String toUser, boolean record){
        log.debug("Set Record Status : " + toUser + " " + record );
        if ( null == priRecorder ){
            initializePrivateChatRecorder() ;
            
        }

        priRecorder.setRecordStatusToUser(toUser,record);
    }/** END FUNCTION 'setPrivateRecordStatus' **/
    
    /*****************************************************************************
    ;  addUserToList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to add user to list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  : id of user
    ;   username `: user name
    ;   record  : status record
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void addUserToList(String userid, String username, boolean record){
        log.debug("addUserToList: " + userid + " " + username + " " +  record);
        if ( null == priRecorder ){
            initializePrivateChatRecorder() ;
            
        }
        priRecorder.addUserToList(userid,username,record) ;
    }/** END FUNCTION 'addUserToList' **/
    
    /*****************************************************************************
    ;  removeUserFromList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to remove user from list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  : id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void removeUserFromList(String userid){
        if ( null == priRecorder ){
            initializePrivateChatRecorder() ;
            
        }
        priRecorder.removeUserFromList(userid) ;
    }/** END FUNCTION 'removeUserFromList' **/
    
    /*****************************************************************************
    ;  getPrivateFileList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get private file list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  : id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public List<String> getPrivateFileList(String userid){
        
        String roomName = Red5.getConnectionLocal().getScope().getName();
        ChatRoomHistoryFileManager historyManager = new ChatRoomHistoryFileManager(roomName + "/" + userid);
        if ( null == historyManager ){
            log.debug("ERROR INITIALIZE ChatRoomHistoryFileManager");
            return null ;
        }
        return historyManager.getFilesList() ;
        
    }/** END FUNCTION 'getPrivateFileList' **/
    
    /*****************************************************************************
    ;  getPrivateChatMessages
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get private file content
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  : id of user
    ;   fileName : file name
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public List<String> getPrivateChatMessages(String userid,String fileName){
        log.debug("Get Private History File Content {}", fileName);
        String roomName = Red5.getConnectionLocal().getScope().getName();
        ChatRoomHistoryFileManager historyManager = new ChatRoomHistoryFileManager(roomName + "/" + userid);
        if ( null == historyManager ){
            log.debug("ERROR INITIALIZE ChatRoomHistoryFileManager");
            return null ;
        }
        
        log.debug("getPrivateChatMessages {}" , historyManager.getHistoryFileContent(fileName));
        return historyManager.getHistoryFileContent(fileName);
    }/** END FUNCTION 'getPrivateChatMessages' **/
    
    /*****************************************************************************
    ;  initializePrivateChatRecorder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to initialize PrivateChatMessageRecorder Class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void initializePrivateChatRecorder() {
        String roomName = Red5.getConnectionLocal().getScope().getName();
        priRecorder = new PrivateChatMessageRecorder(roomName) ;
        if ( null == priRecorder ){
            log.debug("Initialize failed" );
            return ;
        }
    }/** END FUNCTION 'initializePrivateChatRecorder' **/
    
}
