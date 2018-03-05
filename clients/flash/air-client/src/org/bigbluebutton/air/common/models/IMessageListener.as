package org.bigbluebutton.air.common.models {
	
	public interface IMessageListener {
		function onMessage(messageName:String, message:Object):void;
	}
}
