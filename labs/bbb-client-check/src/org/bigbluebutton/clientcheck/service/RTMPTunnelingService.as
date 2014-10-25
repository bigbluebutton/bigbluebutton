package org.bigbluebutton.clientcheck.service
{
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.NetConnection;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.test.RTMPAppTest;

	public class RTMPTunnelingService implements IRTMPTunnelingService
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		private var _netConnection:NetConnection;

		private static var USER_NAME_MOCK:String="Test User";
		private static var ROLE_MOCK:String="MODERATOR";
		private static var ROOM_MOCK:String="room-mock-default";
		private static var VOICE_BRIDGE_MOCK:String="85115";
		private static var RECORD_MOCK:Boolean=false;
		private static var EXTERNAL_USER_ID_MOCK:String="123456";
		private static var INTERNAL_USER_ID_MOCK:String="654321";
		private static var LOCK_ON_MOCK:Boolean=true;

		public function init():void
		{
			for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
			{
				_netConnection=new NetConnection();
				_netConnection.client={};
				_netConnection.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
				_netConnection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, netASyncError);
				_netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, netSecurityError);
				_netConnection.addEventListener(IOErrorEvent.IO_ERROR, netIOError);

				if (systemConfiguration.rtmpApps[i].applicationUri)
				{
					try
					{
						// sip has a different way of connecting to the red5 server, need to fake connection data.
						if (systemConfiguration.rtmpApps[i].applicationUri.indexOf("sip") > 0)
						{
							_netConnection.connect(systemConfiguration.rtmpApps[i].applicationUri, EXTERNAL_USER_ID_MOCK, USER_NAME_MOCK);
							continue;
						}
						else
						{
							// need to fake connection data
							_netConnection.connect(systemConfiguration.rtmpApps[i].applicationUri, USER_NAME_MOCK, ROLE_MOCK, ROOM_MOCK, VOICE_BRIDGE_MOCK, RECORD_MOCK, EXTERNAL_USER_ID_MOCK, INTERNAL_USER_ID_MOCK, LOCK_ON_MOCK);
						}
					}
					catch (error:Error)
					{
						// TODO: create a popup window here to notify user that error occured
					}
				}
			}
		}

		private function notifyErrorOccured(event:Event):void
		{
			var rtmpAppItem:RTMPAppTest=getRTMPAppItemByURI(event.currentTarget.uri);

			if (rtmpAppItem)
			{
				if (event is IOErrorEvent)
				{
					rtmpAppItem.testResult="IOError";
				}
				else if (event is SecurityErrorEvent)
				{
					rtmpAppItem.testResult="SecurityError";
				}
				else if (event is AsyncErrorEvent)
				{
					rtmpAppItem.testResult="AsyncError";
				}

				rtmpAppItem.testSuccessfull=false;
			}
		}

		private function getRTMPAppItemByURI(applicationURI:String):RTMPAppTest
		{
			for (var i:int=0; i < systemConfiguration.rtmpApps.length; i++)
			{
				if (systemConfiguration.rtmpApps[i].applicationUri == applicationURI)
					return systemConfiguration.rtmpApps[i];
			}
			return null;
		}

		protected function netStatus(event:NetStatusEvent):void
		{
			var info:Object=event.info;
			var statusCode:String=info.code;
			var rtmpAppItem:RTMPAppTest=getRTMPAppItemByURI(event.currentTarget.uri);

			if (rtmpAppItem)
			{
				rtmpAppItem.testResult=statusCode;

				switch (statusCode)
				{
					case "NetConnection.Connect.Success":
						rtmpAppItem.testSuccessfull=true;
						break;

					default:
						rtmpAppItem.testSuccessfull=false;
						break;
				}
			}
			else
			{
				trace("Coudn't find rtmp app by applicationUri, skipping item: " + event.currentTarget.uri);
			}
		}

		protected function netIOError(event:IOErrorEvent):void
		{
			notifyErrorOccured(event);
		}

		protected function netSecurityError(event:SecurityErrorEvent):void
		{
			notifyErrorOccured(event);
		}

		protected function netASyncError(event:AsyncErrorEvent):void
		{
			notifyErrorOccured(event);
		}
	}
}
