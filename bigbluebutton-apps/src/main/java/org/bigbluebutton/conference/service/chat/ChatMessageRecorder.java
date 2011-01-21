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
;  ChatMessageRecorder
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to record the chat message
;  
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class ChatMessageRecorder implements IChatRoomListener {

private static Logger log = Red5LoggerFactory.getLogger( ChatMessageRecorder.class, "bigbluebutton" );

    private Boolean record;
    private ISharedObject so;
    
    private File gHistoryFile = null ;
    private String gFileName = "ChatMessageRecorded-" ; ;
    private String gDir ;
    private Integer _suffix=1 ;

    
    String name = "CHATRECORDER";

    /*****************************************************************************
    ;  ChatMessageRecorder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of ChatMessageRecorder Class
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
    ; 
    ******************************************************************************/
    public ChatMessageRecorder(ISharedObject so, String lDir) {
        log.debug("ChatMessageRecorder Constructor...");
        // check whether the input parameter is null or not
        if ( (null == so) || (null == lDir) ){
            log.debug("The SO parameter is null");
        }
        
        
        boolean success = false ;
        
        this.so = so; 
        this.gDir = "/tmp/" + lDir ;
        
        success = (new File(gDir)).mkdir() ;
        
        if ( true == success ){
            log.debug("Directory {} was created",gDir);
        }else{
            log.debug("Directory {} was not created",gDir);
        }
        
    }/** END FUNCTION 'ChatMessageRecorder' **/

    /*****************************************************************************
    ;  getName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is implemented from IChatRoomListener.
    ; RETURNS : name
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
        log.debug("ChatMessageRecorder getName {}" , name);
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
        log.debug("ChatMessageRecorder newChatMessage {}" , message);
        
        //check whether the input parameter is null or not
        if ( null == message ){
            log.debug("ChatMessageRecorder newChatMessage null");
            return ;
        }
        
        if ( true == this.record ){
            addChatHistory(message);
        }
    }/** END FUNCTION 'newChatMessage' **/
    
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
    ;   status  :   true/false
    ; 
    ; IMPLEMENTATION
    ;  set the recording status
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    @Override
    public void setRecordStatus(Boolean status){
        // check input parameter
        if ( null == status ){
            log.debug("Record Status Parameter is null");
            return ;
        }
        
        boolean success = false ;
        this.record = status ;
        log.debug("setRecordStatus Setting {}",this.record);
        
        // create file when moderator click record button
        if ( true == this.record ){
            success = createHistoryFile() ;
            if ( false == success ){
                return ;
            }
        }
        
    }/** END FUNCTION 'setRecordStatus' **/
    
    /*****************************************************************************
    ;  createUniqueFile
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to create a unique file name
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  initialize new file in gDir
    ;  if file exists, initialize another new file name
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    private boolean createUniqueFile(){
        gHistoryFile = new File( gDir, gFileName + _suffix );
        if ( null == gHistoryFile ){
            log.debug ("ERROR INITIALIZE gHistoryFile");
            return false ;
        }
        
        boolean success = true ;
        
        while(gHistoryFile.exists()){
            _suffix = _suffix + 1 ;
            gHistoryFile = new File( gDir, gFileName + _suffix );
            if ( null == gHistoryFile ){
                log.debug ("ERROR INITIALIZE gHistoryFile");
                success = false ;
                break ;
            }
        }
        if ( false == success ){
            return false ;
        }
        
        try{
            gHistoryFile.createNewFile();
        }catch(IOException e){
            log.debug ("ERROR: {}",e.getMessage());
        }
        log.debug("Current Used File {}", gHistoryFile);
        return true ;
        
    }/** END FUNCTION 'createUniqueFile' **/
    
    /*****************************************************************************
    ;  createHistoryFile
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to write the xml file doc to xml file name
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  create a unique file name
    ;  create xml element 
    ;  save to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    private boolean createHistoryFile(){
        boolean success = false ;
        success = createUniqueFile();        
        return success ;
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
    ;   lMessage : String
    ; 
    ; IMPLEMENTATION
    ;  write lMessage to xml content and save content to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    public boolean addChatHistory(String lMessage){
        
        if ( null == lMessage ){
            log.debug("error input parameter");
            return false ;
        }
        
        String name = this.getUserName(lMessage) ;
        String msg  = this.getMessage(lMessage)  ;
        String time = this.getTime(lMessage)     ;
        
        try{
            BufferedWriter out = new BufferedWriter(new FileWriter(gHistoryFile, true));
            out.write("[" + name + "]" + " : " + time + " : " + msg + "\n" ) ;
            log.debug("Append Message to {} ",gHistoryFile);
            log.debug("Message to {} ",name + " : " + time + " : " + msg + "\n" );
            out.close();
        }catch(IOException e){
            log.debug("error {}",e.getMessage());
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
    ; 12-27-2010 
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
