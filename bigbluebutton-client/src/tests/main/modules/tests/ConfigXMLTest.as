package tests.main.modules.tests
{
	import flash.utils.Timer;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.model.ConfigParameters;
	import org.flexunit.Assert;
	import org.flexunit.async.Async;

	public class ConfigXMLTest
	{
		private var config:ConfigParameters;
		
		[Before]
		public function setUp():void{
			
		}
		
		[After]
		public function tearDown():void{
			config = null;
		}
		
		[Test(async, description="Checks whether the config.xml exists and loads")]
		public function testLoadConfigFile():void{
			var asyncHandler:Function = Async.asyncHandler(this, handleTimer, 500, null, handleTimeout);
			config = new ConfigParameters(asyncHandler);
		}
		
		protected function handleTimer(...args):void{
			//Loading config.xml succeded
		}
		
		protected function handleTimeout():void{
			Assert.fail("config.xml did not load");
		}
		
		[Test(async, description="Expects the config.xml to have the necessary attributes")]
		public function testApplicationParameters():void{
			var asyncHandler:Function = Async.asyncHandler(this, checkParameters, 500, null, handleTimeout);
			config = new ConfigParameters(asyncHandler);
		}
		
		protected function checkParameters(...args):void{
			Assert.assertNotNull(config.application);
			Assert.assertNotNull(config.helpURL);
			Assert.assertNotNull(config.host);
			Assert.assertNotNull(config.localeVersion);
			Assert.assertNotNull(config.portTestApplication);
			Assert.assertNotNull(config.portTestHost);
			Assert.assertNotNull(config.version);
		}
		
		[Test(async, description="Expects the config.xml to contain modules to load")]
		public function testModulesPresentInConfig():void{
			var asyncHandler:Function = Async.asyncHandler(this, checkForModules, 500, null, handleTimeout);
			config = new ConfigParameters(asyncHandler);
		}
		
		protected function checkForModules(...args):void{
			Assert.assertNotNull(config.getModules())
		}
	}
}