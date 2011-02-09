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
;  cCHAT_RoomHistoryFileManager
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to manage the file history chat message
;
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class cCHAT_RoomHistoryFileManager{
    private String curDir ;
    
    private ArrayList<String> files;
    private ArrayList<String> messages;
    
    private static Logger log = Red5LoggerFactory.getLogger( cCHAT_RoomHistoryFileManager.class, "bigbluebutton" );
    
    /*****************************************************************************
    ;  cCHAT_RoomHistoryFileManager
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of the cCHAT_RoomHistoryFileManager
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   dir    :   String, Directory of file
    ; 
    ; IMPLEMENTATION
    ;   initialize the directory
    ;   read file name from the directory
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010 
    ******************************************************************************/
    public cCHAT_RoomHistoryFileManager(String dir ){
        if ( null == dir ){
            log.debug ("ERROR INPUT PARAMETER dir");
        }
        
        files = new ArrayList<String>() ;
        if ( null == files ){
            log.debug ("ERROR INITIALIZE ArrayList File");
        }
        this.curDir = "/tmp/" + dir ;
        File tempDir = new File(this.curDir);
        if ( null == tempDir ){
            log.debug ("ERROR INITIALIZE tempDir File");
        }
        String[] fileName = tempDir.list();
        File f ;
        for( int i=0; i<fileName.length; i++ ){
            log.debug("File List {} ",fileName[i]);
            f = new File (this.curDir,fileName[i]) ;
            if ( true == f.isFile() ){
                files.add(fileName[i]);
            }
        }
    }/** END FUNCTION 'cCHAT_RoomHistoryFileManager' **/
       
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
            
            String msg ;
            
            File f = new File(this.curDir,fileName) ;
            if ( null == f ){
                return null ;
            }
            
            FileReader fr = new FileReader(f) ;
            if ( null == fr ){
                return null ;
            }
            
            BufferedReader br = new BufferedReader(fr);
            if ( null == br ){
                return null ;
            }
            
            messages=new ArrayList<String>() ;
            if ( null == messages ){
                return null ;
            }
        
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
    } /** END FUNCTION 'getFilesList' **/
    
}   /**
    * END CLASS 'cCHAT_RoomHistoryFileManager'
    **/