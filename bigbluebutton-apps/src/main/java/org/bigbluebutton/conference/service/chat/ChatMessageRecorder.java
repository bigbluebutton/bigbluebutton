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
;
; RETURNS : N/A
;
; INTERFACE NOTES
;   INPUT
; 
; IMPLEMENTATION
;  
; HISTORY
; __date__ :        PTS:            Description
; 
******************************************************************************/
public class ChatMessageRecorder implements IChatRoomListener {

private static Logger log = Red5LoggerFactory.getLogger( ChatMessageRecorder.class, "bigbluebutton" );

    //IRecorder recorder;
    private Boolean record;
    private ISharedObject so;
    
    private File gHistoryFile = null ;
    private Document gXmlDoc = null ;
    private DocType  gXmlDocType = null ;
    private String gFileName = "ChatMessageRecorded-" ; ;
    private String gDir ;
    private Integer _suffix=0 ;
    
    String name = "CHATRECORDER";

    /*****************************************************************************
    ;  ChatMessageRecorder
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    public ChatMessageRecorder(ISharedObject so, String lDir) {
        log.debug("ChatMessageRecorder Constructor...");
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    @Override
    public void newChatMessage(String message) {
        log.debug("ChatMessageRecorder newChatMessage {}" , message);
        if ( true == this.record ){
            addChatHistory(message);
        }else{
            
        }
    }
    /**
    * END FUNCTION 'newChatMessage'
    **/
    
    /*****************************************************************************
    ;  setRecordStatus
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    @Override
    public void setRecordStatus(Boolean status){
        this.record = status ;
        log.debug("setRecordStatus Setting {}",this.record);
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    private boolean loadHistoryFileContent() throws IOException{
        try{
            SAXBuilder builder = new SAXBuilder();
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    private boolean createUniqueFile(){
        gHistoryFile = new File( gDir, gFileName + _suffix );
        while(gHistoryFile.exists()){
            _suffix = _suffix + 1 ;
            gHistoryFile = new File( gDir, gFileName + _suffix );
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    private boolean createHistoryFile(){
        createUniqueFile();
        Element root = new Element("ChatHistory");
        Element pubChat = new Element("Public") ;
        Element priChat = new Element("Private") ;
        gXmlDocType = new DocType("BigBlueButton") ;
        gXmlDoc = new Document(root,gXmlDocType);
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    private void saveHistoryFile() throws IOException {
        XMLOutputter outputter = new XMLOutputter();
        FileWriter writer = new FileWriter(gHistoryFile);
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    public boolean addChatHistory(String lMessage){
        Element element = new Element("Message");
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
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ; 
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 
    ******************************************************************************/
    public String getUserName(String lMessage){
        String[] lMsgTemp ;
        lMsgTemp = lMessage.split("\\|") ;
        return lMsgTemp[1] ;
    }
    /**
    * END FUNCTION 'getUserName'
    **/
}
