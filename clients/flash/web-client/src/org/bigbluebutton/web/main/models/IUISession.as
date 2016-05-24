package org.bigbluebutton.web.main.models {
	import org.bigbluebutton.web.chat.models.ChatRoomVO;
	import org.osflash.signals.Signal;
	
	public interface IUISession {
		function get loading():Boolean;
		function get loadingMessage():String;
		function get loadingChangeSignal():Signal;
		function setLoading(val:Boolean, message:String):void;
		function get participantsOpen():Boolean;
		function set participantsOpen(val:Boolean):void;
		function get participantsOpenSignal():Signal;
		function get chatInfo():ChatRoomVO;
		function set chatInfo(info:ChatRoomVO):void;
		function get chatInfoSignal():Signal
	}
}
