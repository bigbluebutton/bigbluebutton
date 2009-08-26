package org.blindside.modules.autotest.business
{
	import flash.external.ExternalInterface;
		
	public class TestRequestListener
	{
		private var loginSuccess:Boolean = false;
		private var sharedObjectSuccess:Boolean = false;
		
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
		
		public function setLoggedIn():void{
			LogUtil.debug("AutotestModule - setting logged in to true");
			loginSuccess = true;
		}
		
		public function setSOSuccess():void{
			LogUtil.debug("AutotestModule - setting shared object connection to true");
			sharedObjectSuccess = true;
		}

	}
}