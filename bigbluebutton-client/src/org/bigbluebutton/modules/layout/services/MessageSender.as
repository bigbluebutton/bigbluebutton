package org.bigbluebutton.modules.layout.services {
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.connection.messages.layout.BroadcastLayoutMsg;
	import org.bigbluebutton.core.connection.messages.layout.BroadcastLayoutMsgBody;
	import org.bigbluebutton.core.connection.messages.layout.GetCurrentLayoutMsg;
	import org.bigbluebutton.core.connection.messages.layout.GetCurrentLayoutMsgBody;
	import org.bigbluebutton.core.connection.messages.layout.LockLayoutMsg;
	import org.bigbluebutton.core.connection.messages.layout.LockLayoutMsgBody;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.modules.layout.model.LayoutDefinition;

	public class MessageSender {
		private static const LOGGER:ILogger = getClassLogger(MessageSender);

		public function getCurrentLayout():void {
			var body:GetCurrentLayoutMsgBody = new GetCurrentLayoutMsgBody(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID());
			var message:GetCurrentLayoutMsg = new GetCurrentLayoutMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured requesting current layout.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

		public function broadcastLayout(layout:LayoutDefinition):void {
			var body:BroadcastLayoutMsgBody = new BroadcastLayoutMsgBody(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID(), layout.toXml().toXMLString());
			var message:BroadcastLayoutMsg = new BroadcastLayoutMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured broadcasting layout.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

		public function lockLayout(lock:Boolean, viewersOnly:Boolean, layout:LayoutDefinition = null):void {
			var body:LockLayoutMsgBody = new LockLayoutMsgBody(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID(), lock, viewersOnly, layout != null ? layout.toXml().toXMLString() : null);
			var message:LockLayoutMsg = new LockLayoutMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured locking layout.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}
	}
}
