package org.bigbluebutton.lib.common.services {
	import org.bigbluebutton.lib.common.models.IMessageListener;
	
	public interface IDefaultConnectionCallback {
		function onBWCheck(... rest):Number
		function onBWDone(... rest):void
		function onMessageFromServer(messageName:String, result:Object):void
		function addMessageListener(listener:IMessageListener):void
		function removeMessageListener(listener:IMessageListener):void
		function clearMessageListeners():void;
	}
}
