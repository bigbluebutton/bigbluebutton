package org.bigbluebutton.lib.common.models {
	
	public interface IMessageListener {
		function onMessage(messageName:String, message:Object):void;
	}
}
