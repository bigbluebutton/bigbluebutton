package tests.util
{
	import flash.net.NetConnection;
	import flash.net.Responder;
	
	public class NetConnectionStub extends NetConnection
	{
		public function NetConnectionStub()
		{
			super();
		}
		
		override public function call(command:String, responder:Responder, ...parameters):void{
			
		}
		
		override public function addEventListener(type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false):void{
			
		}
		
		override public function connect(command:String, ...parameters):void{
			
		}
		
		override public function close():void{
			
		}
	}
}