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

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import java.util.ArrayList;

import java.io.File;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Iterator;
import java.util.List;

/*****************************************************************************
;  ChatRoomHistoryFileManager
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to manage the file history chat message
;
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class ChatRoomHistoryFileManager{
    private String gDir ;
    private File gHistoryFile ;   
    
    private ArrayList<String> files;
    private ArrayList<String> messages;
    
    private static Logger log = Red5LoggerFactory.getLogger( ChatRoomHistoryFileManager.class, "bigbluebutton" );
    
    /*****************************************************************************
    ;  ChatRoomHistoryFileManager
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of the ChatRoomHistoryFileManager
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   lDir    :   String, Directory of file
    ; 
    ; IMPLEMENTATION
    ;   initialize the directory
    ;   read file name from the directory
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    public ChatRoomHistoryFileManager(String lDir ){
        if ( null == lDir ){
            log.debug ("ERROR INPUT PARAMETER lDir");
        }
        
        files = new ArrayList<String>() ;
        if ( null == files ){
            log.debug ("ERROR INITIALIZE ArrayList File");
        }
        this.gDir = "/tmp/" + lDir ;
        File tempDir = new File(this.gDir);
        if ( null == tempDir ){
            log.debug ("ERROR INITIALIZE tempDir File");
        }
        String[] fileName = tempDir.list();
        File f ;
        for( int i=0; i<fileName.length; i++ ){
            log.debug("File List {} ",fileName[i]);
            f = new File (this.gDir,fileName[i]) ;
            if ( true == f.isFile() ){
                files.add(fileName[i]);
            }
        }
    }/** END FUNCTION 'ChatRoomHistoryFileManager' **/
       
    /*****************************************************************************
    ;  getHistoryFileContent
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to load the content from an xml file
    ;
    ; RETURNS : ArrayList
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   fileName    :   String, name of file
    ; 
    ; IMPLEMENTATION
    ;  initialize builder to build the xml file content from the file name
    ;  load the xml content to gXmlDoc
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    public ArrayList<String> getHistoryFileContent(String fileName){
    
        if ( null == fileName ){
            log.debug("Error: input parameter");
            return null ;
        }
        try{
            BufferedReader br = new BufferedReader(new FileReader(new File(this.gDir,fileName)));
            messages=new ArrayList<String>() ;
        
            String msg ;
        
            while( null != (msg = br.readLine())  ){
                messages.add(msg);
            }
            br.close();
            
        }catch(IOException e){
            log.debug("Error: {}",e.getMessage());
        }
        return messages ;
    }/** END FUNCTION 'getHistoryFileContent' **/
        
    /*****************************************************************************
    ;  getFilesList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get the file list from a room
    ;
    ; RETURNS : ArrayList
    ;
    ; INTERFACE NOTES
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  return file list
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010
    ******************************************************************************/
    public ArrayList<String> getFilesList(){
        return files ;
    } /** END FUNCTION 'saveHistoryFile' **/
    
}   /**
    * END CLASS 'ChatRoomHistoryFileManager'
    **/