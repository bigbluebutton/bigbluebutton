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

import org.bigbluebutton.conference.service.chat.IChatRoomListener;
import org.bigbluebutton.conference.service.chat.cCHAT_UserMessageRecorder;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.io.File;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Iterator;

/*****************************************************************************
;  cCHAT_MessageRecorder
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to record the chat message
;  
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class cCHAT_MessageRecorder implements IChatRoomListener {

private static Logger log = Red5LoggerFactory.getLogger( cCHAT_MessageRecorder.class, "bigbluebutton" );

    private boolean record;
    private ISharedObject so;
    
    private File curHistoryFile = null ;
    private static final String prefixFileName = "PublicChatMessageRecorded-" ;
    private String curDir ;
    private cCHAT_UserMessageRecorder objUser ;
    private String dPath = "/tmp/" ;

    
    private static final String name = "CHATRECORDER";

    /*****************************************************************************
    ;  cCHAT_MessageRecorder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of cCHAT_MessageRecorder Class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   so      :   ShareObject of the chat
    ;   dir    :   Directory to store the record message file
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    public cCHAT_MessageRecorder(ISharedObject so, String dir) {
        log.debug("cCHAT_MessageRecorder Constructor...");      
        
        boolean success = false ;
        
        this.so = so; 
        this.curDir = dPath + dir  ;
        objUser = new cCHAT_UserMessageRecorder() ;
        
        File f = new File(curDir) ;
        if ( null != f ){
            if ( false == f.exists() ){
                success = f.mkdir() ;
                if ( true == success ){
                    log.error("Directory {} was created",curDir);
                }else{
                    log.error("Directory {} was not created",curDir);
                }
            }
        }
        
        
    }/** END FUNCTION 'cCHAT_MessageRecorder' **/
        
    /*****************************************************************************
    ;  getName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is implemented from IChatRoomListener.
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  get the name of Application
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 27-12-2010
    ******************************************************************************/
    @Override
    public String getName() {
        return name;
    }/** END FUNCTION 'getName' **/
    
    /*****************************************************************************
    ;  newChatMessage
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is implemented from IChatRoomListener. It is used to save 
    ;   chat message to file when record status is true
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message :   new message
    ; 
    ; IMPLEMENTATION
    ;  save chat to file when new message
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    @Override
    public void newChatMessage(String message) {
               
        //check whether the input parameter is null or not
        if ( null == message ){
            log.debug("ChatMessageRecorder ERROR INPUT PARAMETER");
            return ;
        }
        
        addMessageToRecordUser(message) ;
    }/** END FUNCTION 'newChatMessage' **/
    
    /*****************************************************************************
    ;  addMessageToRecordUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is implemented from IChatRoomListener. It is used to set up
    ;   recording status
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message  :   new message
    ; 
    ; IMPLEMENTATION
    ;  add new message to record user file
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    private void addMessageToRecordUser(String message){
        
        if ( null == message ){
            log.error("addMessageToRecordUser ERROR INPUT PARAMETER");
            return ;
        }
        
        ArrayList<cCHAT_UserMessageRecorder> userList = objUser.getUserList() ;
        int i=0 ;
        if ( null != userList ){
            for(i=0; i<userList.size(); i++){
                if ( true == userList.get(i).record ){
                    addChatHistory(message,userList.get(i).curFile) ;
                }
            }
        }
        
    }/** END FUNCTION 'addMessageToRecordUser' **/
    
    /*****************************************************************************
    ;  isFileExist
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is implemented from IChatRoomListener. It is used to set up
    ;   recording status
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   fileName  :   name of file
    ; 
    ; IMPLEMENTATION
    ;  detect whether the file exists or not
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    private boolean isFileExist(String fileName){
        if ( null == fileName ){
            log.error("isFileExist ERROR INPUT PARAMETER");
            return false ;
        }   
        
        File f = new File(this.curDir,fileName) ;
        if ( null != f ){
            if ( false == f.exists() ){
                return false ;
            }else{
                return true ;
            }
        }else{
            log.error("Failed to initialize file");
            return false ;
        }
    }/** END FUNCTION 'isFileExist' **/
    
    /*****************************************************************************
    ;  setRecordStatus
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is implemented from IChatRoomListener. It is used to set up
    ;   recording status
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  :   id of user
    ;   username:   user name
    ;   status  :   true/false
    ; 
    ; IMPLEMENTATION
    ;  set the recording status to a user in the list
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    @Override
    public void setRecordStatus(String userid, String username, boolean status){
        
        log.debug("setRecordStatus Entry");
        
        if ( null == userid || null == username ){
            log.debug("setRecordStatus ERROR INPUT PARAMETER");
            return ;
        }
        
        boolean success = false ;
        
        if ( null != objUser ){       
            success = objUser.addUserToList(userid,username,status) ;
            if ( true == success ){        
                objUser.setRecordStatusToUser(userid,status) ;
            }
        }        
        
        // create file when moderator click record button
        if ( true == status ){
            success = createHistoryFile(userid) ;
            if ( false == success ){
                log.error("Failed to create file");
                return ;
            }
        }
        
    }/** END FUNCTION 'setRecordStatus' **/
    
    /*****************************************************************************
    ;  createUniqueFile
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to create a unique file
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  :   id of user
    ; 
    ; IMPLEMENTATION
    ;  update user file name
    ;  initialize current file name
    ;  create new file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    private boolean createUniqueFile(String userid){
            
        if ( null == userid ){
            log.error("createUniqueFile ERROR INPUT PARAMETER");
            return false ;
        }
        
        boolean success= false ;
        success = objUser.updateFileName(userid,prefixFileName);
        if ( false == success ){
            return false ;
        }
        
        curHistoryFile = new File( curDir, objUser.getCurrentFileFromUser(userid) );
        if ( null == curHistoryFile ){
            log.error ("Failed to initialize curHistoryFile");
            return false ;
        }
       
        try{
            curHistoryFile.createNewFile();
        }catch(IOException e){
            log.debug ("ERROR: {}",e.getMessage());
        }
        
        return true ;
        
    }/** END FUNCTION 'createUniqueFile' **/
    
    /*****************************************************************************
    ;  createHistoryFile
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to create file
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid  :   id of user
    ; 
    ; IMPLEMENTATION
    ; create file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    private boolean createHistoryFile(String userid){
        return createUniqueFile(userid);        
    }/** END FUNCTION 'createHistoryFile' **/
    
    /*****************************************************************************
    ;  addChatHistory
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to write the message to xml content
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message     :   new message
    ;   fileName    :   file name
    ;
    ; IMPLEMENTATION
    ;   get message info
    ;   append message to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    public void addChatHistory(String message,String fileName){
        
        if ( (null == message) || (null == fileName) ){
            log.error("addChatHistory ERROR INPUT PARAMETER");
            return  ;
        }
                
        File file = new File(curDir,fileName);
        if ( null == file ){
            log.error("Failed to initialize file");
            return  ;
        }
        
        String name = objUser.getUserName(message) ;
        String msg  = objUser.getMessage(message)  ;
        String time = objUser.getTime(message)     ;
        
        try{
            FileWriter fr = new FileWriter(file, true) ;
            if ( null == fr ){
                log.error("Failed to initialize file writer");
                return  ;
            }
            
            BufferedWriter bw = new BufferedWriter(fr);
            if ( null == bw ){
                log.error("Failed to initialize buffer");
                return ;
            }
            
            bw.write("[" + name + "]" + " : " + time + " : " + msg + "\n" ) ;
            log.debug("Append Message to {} ",file);
            log.debug("Message to {} ",name + " : " + time + " : " + msg + "\n" );
            bw.close();
        }catch(IOException e){
            log.debug("error {}",e.getMessage());
        }
    }/** END FUNCTION 'addChatHistory' **/

}/** END CLASS 'cCHAT_MessageRecorder' **/
