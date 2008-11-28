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
//			manager.parse(new XML(xmlString));
//			assertTrue( "There should be a ChatModule", manager.modules['ChatModule'].name == "ChatModule");
//			manager.loadModule('ChatModule', resultHandler);
		}
		
		private function resultHandler(e:Event):void {
			LogUtil.debug(e.type);
		}
	}
}