package org.bigbluebutton.modules.layout.services {
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.connection.messages.layout.BroadcastLayoutMsg;
	import org.bigbluebutton.core.connection.messages.layout.BroadcastLayoutMsgBody;
	import org.bigbluebutton.core.connection.messages.layout.GetCurrentLayoutReqMsg;
	import org.bigbluebutton.core.connection.messages.layout.GetCurrentLayoutReqMsgBody;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.modules.layout.model.LayoutDefinition;

	public class MessageSender {
		private static const LOGGER:ILogger = getClassLogger(MessageSender);

		public function getCurrentLayout():void {
			var body:GetCurrentLayoutReqMsgBody = new GetCurrentLayoutReqMsgBody();
			var message:GetCurrentLayoutReqMsg = new GetCurrentLayoutReqMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_request_current_layout";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}

		public function broadcastLayout(layout:LayoutDefinition):void {
			var body:BroadcastLayoutMsgBody = new BroadcastLayoutMsgBody(layout.toXml().toXMLString());
			var message:BroadcastLayoutMsg = new BroadcastLayoutMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_broadcast_layout";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}
	}
}
