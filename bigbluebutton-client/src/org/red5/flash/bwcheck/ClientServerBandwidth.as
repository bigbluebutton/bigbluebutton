package org.red5.flash.bwcheck
{
	
	import flash.net.Responder;
	
	public class ClientServerBandwidth extends BandwidthDetection
	{
		
		private var res:Responder;
		private var payload:Array = new Array();
		
		private var latency:int = 0;
		private var cumLatency:int = 1;
		private var bwTime:int = 0;
		private var count:int = 0;
		private var sent:int = 0;
		private var kbitUp:int = 0;
		private var KBytes:int = 0;
		private var deltaUp:int = 0;
		private var deltaTime:int = 0;
		private var overhead:int = 0;
		private var pakInterval:int = 0;
		private var timePassed:int = 0;
		private var now:int = 0;
		
		private var pakSent:Array = new Array();
		private var pakRecv:Array = new Array();
		private var beginningValues:Object = {};
		private var info:Object = new Object();
		
		private var _service:String;
		
		public function ClientServerBandwidth()
		{
			for (var i:int = 0; i < 1200; i++){
				payload[i] = Math.random();	//16K approx
			}
			
			res = new Responder(onResult, onStatus);
			
			
		}
		
		public function set service(service:String):void
		{
			_service = service;
		}
		
		public function start():void
		{
			nc.client = this;
			var obj:Array = new Array();
			nc.call(_service, res);
		}
		
		private function onResult(obj:Object):void
		{
			this.now = (new Date()).getTime()/1;
			if(sent == 0) {
				this.beginningValues = obj;
				this.beginningValues.time = now;
				this.pakSent[sent++] = now;
				nc.call(_service, res, now);
			} else {
				this.pakRecv[this.count] = now;
				this.pakInterval = (this.pakRecv[this.count] - this.pakSent[this.count])*1;
				this.count++;
				this.timePassed = (now - this.beginningValues.time);
				
				if (this.count == 1) {
					this.latency = Math.min(timePassed, 800);
					this.latency = Math.max(this.latency, 10);
					this.overhead = obj.cOutBytes - this.beginningValues.cOutBytes;
					
					this.pakSent[sent++] = now;
					nc.call(_service, res, now, payload);
					dispatchStatus(info);
					
				}
				// If we have a hi-speed network with low latency send more to determine
				// better bandwidth numbers, send no more than 6 packets
				if ( (this.count >= 1) && (timePassed<1000))
				{
					this.pakSent[sent++] = now;
					this.cumLatency++;
					nc.call(_service, res, now, payload);
					dispatchStatus(info);
				} else if ( this.sent == this.count ) {	
					// See if we need to normalize latency
					if ( this.latency >= 100 )
					{ // make sure we detect sattelite and modem correctly
						if (  this.pakRecv[1] - this.pakRecv[0] > 1000 )
						{
							this.latency = 100;
						}
					}
					payload = new Array();
					// Got back responses for all the packets compute the bandwidth.
					var stats:Object = obj;
					deltaUp = (stats.cOutBytes - this.beginningValues.cOutBytes)*8/1000;
					deltaTime = ((now - this.beginningValues.time) - (this.latency * this.cumLatency) )/1000;
					if ( deltaTime <= 0 )
						deltaTime = (now - this.beginningValues.time)/1000;
					
					kbitUp = Math.round(deltaUp/deltaTime);
					KBytes = (stats.cOutBytes - this.beginningValues.cOutBytes)/1024;
					
					var info:Object = new Object();
					info.kbitUp = kbitUp;
					info.deltaUp = deltaUp;
					info.deltaTime = deltaTime;
					info.latency = latency;
					info.KBytes = KBytes;
					
					dispatchComplete(info);
				}
			}
		}
		
		override protected function dispatchStatus(obj:Object):void
		{
			obj.count = this.count;
			obj.sent = this.sent;
			obj.timePassed = timePassed;
			obj.latency = this.latency;
			obj.overhead = this.overhead;
			obj.pakInterval = this.pakInterval;
			obj.cumLatency = this.cumLatency;

			super.dispatchStatus(info);	
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
