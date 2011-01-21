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
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.io.File;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Iterator;

/*****************************************************************************
;  PrivateChatMessageRecorder
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to record the chat message
;  
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class PrivateChatMessageRecorder{

private static Logger log = Red5LoggerFactory.getLogger( PrivateChatMessageRecorder.class, "bigbluebutton" );
   
    private File gHistoryFile = null ;
    private String gFileName = "ChatMessageRecorded-" ; ;
    private String gDir ;
    private ArrayList<UserMessageRecorder> objUser = new ArrayList<UserMessageRecorder>() ;
    private boolean record ;
    private int _suffix = 0 ;
    


    /*****************************************************************************
    ;  PrivateChatMessageRecorder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of PrivateChatMessageRecorder Class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   so      :   ShareObject of the chat
    ;   lDir    :   Directory to store the record message file
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public PrivateChatMessageRecorder(String room) {
        log.debug("PrivateChatMessageRecorder Constructor...");
        
        this.gDir = "/tmp/" + room  ;
        
    }/** END FUNCTION 'PrivateChatMessageRecorder' **/
    
    /*****************************************************************************
    ;  createRecordFolder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is used to create folder
    ; RETURNS : name
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid : String , id of user
    ; 
    ; IMPLEMENTATION
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean createRecordFolder(String userid){

        File dSender = new File(this.gDir + "/" + userid);
        boolean success = false ;
        if ( false == dSender.exists() ){
            success = dSender.mkdir() ;
        }else{
            success = true ;
        }
        return success ;
    }/** END FUNCTION 'createRecordFolder' **/
    
    /*****************************************************************************
    ;  createRecordFile
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to create file
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   file name
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean createRecordFile(String userid, String fileName){
        File fSender = new File(this.gDir + "/" + userid, fileName);
        if ( true == fSender.exists() ){
            return true ;
        }else{
            try{
                fSender.createNewFile();
            }catch(IOException e){
                log.debug ("ERROR: {}",e.getMessage());
            }
        }
        return true ;
    }/** END FUNCTION 'createRecordFile' **/
    
    /*****************************************************************************
    ;  recordFileExists
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check whether file exists
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   file name
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean recordFileExists(String userid,String fileName){
        boolean exists = false ;
        File lFileName = new File(this.gDir + "/" + userid, fileName) ;
        if ( true == lFileName.exists()){
            return true ;
        }else{
            return false ;
        }
    }/** END FUNCTION 'recordFileExists' **/
    
    /*****************************************************************************
    ;  addUserToList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to add user to the list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   username    :   user name
    ;   record      :   record status
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean addUserToList(String userid, String username, boolean record){
        log.debug("Add User Entry" );
        log.debug("user : " + userid + " " + username + " " + record + " ");
        UserMessageRecorder user = new UserMessageRecorder() ;
        if ( null == user ){
            log.debug("Initialize Failed" );
            return false ;
        }
        if ( null == objUser ){
            log.debug("Initialize Failed" );
            return false ;
        }
        if ( false == isUserExist(userid) ){
            user.toUser = userid ;
            user.username = username ;
            user.record = record ;
            user.suffix = 1 ;
            user.curFile = user.username + "-" + user.suffix ;
            objUser.add(user) ;
        }
        
        return true ;
    }/** END FUNCTION 'addUserToList' **/
    
    /*****************************************************************************
    ;  getUserFromList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get user from the list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private UserMessageRecorder getUserFromList(String userid){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
        }
        
        UserMessageRecorder user = null ;
        
        int i=0 ;
        for(i=0; i<objUser.size(); i++){
            log.debug(" getUserFromList user : " + objUser.get(i).toUser + " " + objUser.get(i).username + " " + objUser.get(i).record + " ");
            if ( 0 == userid.compareTo(objUser.get(i).toUser) ){
                log.debug(" getUserFromList user : " + objUser.get(i).toUser + " " + objUser.get(i).username + " " + objUser.get(i).record + " ");
                user = objUser.get(i) ;
                break ;
            }
        }
        
        return user ;
    }/** END FUNCTION 'getUserFromList' **/
    
    /*****************************************************************************
    ;  setRecordStatusToUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set record status to user
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   record      :   record status
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void setRecordStatusToUser(String userid,boolean record){
    
        if ( null == userid ){
            log.debug("Input parameter NULL" );
        }
        
        if ( false == record ){
            updateFileName(userid) ;
        }
        
        int i=0 ;
        for(i=0; i<objUser.size(); i++){
            if ( 0 == userid.compareTo(objUser.get(i).toUser) ){
                objUser.get(i).record = record ;
                break ;
            }
        }
    }/** END FUNCTION 'setRecordStatusToUser' **/
    
    /*****************************************************************************
    ;  getRecordStatusFromUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get record status to user
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean getRecordStatusFromUser(String userid){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
        }
        
        int i=0 ;
        boolean record = false ;
        for(i=0; i<objUser.size(); i++){
            if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                record = objUser.get(i).record ;
                break ;
            }
        }
        
        return record ;
    }/** END FUNCTION 'getRecordStatusFromUser' **/
    
    /*****************************************************************************
    ;  updateFileName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to update the saved file name
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean updateFileName(String userid){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
        }
        
        int i=0 ;
        for(i=0; i<objUser.size(); i++){
            if ( 0 == userid.compareTo(objUser.get(i).toUser ) ){
                objUser.get(i).suffix = objUser.get(i).suffix + 1 ;
                objUser.get(i).curFile = objUser.get(i).username + "-" + objUser.get(i).suffix ; 
                break ;
            }
        }
        
        return true ;
    }/** END FUNCTION 'updateFileName' **/
    
    /*****************************************************************************
    ;  isUserExist
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check whether user is already exist in the list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean isUserExist(String userid){
    
        if ( null == userid ){
            log.debug("Input parameter NULL" );
        }
        
        int i=0 ;
        boolean exist = false ;
        for(i=0; i<objUser.size(); i++){
            if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                exist = true ;
                break ;
            }
        }
        
        return exist ;
    }/** END FUNCTION 'isUserExist' **/
    
    /*****************************************************************************
    ;  removeUserFromList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to remove user from the list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean removeUserFromList(String userid){
        
        int i=0 ;
        for(i=0; i<objUser.size(); i++){
            if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                objUser.remove(i) ;
                break ;
            }
        }
        
        return true ;
    }/** END FUNCTION 'removeUserFromList' **/
    
    /*****************************************************************************
    ;  addSelfToList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to add self to the list
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   username    :   user name
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private void addSelfToList(String userid,String username, boolean record){
        addUserToList(userid,username,record);
    }/** END FUNCTION 'addSelfToList' **/
    
    /*****************************************************************************
    ;  addSelfChat
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to record self chat message
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void addSelfChat(String userid,String toUser,String lMessage){
    
        addChatHistory(userid,toUser,lMessage);
         
    }/** END FUNCTION 'addSelfChat' **/
    
    /*****************************************************************************
    ;  addChatHistory
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to write the message to file
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   lMessage : String
    ; 
    ; IMPLEMENTATION
    ;  write lMessage to xml content and save content to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2011 
    ******************************************************************************/
    public boolean addChatHistory(String userid, String toUser,  String lMessage){
   
        String name = this.getUserName(lMessage) ;
        String msg  = this.getMessage(lMessage)  ;
        String time = this.getTime(lMessage)     ;
        
        UserMessageRecorder user = getUserFromList(toUser);
        String fileName = user.curFile ;

        String mesg = "[" + name + "]" + " : " + time + " : "  + msg ;

        if ( true == user.record ){
            
            if ( false == recordFileExists(userid,fileName) ){
                createRecordFolder(userid);
                createRecordFile(userid,fileName);
            }
               
            gHistoryFile = new File(this.gDir + "/" + userid , fileName) ;
            try{
                BufferedWriter out = new BufferedWriter(new FileWriter(gHistoryFile, true));
                out.write("[" + name + "]" + " : " + time + " : " + msg + "\n" ) ;
                log.debug("Append Message to {} ",gHistoryFile);
                log.debug("Message to {} ",name + " : " + time + " : " + msg + "\n" );
                out.close();
            }catch(IOException e){
                log.debug("error {}",e.getMessage());
            }
        }
        
        
        return true ;
    }/** END FUNCTION 'addChatHistory' **/
    
    /*****************************************************************************
    ;  getUserName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the user name from lMessage
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   lMessage : String 
    ; 
    ; IMPLEMENTATION
    ;  split string to get the user name
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2011 
    ******************************************************************************/
    public String getUserName(String lMessage){
        String[] lMsgTemp ;
        lMsgTemp = lMessage.split("\\|") ;
        return lMsgTemp[1] ;
    }/** END FUNCTION 'getUserName' **/
    
    /*****************************************************************************
    ;  getMessage
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the message from lMessage
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   lMessage : String 
    ; 
    ; IMPLEMENTATION
    ;  split string to get the message
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-12-2011 
    ******************************************************************************/
    public String getMessage(String lMessage){
        String[] lMsgTemp ;
        lMsgTemp = lMessage.split("\\|") ;
        return lMsgTemp[0] ;
    }/** END FUNCTION 'getMessage' **/
    
    /*****************************************************************************
    ;  getTime
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the time from lMessage
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   lMessage : String 
    ; 
    ; IMPLEMENTATION
    ;  split string to get the time
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-12-2011 
    ******************************************************************************/
    public String getTime(String lMessage){
        String[] lMsgTemp ;
        lMsgTemp = lMessage.split("\\|") ;
        return lMsgTemp[3] ;
    }/** END FUNCTION 'getTime' **/

}/** END CLASS 'ChatMessageRecorder' **/
