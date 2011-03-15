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
;  cCHAT_PrivateMessageRecorder
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to record the chat message
;  
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class cCHAT_PrivateMessageRecorder{

private static Logger log = Red5LoggerFactory.getLogger( cCHAT_PrivateMessageRecorder.class, "bigbluebutton" );
   
    private File curHistoryFile = null ;
    private String curDir ;
    private cCHAT_UserMessageRecorder objUser = new cCHAT_UserMessageRecorder() ;
    private String dPath = "/tmp/" ;
    


    /*****************************************************************************
    ;  cCHAT_PrivateMessageRecorder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of cCHAT_PrivateMessageRecorder Class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   room    :   conference room name
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public cCHAT_PrivateMessageRecorder() {
        log.debug("cCHAT_PrivateMessageRecorder Constructor...");
        
    }/** END FUNCTION 'cCHAT_PrivateMessageRecorder' **/
    
    /*****************************************************************************
    ;  createRecordFolder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is used to create folder
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid : String , id of user
    ; 
    ; IMPLEMENTATION
    ;   create folder to store record file
    ;   
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean createRecordFolder(String room,String userid){
        if ( null == userid || null == room){
            log.error ("createRecordFolder ERROR INPUT PARAMETER userid " + userid + " room " + room );
            return false ;
        }
        
        String externUserId = objUser.getExternUserID(userid);
        
        File dir = new File(dPath + room + "/" + userid);
        if ( null == dir ){
            log.error ("createRecordFolder Failed to initialize directory");
            return false ;
        }
        
        boolean success = false ;
        if ( false == dir.exists() ){
            success = dir.mkdir() ;
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
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   file name
    ; 
    ; IMPLEMENTATION
    ;  create record file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean createRecordFile(String room, String userid, String fileName){
        
        if ( (null == userid) || (null == fileName) || (null == room) ){
            log.error("createRecordFile ERROR INPUT PARAMETER " + userid + " " + fileName + " " + room);
            return false ;
        }
        
        String externUserId = objUser.getExternUserID(userid);
        
        File f = new File(dPath + room + "/" + userid, fileName);
        if ( null == f ){
            log.error("createRecordFile Initialize file");
            return false ;
        }
        
        if ( true == f.exists() ){
            return true ;
        }else{
            try{
                log.info("createRecordFile File " + f ) ;
                f.createNewFile();
            }catch(IOException e){
                log.error ("ERROR: {}",e.getMessage());
            }
        }
        return true ;
    }/** END FUNCTION 'createRecordFile' **/
    
    /*****************************************************************************
    ;  recordFileExists
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check whether file exists
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   file name
    ; 
    ; IMPLEMENTATION
    ;   detect whether the record file exist or not  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean recordFileExists(String room, String userid,String fileName){
        
        if ( (null == userid) || (null == fileName) || (null == room) ){
            log.error("recordFileExists ERROR INPUT PARAMETER " + userid + " " + fileName + " " + room);
            return false ;
        }
        
        String externUserId = objUser.getExternUserID(userid);
        
        File fName = new File(dPath + room + "/" + userid, fileName) ;
        if ( null == fName ){
            log.error("recordFileExists initialize file " + userid + " " + fileName);
            return false ;
        }
        
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
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   username    :   user name
    ;   record      :   record status
    ; 
    ; IMPLEMENTATION
    ;   add user to user list  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void addUserToList(String room,String userid, String username, boolean record,String externUserID){
        log.debug("Add User Entry" );
        
        if ( (null == userid) || (null == username) ){
            log.error("addUserToList ERROR INPUT PARAMETER " + userid + " " + username + " " + room);
            return ;
        }

        if ( null == objUser ){
            log.error("addUserToList Initialize Failed" );
            return ;
        }
        
        boolean success = false ;
        
        success = objUser.addUserToList(room,userid,username,record,externUserID) ;
        if ( false == success ){
            log.error("addUserToList Failed to add user to list " + userid + " " + username + " " + record);
            return ;
        }
    }/** END FUNCTION 'addUserToList' **/
    
    /*****************************************************************************
    ;  getUserFromList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get user from the list
    ; RETURNS : cCHAT_UserMessageRecorder
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;   get user from user list  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private cCHAT_UserMessageRecorder getUserFromList(String userid){
        if ( null == userid ){
            log.error("getUserFromList ERROR INPUT PARAMETER" );
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
    ;   update current file name
    ;   assign recording status to a user in the list  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public String setRecordStatusToUser(String userid,boolean record){
    
        if ( null == userid ){
            log.error("setRecordStatusToUser ERROR INPUT PARAMETER" );
            return "setRecordStatusToUser ERROR INPUT PARAMETER" ;
        }
        
        boolean success = false ;
        if ( false == record ){
            
            success = objUser.updateFileName(userid,"") ;
            if ( false == success ){
                log.error ("setRecordStatusToUser Failed to update file name");
            }
        }
        
        if ( null == objUser ){
            log.error("setRecordStatusToUser ObjUser Null" );
            return "setRecordStatusToUser ObjUser Null"  ;
        }
        
        objUser.setRecordStatusToUser(userid,record) ;
        return "success" ;
        
    }/** END FUNCTION 'setRecordStatusToUser' **/
    
    /*****************************************************************************
    ;  getRecordStatusFromUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get record status to user
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  get record status from a user in the list
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    private boolean getRecordStatusFromUser(String userid){
        if ( null == userid ){
            log.error("getRecordStatusFromUser ERROR INPUT PARAMETER" );
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
    ;  remove a user from the list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void removeUserFromList(String userid){
        boolean success = false ;
        success = objUser.removeUserFromList(userid) ;
        if ( false == success ){
            log.error("removeUserFromList Failed to remove user from list " + userid);
            return ;
        }
    }/** END FUNCTION 'removeUserFromList' **/
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
    ;  remove a user from the list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public String getCurrentRoomFromUser(String userid){
        if ( null == userid ){
            log.error("getCurrentRoomFromUser ERROR INPUT PARAMETER"  );
            return null;
        }
        
        if ( null == objUser ){
            log.error("getCurrentRoomFromUser objUser is empty");
            return null ;
        }
        
        log.info("getCurrentRoomFromUser userid : " + userid );
        return objUser.getCurrentRoomFromUser(userid);
    }
    
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
    ;   userid  :   user id
    ;   toUser  :   to user id
    ;   message :   new message
    ; 
    ; IMPLEMENTATION
    ;   get message info
    ;   get current user record file
    ;   create folder/file if it doesn't exist
    ;   write message to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2011 
    ******************************************************************************/
    public String addChatHistory(String room, String userid, String toUser,  String message){
   
        String errMsg = "success" ;
        
        log.debug("-_>addChatHistory Entry");
        if ( (null == userid) || (null == toUser) || (null == message) ){
            errMsg = "addChatHistory ERROR INPUT PARAMETER";
            log.error("addChatHistory ERROR INPUT PARAMETER");
            return errMsg;
        }
        
        String name = objUser.getUserName(message) ;
        String msg  = objUser.getMessage(message)  ;
        String time = objUser.getTime(message)     ;
        
        String externUserId = objUser.getExternUserID(userid);
        
        cCHAT_UserMessageRecorder user = getUserFromList(toUser);
        if ( null == user ){
            errMsg = "No User in the list";
            log.error("addChatHistory No User in the list");
            return errMsg ;
        }
        
        String fileName = user.curFile ;

        if ( true == user.record ){
            log.debug("User is recording");
            if ( false == recordFileExists(room, userid,fileName) ){
                log.debug("addChatHistory Create Record File " + room + "/" + userid);
                boolean success = false ;
                
                success = createRecordFolder(room,userid);
                if ( false == success ){
                    errMsg = "Failed to create folder";
                    log.error("addChatHistory Failed to create folder");
                    return  errMsg ;
                }
              
                log.debug("Create File filename : " + fileName + " userid: " + userid);
                success = createRecordFile(room,userid,fileName);
                if ( false == success ){
                    errMsg = "Failed to create file";
                    log.error("addChatHistory Failed to create file " + fileName);
                    return errMsg ;
                }
            }
               
            log.error("Initialize curHistoryFile userid: " + userid + 
            " curDir : " + dPath + room  + " fileName : " + fileName);
            
            curHistoryFile = new File(dPath + room + "/" + userid , fileName) ;
            if ( null == curHistoryFile ){
                errMsg = "Failed to initialize curHistoryFile";
                log.error("addChatHistory Failed to initialize curHistoryFile " + curHistoryFile);
                return errMsg ;
            }
            
            try{
                log.debug("Write message to Buffer externID: " + userid + 
                    " curDir : " + dPath + room + "/"  + " fileName : " + fileName);
                    
                BufferedWriter bw = new BufferedWriter(new FileWriter(curHistoryFile, true));
                if ( null == bw ){
                    errMsg = "Failed to initialize buffer";
                    log.debug(" addChatHistory Failed to initialize buffer");
                    return  errMsg;
                }
                bw.write("[" + name + "]" + " : " + time + " : " + msg + "\n" ) ;
                log.info("Append Message to {} ",curHistoryFile);
                log.info("Message to {} ",name + " : " + time + " : " + msg + "\n" );
                bw.close();
            }catch(IOException e){
                log.error("error {}",e.getMessage());
                errMsg = e.getMessage() ;
            }
        }
        log.error("addChatHistory Exit");
        return errMsg ;
        
    }/** END FUNCTION 'addChatHistory' **/
    
    

}/** END CLASS 'cCHAT_PrivateMessageRecorder' **/
