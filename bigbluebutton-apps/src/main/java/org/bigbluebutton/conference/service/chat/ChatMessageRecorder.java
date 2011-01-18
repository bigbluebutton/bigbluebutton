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

import org.jdom.Document;
import org.jdom.DocType;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import java.io.File;
import java.io.FileWriter;
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
    private Document gXmlDoc = null ;
    private DocType  gXmlDocType = null ;
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
        
        this.so = so; 
        boolean success ;
        this.gDir = "/tmp/" + lDir ;
        
        success = (new File(gDir)).mkdir() ;
        
        if ( true == success ){
            log.debug("Directory {} was created",gDir);
        }else{
            log.debug("Directory {} was not created",gDir);
        }
    }
    /**
    * END FUNCTION 'ChatMessageRecorder'
    **/

    /*****************************************************************************
    ;  getName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is implemented from IChatRoomListener.
    ; RETURNS : N/A
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
    }
    /**
    * END FUNCTION 'getName'
    **/
    
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
    }
    /**
    * END FUNCTION 'newChatMessage'
    **/
    
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
        }
        
        this.record = status ;
        log.debug("setRecordStatus Setting {}",this.record);
        
        // create file when moderator click record button
        if ( true == this.record ){
            createHistoryFile();
        }
        
    }
    /**
    * END FUNCTION 'setRecordStatus'
    **/
    
    /*****************************************************************************
    ;  loadHistoryFileContent
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to read the content of xml file
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  load content of a file to store in gXmlDoc
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    private boolean loadHistoryFileContent() throws IOException{
        try{
            SAXBuilder builder = new SAXBuilder();
            if ( null == builder ){
                log.debug("ERROR INITIALIZE SAXBuilder");
                return false ;
            }
            gXmlDoc = builder.build(gHistoryFile) ;
        }catch(JDOMException e){
            e.printStackTrace(System.err);
        }
        return true ;
    }
    /**
    * END FUNCTION 'loadHistoryFileContent'
    **/
        
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
        }
        while(gHistoryFile.exists()){
            _suffix = _suffix + 1 ;
            gHistoryFile = new File( gDir, gFileName + _suffix );
            if ( null == gHistoryFile ){
                log.debug ("ERROR INITIALIZE gHistoryFile");
            }
        }
        log.debug("Current Used File {}", gHistoryFile);
        return true ;
        
    }
    /**
    * END FUNCTION 'createUniqueFile'
    **/
    
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
        createUniqueFile();
        Element root = new Element("ChatHistory");
        if ( null == root ){
            log.debug("ERROR INITIALIZE root Element");
        }
        Element pubChat = new Element("Public") ;
        if ( null == pubChat ){
            log.debug("ERROR INITIALIZE public tag Element");
        }
        Element priChat = new Element("Private") ;
        if ( null == priChat ){
            log.debug("ERROR INITIALIZE private tag Element");
        }
        gXmlDocType = new DocType("BigBlueButton") ;
        if ( null == gXmlDocType ){
            log.debug("ERROR INITIALIZE DocType Element");
        }
        gXmlDoc = new Document(root,gXmlDocType);
        if ( null == root ){
            log.debug("ERROR INITIALIZE gXmlDoc Element");
        }
        root.addContent(pubChat) ;
        root.addContent(priChat) ;
        try{
            saveHistoryFile() ;
        }catch(IOException e){
            e.printStackTrace(System.err);
        }
        
        return true ;
    }
    /**
    * END FUNCTION 'createHistoryFile'
    **/
    
    /*****************************************************************************
    ;  saveHistoryFile
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to save the content of xml to a file
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  get the output of xml content then write to file
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    private void saveHistoryFile() throws IOException {
        XMLOutputter outputter = new XMLOutputter();
        if ( null == outputter ) {
            log.debug("ERROR INITIALIZE Xml Output");
        }
        FileWriter writer = new FileWriter(gHistoryFile);
        if ( null == writer ) {
            log.debug("ERROR INITIALIZE File Writer Output");
        }
        outputter.output(gXmlDoc,writer);
        writer.close();
    }
    /**
    * END FUNCTION 'saveHistoryFile'
    **/
    
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
        Element element = new Element("Message");
        if ( null == element ) {
            log.debug("ERROR INITIALIZE Element Message");
        }
        element.setText(lMessage);
        element.setAttribute("name", getUserName(lMessage));
        gXmlDoc.getRootElement().getChild("Public").addContent(element) ;
        try{
            saveHistoryFile() ;
        }catch(IOException e){
            e.printStackTrace(System.err);
        }
        return true ;
    }
    /**
    * END FUNCTION 'addChatHistory'
    **/
    
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
    }
    /**
    * END FUNCTION 'getUserName'
    **/
}/**
    * END CLASS 'ChatMessageRecorder'
    **/
