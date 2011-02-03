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
   
    private File curHistoryFile = null ;
    private String curDir ;
    //private ArrayList<UserMessageRecorder> objUser = new ArrayList<UserMessageRecorder>() ;
    private UserMessageRecorder objUser = new UserMessageRecorder() ;
    private String dPath = "/tmp/" ;
    


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
        
        this.curDir = this.dPath + room  ;
        
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
    ;   create the folder to store the file
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean createRecordFolder(String userid){

        File dSender = new File(this.curDir + "/" + userid);
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
    ; RETURNS : true/false
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   file name
    ; 
    ; IMPLEMENTATION
    ;  create a text file
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean createRecordFile(String userid, String fileName){
        File fSender = new File(this.curDir + "/" + userid, fileName);
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
    ; RETURNS : true/false
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   file name
    ; 
    ; IMPLEMENTATION
    ;  check file exist or not
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean recordFileExists(String userid,String fileName){
        boolean exists = false ;
        File fName = new File(this.curDir + "/" + userid, fileName) ;
        if ( true == fName.exists()){
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
    ; RETURNS : true/false
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   username    :   user name
    ;   record      :   record status
    ; 
    ; IMPLEMENTATION
    ;  add user to a list object
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean addUserToList(String userid, String username, boolean record){
        log.debug("Add User Entry" );
        if ( null == userid || null == username ){
            log.debug("Initialize Failed" );
            return false ;
        }
        if ( null == objUser ){
            log.debug("Initialize Failed" );
            return false ;
        }
        
        objUser.addUserToList(userid,username,record) ;
        
        
        return true ;
    }/** END FUNCTION 'addUserToList' **/
    
    /*****************************************************************************
    ;  getUserFromList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get user from the list
    ; RETURNS : UserMessageRecorder
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  get user object from list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private UserMessageRecorder getUserFromList(String userid){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
            return null ;
        }
        
        return objUser.getUserFromList(userid) ;
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
    ;  set record status to user in a list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void setRecordStatusToUser(String userid,boolean record){
    
        if ( null == userid ){
            log.debug("Input parameter NULL" );
            return ;
        }
        objUser.setRecordStatusToUser(userid,record) ;
    }/** END FUNCTION 'setRecordStatusToUser' **/
    
    /*****************************************************************************
    ;  getRecordStatusFromUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get record status to user
    ; RETURNS : true/false
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  get record status from user in a list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean getRecordStatusFromUser(String userid){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
            return false ;
        }
        
        return objUser.getRecordStatusFromUser(userid) ;
    }/** END FUNCTION 'getRecordStatusFromUser' **/
    
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
    ;  remove user from a list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void removeUserFromList(String userid){
        
        objUser.removeUserFromList(userid) ;
        
    }/** END FUNCTION 'removeUserFromList' **/
    
       
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
    ;   message : new message
    ;   userid  :   id of user
    ;   toUser  :   to user id
    ; 
    ; IMPLEMENTATION
    ;  write lMessage to xml content and save content to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2011 
    ******************************************************************************/
    public void addChatHistory(String userid, String toUser,  String message){
   
        String name = objUser.getUserName(message) ;
        String msg  = objUser.getMessage(message)  ;
        String time = objUser.getTime(message)     ;
        
        UserMessageRecorder user = getUserFromList(toUser);
        String fileName = user.curFile ;

        String mesg = "[" + name + "]" + " : " + time + " : "  + msg ;

        if ( true == user.record ){
            
            if ( false == recordFileExists(userid,fileName) ){
                createRecordFolder(userid);
                createRecordFile(userid,fileName);
            }
               
            curHistoryFile = new File(this.curDir + "/" + userid , fileName) ;
            try{
                BufferedWriter out = new BufferedWriter(new FileWriter(curHistoryFile, true));
                if ( null == out ){
                    return ;
                }
                out.write("[" + name + "]" + " : " + time + " : " + msg + "\n" ) ;
                out.close();
            }catch(IOException e){
                log.debug("error {}",e.getMessage());
            }
        }
        
    }/** END FUNCTION 'addChatHistory' **/
    
    

}/** END CLASS 'ChatMessageRecorder' **/
