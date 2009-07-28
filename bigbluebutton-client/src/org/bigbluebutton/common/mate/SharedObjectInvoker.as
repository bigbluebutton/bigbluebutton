package org.bigbluebutton.common.mate
{
	import com.asfusion.mate.actionLists.IScope;
	import com.asfusion.mate.actions.AbstractServiceInvoker;
	import com.asfusion.mate.actions.IAction;
	
	/**
	 * The SharedObjectInvoker is a Mate extention for use with Remote SharedObjects.
	 * The Invoker must be passed in an instantiated SharedObjectService.
	 * You must also pass the name of the shared object you wish to use. When the object is updated, the SharedObjectService will dispatch an event with
	 * type=SOName you passed into the Invoker
	 * Since SharedObjects propagate to different clients instead of having a call&receive nature, the result of calling a SharedObject using the
	 * SharedObjectInvoker should not be handled using the <resultHandler> tag. Instead, create a Mate Listener to listen for the event.
	 * 
	 * @author Snap
	 * 
	 */	
	public class SharedObjectInvoker extends AbstractServiceInvoker implements IAction
	{
		public var SOName:String;
		public var message:Object;
		
		private var soService:SharedObjectService;
		
		private static const UPDATE_CLIENT:String = "updateClient";
		
		/**
		 * The constructor
		 * 
		 */		
		public function SharedObjectInvoker()
		{
		}
		
		override protected function prepare(scope:IScope):void{
			super.prepare(scope);
			currentInstance = this;
			soService.connectToSharedObject(SOName);
		}
		
		override protected function run(scope:IScope):void{
			innerHandlersDispatcher = soService;
			
			if (this.resultHandlers && resultHandlers.length > 0) {
				this.createInnerHandlers(scope, SOName, resultHandlers);
			}
			
			if (this.faultHandlers && faultHandlers.length > 0) {
				this.createInnerHandlers(scope, SharedObjectEvent.SHARED_OBJECT_UPDATE_FAILED, faultHandlers);
			}	
			soService.updateSharedObject(SOName, message);
		}
		
		/**
		 * Set the service to use 
		 * @param service - The SharedObjectService to use with this Invoker
		 * 
		 */		
		public function set sharedObjectService(service:SharedObjectService):void{
			this.soService = service;
		}

	}
}