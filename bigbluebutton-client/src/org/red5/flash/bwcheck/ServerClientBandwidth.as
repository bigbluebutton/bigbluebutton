package org.red5.flash.bwcheck
{
	import flash.net.Responder;
	
	public class ServerClientBandwidth extends BandwidthDetection
	{
		
		private var _service:String;
		private var info:Object = new Object();
		private var res:Responder;
		
		public function ServerClientBandwidth()
		{
			res = new Responder(onResult, onStatus);
		}

		public function onBWCheck(obj:Object):void
		{
				dispatchStatus(obj);
		}
			
		public function onBWDone(obj:Object):void 
		{ 
			dispatchComplete(obj);
		} 
		
		public function set service(service:String):void
		{
			_service = service;
		}
		
		public function start():void
		{
			nc.client = this;
			nc.call(_service,res);
		}
		
		private function onResult(obj:Object):void
		{
			dispatchStatus(obj);
				
		}
		
		private function onStatus(obj:Object):void
		{
			switch (obj.code)
			{
				case "NetConnection.Call.Failed":
					dispatchFailed(obj);
				break;
			}

		}
	}
}
