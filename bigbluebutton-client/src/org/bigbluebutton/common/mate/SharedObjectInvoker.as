package org.bigbluebutton.common.mate
{
	import com.asfusion.mate.actionLists.IScope;
	import com.asfusion.mate.actions.AbstractServiceInvoker;
	import com.asfusion.mate.actions.IAction;
	
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	public class SharedObjectInvoker extends AbstractServiceInvoker implements IAction
	{
		public var SOName:String;
		public var url:String;
		
		private var so:SharedObject;
		private var nc:NetConnection;
		
		public function SharedObjectInvoker()
		{
			
		}
		
		override public function prepare(scope:IScope):void{
			super.prepare(scope);
			currentInstance = this;
		}
		
		override protected function run(scope:IScope):void{
			
		}

	}
}