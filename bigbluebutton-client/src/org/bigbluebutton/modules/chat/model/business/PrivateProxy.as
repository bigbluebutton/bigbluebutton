package org.bigbluebutton.modules.chat.model.business
{
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.bigbluebutton.modules.chat.ChatModuleConstants;
	import org.bigbluebutton.modules.chat.model.MessageVO;
	import org.bigbluebutton.modules.chat.view.ChatBoxMediator;
	import org.bigbluebutton.modules.chat.view.components.ChatBox;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class PrivateProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "PrivateProxy";
		
		private var _module:ChatModule;
		
		private var nc:NetConnection;
		private var chatSO:SharedObject;
		private var participantsSO:SharedObject;
		private var privateResponder:Responder;
		private var participantsResponder:Responder;
		
		public function PrivateProxy(module:ChatModule)
		{
			super(NAME);
			this._module = module;
			
			nc = _module.connection;
			
			chatSO = SharedObject.getRemote(_module.username, _module.uri, false);
			chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			chatSO.client = this;
			chatSO.connect(nc);
			
			//participantsSO = SharedObject.getRemote("participantsSO", _module.uri, false);
			//participantsSO.client = this;
			//participantsSO.connect(nc);
			
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
						LogUtil.debug("Successfully queried participants: " + result.count); 
						if (result.count > 0) {
							for(var p:Object in result.participants) 
							{
								participantJoined(result.participants[p]);
							}							
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
							} 
						LogUtil.error("Error in participantsResponder call");
					}
				)
				
				queryForParticipants();
		}
		
		private function onConnectionSuccess(e:ConnectionEvent):void{
			
		}
		
		private function onConnectionFailed(e:ConnectionEvent):void{
			Alert.show("connection failed to " + _module.uri + " with message " + e.toString());
		}
		
		private function onConnectionRejected(e:ConnectionEvent):void{
			Alert.show("connection rejected to " + _module.uri + " with message " + e.toString());
		}
		
		private function sharedObjectSyncHandler(e:SyncEvent):void{
			
		}
		
		public function sendMessage(message:MessageVO):void{
			nc.call("chat.privateMessage", privateResponder, message.message, message.sender , message.recepient);
		}
		
		public function messageReceived(from:String, message:String):void{
			sendNotification(ChatModuleConstants.NEW_PRIVATE_MESSAGE, new MessageVO(message, from, _module.username));
		}
		
		public function participantJoined(joinedUser:Object):void { 
			//Alert.show("new participant joined");
			var userName:String = joinedUser.name;
			var userid:String = joinedUser.userid;
			var userRole:String = joinedUser.userRole;						
			
			LogUtil.info("Joined as [" + userid + "," + userName + "," + userRole + "]");
			sendNotification(ChatModuleConstants.ADD_PARTICIPANT, userName);
		}
		
		private function queryForParticipants():void {
			nc.call("participants.getParticipants",participantsResponder);
		}

	}
}