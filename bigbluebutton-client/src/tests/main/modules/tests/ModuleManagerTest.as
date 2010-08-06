package tests.main.modules.tests
{
	import org.bigbluebutton.main.model.modules.ModuleManager;

	public class ModuleManagerTest
	{
		private var moduleManager:ModuleManager;
		
		[Before]
		public function setUp():void{
			moduleManager = new ModuleManager();
		}
		
		[After]
		public function tearDown():void{
			moduleManager = null;
		}
		
		[Test]
		public function test1():void{
			
		} 
	}
}