package org.bigbluebutton.modules.chat.model.business
{
	import flash.events.SyncEvent;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.chat.model.vo.MessageObject;
	import org.bigbluebutton.modules.chat.model.vo.MessageVO;
	
	public class PlaybackProxy extends ChatProxy
	{
		public function PlaybackProxy(messageVO:MessageVO, nc:NetConnection = null)
		{
			super(messageVO, nc);
		}
		
		override public function connectionSuccess():void{}
		
		override public function connectionFailed(message:String):void{}
		
		override public function join(userid:String, host:String, room:String):void{}
		
		override public function leave():void{}
		
		override public function get messageVO():MessageVO{
			return null;
		}
		
		override public function handleDisconnection(e:ConnectionEvent):void{}
		
		override public function sharedObjectSyncHandler(e:SyncEvent):void{}
		
		override public function sendMessageToSharedObject(message:MessageObject):void{

		}
		
		/**
		 * This is the only method in the chat proxy the playback is interested in 
		 * @param userid - The name of the person sending the message
		 * @param message - The message
		 * @param color - The color of the text
		 * 
		 */		
		override public function receiveNewMessage(userid:String, message:String, color:uint):void{
			var m:MessageObject = new MessageObject(message, color);
			m.setUserid(userid);
			this.messageVO.message = m;
			sendNotification(ChatFacade.NEW_MESSAGE, m);
		}
		
		override public function getSharedObject():SharedObject{
			return null;
		}
		
		override public function setChatLog(messages:String):void{}

	}
}