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
    public cCHAT_PrivateMessageRecorder(String room) {
        log.debug("cCHAT_PrivateMessageRecorder Constructor...");
        this.curDir = dPath + room  + "/" ;
        
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
    private boolean createRecordFolder(String userid){
        if ( null == userid ){
            log.error ("createRecordFolder ERROR INPUT PARAMETER");
            return false ;
        }
        
        File dir = new File(this.curDir + userid);
        if ( null == dir ){
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
    private boolean createRecordFile(String userid, String fileName){
        
        if ( (null == userid) || (null == fileName) ){
            log.error("createRecordFile ERROR INPUT PARAMETER");
            return false ;
        }
        
        File f = new File(this.curDir + userid, fileName);
        if ( null == f ){
            return false ;
        }
        
        if ( true == f.exists() ){
            return true ;
        }else{
            try{
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
    private boolean recordFileExists(String userid,String fileName){
        
        if ( (null == userid) || (null == fileName) ){
            log.error("recordFileExists ERROR INPUT PARAMETER");
            return false ;
        }
        
        File fName = new File(this.curDir + userid, fileName) ;
        if ( null == fName ){
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
    public void addUserToList(String userid, String username, boolean record){
        log.debug("Add User Entry" );
        
        if ( (null == userid) || (null == username) ){
            log.error("addUserToList ERROR INPUT PARAMETER");
            return ;
        }
        if ( null == userid || null == username ){
            log.debug("Initialize Failed" );
            return ;
        }
        if ( null == objUser ){
            log.debug("Initialize Failed" );
            return ;
        }
        
        boolean success = false ;
        
        success = objUser.addUserToList(userid,username,record) ;
        if ( false == success ){
            log.error("Failed to add user to list");
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
            log.debug("getUserFromList ERROR INPUT PARAMETER" );
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
    public void setRecordStatusToUser(String userid,boolean record){
    
        if ( null == userid ){
            log.debug("setRecordStatusToUser ERROR INPUT PARAMETER" );
            return ;
        }
        
        boolean success = false ;
        if ( false == record ){
            
            success = objUser.updateFileName(userid,"") ;
            if ( false == success ){
                log.error ("Failed to update file name");
            }
        }
        
        objUser.setRecordStatusToUser(userid,record) ;
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
            log.error("Failed to remove user from list");
            return ;
        }
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
    public void addChatHistory(String userid, String toUser,  String message){
   
        log.debug("addChatHistory Entry");
        if ( (null == userid) || (null == toUser) || (null == message) ){
            log.error("addChatHistory ERROR INPUT PARAMETER");
            return ;
        }
        
        String name = objUser.getUserName(message) ;
        String msg  = objUser.getMessage(message)  ;
        String time = objUser.getTime(message)     ;
        
        cCHAT_UserMessageRecorder user = getUserFromList(toUser);
        if ( null == user ){
            return ;
        }
        
        String fileName = user.curFile ;

        if ( true == user.record ){
            
            if ( false == recordFileExists(userid,fileName) ){
                
                boolean success = false ;
                
                success = createRecordFolder(userid);
                if ( false == success ){
                    log.error("Failed to create folder");
                    return  ;
                }
              
                success = createRecordFile(userid,fileName);
                if ( false == success ){
                    log.error("Failed to create file");
                    return ;
                }
            }
               
            curHistoryFile = new File(this.curDir + userid , fileName) ;
            if ( null == curHistoryFile ){
                log.error("Failed to initialize curHistoryFile");
                return ;
            }
            
            try{
                BufferedWriter bw = new BufferedWriter(new FileWriter(curHistoryFile, true));
                if ( null == bw ){
                    log.error("Failed to initialize buffer");
                    return  ;
                }
                bw.write("[" + name + "]" + " : " + time + " : " + msg + "\n" ) ;
                log.debug("Append Message to {} ",curHistoryFile);
                log.debug("Message to {} ",name + " : " + time + " : " + msg + "\n" );
                bw.close();
            }catch(IOException e){
                log.debug("error {}",e.getMessage());
            }
        }
        
    }/** END FUNCTION 'addChatHistory' **/
    
    

}/** END CLASS 'cCHAT_PrivateMessageRecorder' **/
