package org.bigbluebutton.main
{
	import flash.events.Event;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;

	public class ModulesProxyTests extends TestCase
	{
		public function ModulesProxyTests(methodName:String=null)
		{
			super(methodName);
		}

		override public function setUp():void { 
 
		}  
		
		override public function tearDown():void {  } 

 		public static function suite():TestSuite 
 		{
   			var ts:TestSuite = new TestSuite();
   			
   			ts.addTest( new ModulesProxyTests( "testLoadModule" ) );
//   			ts.addTest( new ModulesProxyTests( "testLoadXmlFile" ) );
 //  			ts.addTest( new ModulesProxyTests( "testLoadModule" ) );
   			return ts;
   		}		

		public function testLoadModule():void {
			var obj:Object = new Object();
			obj["test"] = true;
			assertTrue("There should be a test property", obj.hasOwnProperty("test"));
			var x:* = obj.test2;
			assertTrue("There should be no test2 property", x == undefined);
			assertTrue("There should be no test2 property", x == null);
			
			
//			manager.parse(new XML(xmlString));
//			assertTrue( "There should be a ChatModule", manager.modules['ChatModule'].name == "ChatModule");
//			manager.loadModule('ChatModule', resultHandler);
		}
		
		private function resultHandler(e:Event):void {
			LogUtil.debug(e.type);
		}
	}
}