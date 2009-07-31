package org.bigbluebutton.common.mate
{
	import com.asfusion.mate.actionLists.IScope;
	import com.asfusion.mate.actions.AbstractServiceInvoker;
	import com.asfusion.mate.actions.IAction;
	
	import flash.net.NetConnection;
	
	public class NetConnectionInvoker extends AbstractServiceInvoker implements IAction
	{
		private var ncService:NetConnectionService;
		public var url:String;
		public var serviceName:String;
		public var netConnection:NetConnection;
		
		public var arg1:Object;
		public var arg2:Object;
		
		public function NetConnectionInvoker()
		{
			ncService = new NetConnectionService();
		}
		
		override protected function prepare(scope:IScope):void{
			super.prepare(scope);
			currentInstance = this;
			ncService.connect(this.url, this.netConnection);
		}
		
		override protected function run(scope:IScope):void{
			innerHandlersDispatcher = ncService;
			
			if (this.resultHandlers && resultHandlers.length > 0){
				this.createInnerHandlers(scope, NetConnectionEvent.NET_CONNECTION_CALL_SUCCESS, resultHandlers);
			}
			
			if (this.faultHandlers && faultHandlers.length > 0){
				this.createInnerHandlers(scope, NetConnectionEvent.NET_CONNECTION_CALL_FAILED, faultHandlers);
			}
			
			ncService.callService(serviceName, arg1, arg2);
		}
	}
}