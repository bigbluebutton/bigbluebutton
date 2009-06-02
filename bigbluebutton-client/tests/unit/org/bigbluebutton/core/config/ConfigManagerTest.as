package org.bigbluebutton.core.config
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import net.digitalprimates.fluint.tests.TestCase;

	public class ConfigManagerTest extends TestCase
	{
		private var cm:ConfigManager;
		private var url:String;
		private var urlLoader:URLLoader;
		
		override protected function setUp():void {
			cm = new ConfigManager();
			url = "conf/config.xml";
			urlLoader = new URLLoader();
		}
		
		override protected function tearDown():void {
       
		}
		
		public function testParse():void {
			urlLoader.addEventListener(Event.COMPLETE, asyncHandler(handleResult, 10000, null, handleTimeout), false, 0, true );	
			urlLoader.load(new URLRequest(url));			
		}
		
		
		private function handleResult(result:Event, passThroughData:Object):void {
			var configs:XML = new XML(result.target.data);
			cm.parseModules(configs);
			assertEquals(5, cm.numberOfModules);
			cm.parsePortTest(configs);
			assertEquals('localhost', cm.portTestHost);
			assertEquals('oflaDemo', cm.portTestApplication);
		}
		
		protected function handleTimeout(passThroughData:Object):void {
			fail('Timeout before getting http response');
		}
	}
}