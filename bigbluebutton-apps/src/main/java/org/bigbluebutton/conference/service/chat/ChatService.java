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

public class ChatService
{
	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application;    
    private boolean isRecord ;
    private cCHAT_PrivateMessageRecorder priRecorder ;
    private ArrayList<String> messages ;
    
    
	public List<String> getChatMessages()
	{
		log.debug("getChatMessages was called");
        String roomName = Red5.getConnectionLocal().getScope().getName();
		return application.getChatMessages(roomName);
	}
	
	public void sendMessage(String message)
	{
        String roomName = Red5.getConnectionLocal().getScope().getName();
		application.sendMessage(roomName, message);
	}
    
	public void setChatApplication(ChatApplication a)
	{
		log.debug("Setting Chat Applications");
		application = a;
	}
    
	public void privateMessage(String message, String sender, String recepient){
		log.debug("Received private message: " + message + " from " + sender + " to " + recepient + " The client scope is: " + Red5.getConnectionLocal().getScope().getName());
		ISharedObject sharedObject = application.handler.getSharedObject(Red5.getConnectionLocal().getScope(), recepient);
		ArrayList<String> arguments = new ArrayList<String>();
		arguments.add(sender);
		arguments.add(message);
		sharedObject.sendMessage("messageReceived", arguments);
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
    ;   userid      :   id of user
    ;   username    :   user name
    ;   isRecording :   status of recording
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
        cCHAT_RoomHistoryFileManager historyManager = new cCHAT_RoomHistoryFileManager(roomName);
        if ( null == historyManager ){
            log.debug("ERROR INITIALIZE ChatRoomHistoryFileManager");
            return null ;
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
        
        String roomName = Red5.getConnectionLocal().getScope().getName();
        
        cCHAT_RoomHistoryFileManager historyManager = new cCHAT_RoomHistoryFileManager(roomName);
        if ( null == historyManager ){
            log.error("Failed to initialize historyManager");
            return null ;
        }
        
        log.debug("getHistoryFileChatMessage {}" , historyManager.getHistoryFileContent(fileName));
        return historyManager.getHistoryFileContent(fileName);
    }/** END FUNCTION 'getHistoryChatMessages' **/
    
    
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
    ;   initialize priRecorder object if it is not initialized
    ;   write message to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void recordChatMessage(String userid, String toUser, String message){
        
        if ( (null == userid) || (null == toUser) || (null == message) ){
            log.error("recordChatMessage ERROR INPUT PARAMETER");
            return ;
        }
        
        if ( null == priRecorder ){
            log.debug("null object");
            initializePrivateChatRecorder() ;
        }
        log.debug("add to chat");
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
    ;  set recording status to a user
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void setPrivateRecordStatus(String toUser, boolean record){
        if ( null == toUser ){
            log.error("setPrivateRecordStatus ERROR INPUT PARAMETER");
            return ;
        }
        
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
    ;  add user information to user list
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void addUserToList(String userid, String username, boolean record){
        
        if ( (null == userid) || (null == username) ){
            log.error("addUserToList ERROR INPUT PARAMETER");
            return ;
        }
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
    ;  remove a user from the list
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void removeUserFromList(String userid){
        if ( null == userid ){
            log.error ("removeUserFromList ERROR INPUT PARAMETER");
            return ;
        }
        
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
    ;  get user recorded file list
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public List<String> getPrivateFileList(String userid){
        
        if ( null == userid ){
            log.error ("getPrivateFileList ERROR INPUT PARAMETER");
            return null ;
        }
        
        String roomName = Red5.getConnectionLocal().getScope().getName();
        
        cCHAT_RoomHistoryFileManager historyManager = new cCHAT_RoomHistoryFileManager(roomName + "/" + userid);
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
    ;  get user recorded file content
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public List<String> getPrivateChatMessages(String userid,String fileName){
        
        if ( (null == userid) || (null == fileName) ){
            log.error("getPrivateChatMessages ERROR INPUT PARAMETER");
            return null ;
        }
        
        String roomName = Red5.getConnectionLocal().getScope().getName();
        
        cCHAT_RoomHistoryFileManager historyManager = new cCHAT_RoomHistoryFileManager(roomName + "/" + userid);
        if ( null == historyManager ){
            log.debug("ERROR INITIALIZE ChatRoomHistoryFileManager");
            return null ;
        }
        
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
    ;  initialize priRecorder object
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 16-01-2011
    ******************************************************************************/
    public void initializePrivateChatRecorder() {
        String roomName = Red5.getConnectionLocal().getScope().getName();
        priRecorder = new cCHAT_PrivateMessageRecorder(roomName) ;
        if ( null == priRecorder ){
            log.debug("Initialize failed" );
            return ;
        }
    }/** END FUNCTION 'initializePrivateChatRecorder' **/
    
   
}
