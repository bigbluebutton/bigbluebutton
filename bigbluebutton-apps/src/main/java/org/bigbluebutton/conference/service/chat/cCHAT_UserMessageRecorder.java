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
public class cCHAT_UserMessageRecorder{

    public String toUser ;
    public String username ;
    public boolean record ;
    public String room ;
    public String externUserID ;
    public String curFile ;
    public int suffix = 0 ;
    
    private ArrayList<cCHAT_UserMessageRecorder> objUser = new ArrayList<cCHAT_UserMessageRecorder>() ;
    
    private static Logger log = Red5LoggerFactory.getLogger( cCHAT_UserMessageRecorder.class, "bigbluebutton" );
    
    /*****************************************************************************
    ;  addUserToList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to add user to the list
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   username    :   user name
    ;   record      :   record status
    ; 
    ; IMPLEMENTATION
    ;   initialize user object
    ;   add user information to objUser
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean addUserToList(String room, String userid, String username, boolean record,String externUserID){
        log.debug("Add User Entry" );
        if ( (null == userid) || (null == username) ){
            log.error("addUserToList ERROR INPUT PARAMETER ");
            return false;
        }
        
        boolean success = false ;
        cCHAT_UserMessageRecorder user = new cCHAT_UserMessageRecorder() ;
        if ( null == user ){
            log.error("addUserToList Initialize user Failed" );
            return false ;
        }
        if ( null == objUser ){
            log.error("addUserToList Initialize objUser Failed" );
            return false ;
        }

        log.info("addUserToList userid : " + userid + 
                 " username : " + username + " record : " + record +
                 " room : " + room + " externUserID : " + externUserID ) ;
                 
        if ( false == isUserExist(userid) ){
            user.toUser = userid ;
            user.username = username ;
            user.record = record ;
            user.suffix = 0 ;
            user.externUserID = externUserID ;
            user.curFile = user.username + "-" + user.suffix ;
            user.room = room ;
            success = objUser.add(user) ;
        }else{
            success = true ;
        }
        
        return success ;
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
    ;  get user information from objUser
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public cCHAT_UserMessageRecorder getUserFromList(String userid){
        if ( null == userid ){
            log.error("getUserFromList ERROR INPUT PARAMETER" );
            return null;
        }
        
        cCHAT_UserMessageRecorder user = null ;
        
        int i=0 ;
        
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if ( 0 == userid.compareTo(objUser.get(i).toUser) ){
                    user = objUser.get(i) ;
                    break ;
                }
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
    ;   assign recording status to a user in objUser
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public void setRecordStatusToUser(String userid,boolean record){
    
        if ( null == userid ){
            log.error("setRecordStatusToUser ERROR INPUT PARAMETER" );
            return ;
        }
      
        int i=0 ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if ( 0 == userid.compareTo(objUser.get(i).toUser) ){
                    objUser.get(i).record = record ;
                    break ;
                }
            }
        }
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
    ;   get the recording of a user from objUser  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean getRecordStatusFromUser(String userid){
        
        if ( null == userid ){
            log.error("getRecordStatusFromUser ERROR INPUT PARAMETER" );
            return false;
        }
        
        int i=0 ;
        boolean record = false ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                    record = objUser.get(i).record ;
                    break ;
                }
            }
        }
        
        return record ;
    }/** END FUNCTION 'getRecordStatusFromUser' **/
    /*****************************************************************************
    ;  getCurrentRoomFromUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get record status to user
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  get the current recording file from a user in objUser
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public String getCurrentRoomFromUser(String userid){
        if ( null == userid ){
            log.error("getCurrentRoomFromUser ERROR INPUT PARAMETER" );
            return null;
        }
        
        int i=0 ;
        String room = null ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                    room = objUser.get(i).room ;
                    break ;
                }
            }
        }
        
        log.info("getCurrentRoomFromUser room : " + room );
        return room ;
    }/** END FUNCTION 'getCurrentRoomFromUser' **/
    
    /*****************************************************************************
    ;  getExternUserID
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get record status to user
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  get the current recording file from a user in objUser
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public String getExternUserID(String userid){
        if ( null == userid ){
            log.error("getExternUserID ERROR INPUT PARAMETER" );
            return null;
        }
        
        int i=0 ;
        String externUserId = null ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                    externUserId = objUser.get(i).externUserID ;
                    break ;
                }
            }
        }
        
        log.info("getExternUserID externUserId : " + externUserId );
        return externUserId ;
    }/** END FUNCTION 'getExternUserID' **/
    
    /*****************************************************************************
    ;  getCurrentFileFromUser
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get record status to user
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  get the current recording file from a user in objUser
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public String getCurrentFileFromUser(String userid){
        if ( null == userid ){
            log.error("getCurrentFileFromUser ERROR INPUT PARAMETER" );
            return null;
        }
        
        int i=0 ;
        String file = null ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                    file = objUser.get(i).curFile ;
                    break ;
                }
            }
        }
        
        return file ;
    }/** END FUNCTION 'getCurrentFileFromUser' **/
    /*****************************************************************************
    ;  getUserList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to update the saved file name
    ; RETURNS : ArrayList
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   N/A
    ; 
    ; IMPLEMENTATION
    ;  get the list of user
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public ArrayList<cCHAT_UserMessageRecorder> getUserList(){
        return objUser ;
    }
    /*****************************************************************************
    ;  updateFileName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to update the saved file name
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ;   fileName    :   name of file
    ; 
    ; IMPLEMENTATION
    ;   update the current file name of a user  
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean updateFileName(String userid,String fileName){
        if ( null == userid ){
            log.error("updateFileName Input parameter NULL" );
            return false ;
        }
        
        int i=0 ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if ( 0 == userid.compareTo(objUser.get(i).toUser ) ){
                    objUser.get(i).suffix = objUser.get(i).suffix + 1 ;
                    if ( "" == fileName ){                   
                        objUser.get(i).curFile = objUser.get(i).username + "-" + objUser.get(i).suffix ;    
                    }else{
                        objUser.get(i).curFile = fileName + objUser.get(i).username + "-" + userid + "-" + objUser.get(i).suffix ;    
                    }
                    break ;
                }
            }
        }
        
        return true ;
    }/** END FUNCTION 'updateFileName' **/
    
    /*****************************************************************************
    ;  isUserExist
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check whether user is already exist in the list
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   userid      :   id of user
    ; 
    ; IMPLEMENTATION
    ;  check whether user exists in the list or not
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 01-16-2011
    ******************************************************************************/
    public boolean isUserExist(String userid){
    
        if ( null == userid ){
            log.error("isUserExist ERROR INPUT PARAMETER" );
            return false ;
        }
        
        int i=0 ;
        boolean exist = false ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                    exist = true ;
                    break ;
                }
            }
        }
        
        return exist ;
    }/** END FUNCTION 'isUserExist' **/
    
    /*****************************************************************************
    ;  removeUserFromList
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to remove user from the list
    ; RETURNS : boolean
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
    public boolean removeUserFromList(String userid){
        
        if ( null == userid ){
            log.error("removeUserFromList ERROR INPUT PARAMETER" );
            return false ;
        }
        
        int i=0 ;
        if ( null != objUser ){
            for(i=0; i<objUser.size(); i++){
                if (  0 == userid.compareTo(objUser.get(i).toUser ) ){
                    objUser.remove(i) ;
                    break ;
                }
            }
        }
        return true ;
    }/** END FUNCTION 'removeUserFromList' **/
    
    /*****************************************************************************
    ;  getUserName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ; this routine is used to get the user name from message
    ;
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message : String 
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
    ; this routine is used to get the message from message
    ;
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message : String 
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
    ; this routine is used to get the time from message
    ;
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message : String 
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
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   message : String 
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
    }/** END FUNCTION 'getUserId' **/
    
}/** END CLASS 'cCHAT_UserMessageRecorder' **/
