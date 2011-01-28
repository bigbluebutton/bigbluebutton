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

/*****************************************************************************
;  UserVO
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to record the chat message
;  
; HISTORY
; __date__ :        PTS:            Description
; 12-27-2010
******************************************************************************/
public class UserMessageRecorder{

    public String toUser ;
    public String username ;
    public boolean record ;
    public int suffix = 1  ;
    public String curFile ;
    private ArrayList<UserMessageRecorder> objUser = new ArrayList<UserMessageRecorder>() ;
    
    private static Logger log = Red5LoggerFactory.getLogger( UserMessageRecorder.class, "bigbluebutton" );
    
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
    public UserMessageRecorder getUserFromList(String userid){
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
            updateFileName(userid,"") ;
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
    public boolean getRecordStatusFromUser(String userid){
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
    ;  getCurrentFileFromUser
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
    public String getCurrentFileFromUser(String userid){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
            return null;
        }
        
        int i=0 ;
        String file = null ;
        for(i=0; i<objUser.size(); i++){
            if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                file = objUser.get(i).curFile ;
                break ;
            }
        }
        
        return file ;
    }/** END FUNCTION 'getCurrentFileFromUser' **/
    /*****************************************************************************
    ;  getUserList
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
    public ArrayList<UserMessageRecorder> getUserList(){
        return objUser ;
    }
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
    public boolean updateFileName(String userid,String fileName){
        if ( null == userid ){
            log.debug("Input parameter NULL" );
            return false ;
        }
        
        int i=0 ;
        for(i=0; i<objUser.size(); i++){
            if ( 0 == userid.compareTo(objUser.get(i).toUser ) ){
                if ( "" == fileName ){
                    objUser.get(i).suffix = objUser.get(i).suffix + 1 ;
                    objUser.get(i).curFile = objUser.get(i).username + "-" + objUser.get(i).suffix ;    
                }else{
                    objUser.get(i).suffix = objUser.get(i).suffix + 1 ;
                    objUser.get(i).curFile = fileName + "-" + userid + "-" + objUser.get(i).suffix ;    
                }
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
    public String getUserName(String message){
        String[] msgTemp ;
        msgTemp = message.split("\\|") ;
        return msgTemp[1] ;
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
    public String getMessage(String message){
        String[] msgTemp ;
        msgTemp = message.split("\\|") ;
        return msgTemp[0] ;
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
    public String getTime(String message){
        String[] msgTemp ;
        msgTemp = message.split("\\|") ;
        return msgTemp[3] ;
    }/** END FUNCTION 'getTime' **/
    
    /*****************************************************************************
    ;  getUserId
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the userid from message
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
    public String getUserId(String message){
        String[] msgTemp ;
        msgTemp = message.split("\\|") ;
        return msgTemp[5] ;
    }/** END FUNCTION 'getTime' **/
    
}/** END CLASS 'UserVO' **/
