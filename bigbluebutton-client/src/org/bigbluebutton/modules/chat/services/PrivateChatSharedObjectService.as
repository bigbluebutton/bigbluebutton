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
package org.bigbluebutton.modules.chat.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.IEventDispatcher;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
    import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.main.events.ParticipantJoinEvent;
	import org.bigbluebutton.main.model.User;
	import org.bigbluebutton.modules.chat.events.PrivateChatMessageEvent;
    import org.bigbluebutton.modules.chat.model.MessageVO;
	import org.bigbluebutton.common.LogUtil;
    import mx.controls.Alert ;
    
    import org.bigbluebutton.modules.chat.events.cCHAT_RecordPrivateMessageEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_HistoryFileListEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_HistoryCommandEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_ButtonEvent;
    import org.bigbluebutton.modules.chat.events.cCHAT_AddRecordUserEvent;
	

	public class PrivateChatSharedObjectService
	{
		public static const NAME:String = "PrivateChatSharedObjectService";
		
		private var chatSO:SharedObject;
		private var connection:NetConnection;
		private var dispatcher:IEventDispatcher;
		
		private var privateResponder:Responder;
		private var participantsResponder:Responder;  
		// This participant's userid
		private var userid:String;
		
		public function PrivateChatSharedObjectService(connection:NetConnection, dispatcher:IEventDispatcher)
		{			
        
            LogUtil.debug("Call PrivateChatSharedObjectService Constructor ...");
			this.connection = connection;
			this.dispatcher = dispatcher;		
			
			privateResponder = new Responder(
				function(result:Object):void{
					LogUtil.debug("Successfully called chat server private message");
				},
				function(status:Object):void{
					LogUtil.error("Error while trying to call privateMessage on server");
				}
			);

			participantsResponder = new Responder(
	        	// participants - On successful result
				function(result:Object):void { 
					trace("Successfully queried participants: " + result.count); 
					if (result.count > 0) {
						for(var p:Object in result.participants) 
						{
							participantJoined(result.participants[p]);
						}							
					}	
				},	
				// status - On error occurred
				function(status:Object):void { 
					trace("Error occurred:"); 
					for (var x:Object in status) { 
						LogUtil.error(x + " : " + status[x]); 
					} 
					trace("Error in participantsResponder call");
				}
			);				
		}
						
	    public function join(userid:String, uri:String):void
		{
        
            LogUtil.debug("Call join ... userid " + userid + " uri " + uri );
		
            this.userid = userid;
			chatSO = SharedObject.getRemote(userid, uri, false);
			chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			chatSO.client = this;
			chatSO.connect(connection);	
						
		}
		
	    public function leave():void
	    {
            LogUtil.debug("Call leave ...");
	    	if (chatSO != null) {
	    		chatSO.close();
	    	}
	    }
		
		public function sendMessage(message:MessageVO):void{
            
            LogUtil.debug("Call sendMessage ... message : " + message);
			connection.call("chat.privateMessage", privateResponder, message.message, message.sender , message.recepient);
			
			sendMessageToSelf(message);
            
		}
		
		private function sendMessageToSelf(message:MessageVO):void {
            LogUtil.debug("Call sendMessageToSelf ... message : " + message );
			messageReceived(message.recepient, message.message);
		}
		
		public function messageReceived(from:String, message:String):void {
            
            LogUtil.debug("Call messageReceived ... from : " + from + " message " + message );
			var event:PrivateChatMessageEvent = new PrivateChatMessageEvent(PrivateChatMessageEvent.PRIVATE_CHAT_MESSAGE_EVENT);
			event.message = new MessageVO(message, from, userid);
			trace("Sending private message " + message);
			var globalDispatcher:Dispatcher = new Dispatcher();
			globalDispatcher.dispatchEvent(event);	 
            recordChatMessage(from,message);
            
		}
        
		private function sharedObjectSyncHandler(event:SyncEvent) : void
		{	
			trace("Connection to private shared object successful.");
		}

		public function participantJoined(joinedUser:Object):void { 
        
            LogUtil.debug("Call participantJoined ... userid : " + joinedUser.userid + " username : " + joinedUser.name);
			var participant:User = new User();
			participant.userid = joinedUser.userid;
			participant.name = joinedUser.name;
			trace("ParticipantJoined " + joinedUser.name + "[" + joinedUser.userid + "]");
			
			if (joinedUser.userid == userid) return;
			
			var globalDispatcher:Dispatcher = new Dispatcher();
			var joinEvent:ParticipantJoinEvent = new ParticipantJoinEvent(ParticipantJoinEvent.PARTICIPANT_JOINED_EVENT);
			joinEvent.participant = participant;
			joinEvent.join = true;
			globalDispatcher.dispatchEvent(joinEvent);
		}
		
		public function queryForParticipants():void {
			trace("Querying for participants.");
			connection.call("participants.getParticipants",participantsResponder);
		}
        
        /*****************************************************************************
        ;  recordChatMessage
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to record private chat
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   from :  String
        ;   message : String
        ;
        ; IMPLEMENTATION
        ;  call recordChatMessage via SO to record message
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 16-01-2010
        ******************************************************************************/  
        private function recordChatMessage(from:String,message:String):void{
            LogUtil.debug("Call recordChatMessage ... from : " + from + " to : " + this.userid + " message : " + message );
            connection.call("chat.recordChatMessage", new Responder(
                        function(result:Object):void{
                            LogUtil.debug("Successfully called chat server private message");
                            LogUtil.debug("Error Message ..." + String(result) );
                        },
                        function(status:Object):void{
                            LogUtil.error("Error while trying to call privateMessage on server");
                        }
                    ), 
                this.userid,
                from,
                message
            ) ;
        }//** END FUNCTION 'recordChatMessage' **/
        
        /*****************************************************************************
        ;  recordMessageEvent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to handle the record event
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_RecordPrivateMessageEvent
        ;
        ; IMPLEMENTATION
        ;  set record message event status to server
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 16-01-2010
        ******************************************************************************/ 
        public function recordMessageEvent(e:cCHAT_RecordPrivateMessageEvent,username:String):void{
            
            LogUtil.debug("Call recordMessageEvent ... userid : " + e.receiver + " record : " + e.isRecording );
            
            connection.call("chat.setPrivateRecordStatus", new Responder(
                        function(result:Object):void{
                            LogUtil.debug("Successfully called chat server private message");
                        },
                        function(status:Object):void{
                            LogUtil.error("Error while trying to call privateMessage on server");
                        }
                    ), 
                e.receiver,
                e.isRecording
            ) ;
        }//** END FUNCTION 'recordMessageEvent' **/
        
        /*****************************************************************************
        ;  addUserToList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to add record user to list
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_AddRecordUserEvent
        ;
        ; IMPLEMENTATION
        ;  add user to list on server via SO
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 16-01-2010
        ******************************************************************************/
        public function addUserToList(e:cCHAT_AddRecordUserEvent,externUserId:String):void{
            LogUtil.debug("Call addUserToList ... userid : " + e.userid + " username : " + e.username + " record : " + e.record );
            connection.call("chat.addUserToList", new Responder(
                        function(result:Object):void{
                            LogUtil.debug("Successfully called chat server private message");
                        },
                        function(status:Object):void{
                            LogUtil.error("Error while trying to call privateMessage on server");
                        }
                    ), 
                e.userid,
                e.username,
                e.record  ,
                externUserId
            )
        }//** END FUNCTION 'addUserToList' **/
        
        /*****************************************************************************
        ;  removeUserFromList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to remove user from the list
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_AddRecordUserEvent
        ;
        ; IMPLEMENTATION
        ;  remove user from user list via SO
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 16-01-2010
        ******************************************************************************/
        public function removeUserFromList(e:cCHAT_AddRecordUserEvent):void{
            LogUtil.debug("Call removeUserFromList ... userid : " + e.userid );
            connection.call("chat.removeUserFromList", new Responder(
                        function(result:Object):void{
                            LogUtil.debug("Successfully called chat server private message");
                        },
                        function(status:Object):void{
                            LogUtil.error("Error while trying to call privateMessage on server");
                        }
                    ), 
                e.userid
            )
        }//** END FUNCTION 'removeUserFromList' **/
        
        /*****************************************************************************
        ;  loadFileList
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to load the file list from server
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_HistoryFileListEvent
        ;
        ; IMPLEMENTATION
        ;  load file list from server via SO
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 16-01-2010
        ******************************************************************************/
        public function loadFileList(e:cCHAT_HistoryFileListEvent,exterUserId:String):void{
        
            LogUtil.debug("Call loadFileList ... userid : " + e.sender );
            connection.call("chat.getPrivateFileList", new Responder(
                        function(result:Object):void{
                            LogUtil.debug("Successfully called chat server private message");
                            if (result != null) {
                                
                                var event:cCHAT_HistoryFileListEvent = new cCHAT_HistoryFileListEvent(cCHAT_HistoryFileListEvent.DISPLAY_FILE_LIST);
                                event.fileList = result ;
                            
                                var globalDispatcher:Dispatcher = new Dispatcher();
                                globalDispatcher.dispatchEvent(event) ;
                            
                            
                            };
                        },
                        function(status:Object):void{
                            LogUtil.error("Error while trying to call privateMessage on server");
                        }
                    ), 
                e.sender
            )
        }//** END FUNCTION 'loadFileList' **/
        
        /*****************************************************************************
        ;  loadFileContent
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to load the file content from server
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   e: cCHAT_HistoryFileListEvent
        ;
        ; IMPLEMENTATION
        ;  load file content from server via SO
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 16-01-2010
        ******************************************************************************/
        public function loadFileContent(e:cCHAT_HistoryCommandEvent,exterUserId:String):void{
            LogUtil.debug("Call loadFileContent ... userid : " + e.userid + " fileName : " + e.fileName);
            connection.call("chat.getPrivateChatMessages", new Responder(
                        function(result:Object):void{
                            LogUtil.debug("Successfully called chat server private message");
                            if (result != null) {
                                var event:cCHAT_HistoryCommandEvent = new cCHAT_HistoryCommandEvent(cCHAT_HistoryCommandEvent.SAVE_FILE);
                                event.message = result;
                                event.fileName = e.fileName ;
			
                                var globalDispatcher:Dispatcher = new Dispatcher();
                                globalDispatcher.dispatchEvent(event);	   			
                            }
                        },
                        function(status:Object):void{
                            LogUtil.error("Error while trying to call privateMessage on server");
                        }
                    ), 
                e.userid,
                e.fileName
                
            )
        }//** END FUNCTION 'loadFileContent' **/
	}
}