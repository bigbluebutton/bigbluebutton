package org.bigbluebutton.modules.presentation
{
	import mx.rpc.IResponder;
	
	public class MockResponder implements IResponder
	{
		public var receivedFault:Boolean = false;
		public var receivedResult:Boolean = false;
		
		public function MockResponder()
		{
		}
		
		public function fault(info:Object):void{
			this.receivedFault = true;
		}
		
		public function result(event:Object):void{
			this.receivedResult = true;	
		}

	}
}