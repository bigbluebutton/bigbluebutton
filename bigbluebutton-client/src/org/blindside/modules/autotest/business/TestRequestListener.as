package org.blindside.modules.autotest.business
{
	import flash.external.ExternalInterface;
	
	
	public class TestRequestListener
	{
		[Bindable] public var loginSuccess:Boolean = false;
		[Bindable] public var sharedObjectSuccess:Boolean = false;
		
		public function TestRequestListener()
		{
			ExternalInterface.addCallback("checkLogin", checkLogin);
			ExternalInterface.addCallback("checkSharedObjectConnection", checkSharedObjectConnection);
		}
		
		private function checkLogin():String{
			if (loginSuccess) return "true";
			else return "false";
		}
		
		private function checkSharedObjectConnection():String{
			if (sharedObjectSuccess) return "true";
			else return "false";
		}

	}
}