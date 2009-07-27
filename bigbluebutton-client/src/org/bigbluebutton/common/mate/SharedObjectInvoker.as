package org.bigbluebutton.common.mate
{
	import com.asfusion.mate.actionLists.IScope;
	import com.asfusion.mate.actions.AbstractServiceInvoker;
	import com.asfusion.mate.actions.IAction;
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.NetConnection;
	
	public class SharedObjectInvoker extends AbstractServiceInvoker implements IAction
	{
		public var SOName:String;
		public var url:String;
		public var message:Object;
		public var connection:NetConnection;
		
		private var soService:SharedObjectService;
		private var scope:IScope;
		
		private static const UPDATE_CLIENT:String = "updateClient";
		
		public function SharedObjectInvoker()
		{
			soService = new SharedObjectService();
			debug = true;
		}
		
		override protected function prepare(scope:IScope):void{
			super.prepare(scope);
			currentInstance = this;
			soService.connect(url, SOName, connection);
			//soService.addEventListener(SharedObjectEvent.SHARED_OBJECT_UPDATE_SUCCESS, onSOUpdate);
			
		}
		
		override protected function run(scope:IScope):void{
			innerHandlersDispatcher = soService;
			
			if (this.resultHandlers && resultHandlers.length > 0) {
				this.createInnerHandlers(scope, SharedObjectEvent.SHARED_OBJECT_UPDATE_SUCCESS, resultHandlers);
			}
			
			if (this.faultHandlers && faultHandlers.length > 0) {
				this.createInnerHandlers(scope, SharedObjectEvent.SHARED_OBJECT_UPDATE_FAILED, faultHandlers);
			}	
			soService.updateSharedObject(message);
		}

	}
}