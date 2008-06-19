package org.bigbluebutton.modules.voiceconference
{
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	
	public class MockNetConnection extends NetConnection
	{
		public var connectionOpen:Boolean;
		
		public function MockNetConnection():void
		{
		}
		
		override public function close():void{
			this.connectionOpen = false;	
			dispatchEvent(new NetStatusEvent("Hello"));
		}
		
		override public function connect(command:String, ...parameters):void{
			this.connectionOpen = true;
		}

	}
}