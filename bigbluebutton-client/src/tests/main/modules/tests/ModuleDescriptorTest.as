package tests.main.modules.tests
{
	import flash.system.ApplicationDomain;
	
	import mx.controls.Alert;
	import mx.events.ModuleEvent;
	import mx.modules.ModuleLoader;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.main.model.modules.ModuleDescriptor;
	import org.flexunit.Assert;
	import org.flexunit.async.Async;

	public class ModuleDescriptorTest
	{
		private var descriptor:ModuleDescriptor;
		
		[Before]
		public function setUp():void{
			var attributes:XML = <module name="DummyModule" url="tests/main/modules/tests/DummyModule.swf" attribute1="true" 
													attribute2="global" dependsOn="SomeOtherModule,  SomeOtherOtherModule" />
			descriptor = new ModuleDescriptor(attributes);
		}
		
		[After]
		public function tearDown():void{
			descriptor = null;
		}
		
		[Test(description="Tests whether the attributes for the modules loaded properly")]
		public function testAttributes():void{
			Assert.assertEquals(descriptor.getName(), "DummyModule");
			Assert.assertEquals(descriptor.getAttribute("url"), "tests/main/modules/tests/DummyModule.swf");
			Assert.assertEquals(descriptor.getAttribute("attribute1"), "true");
			Assert.assertEquals(descriptor.getAttribute("attribute2"), "global");
			Assert.assertEquals(descriptor.getAttribute("dependsOn"), "SomeOtherModule,  SomeOtherOtherModule");
			Assert.assertNull(descriptor.getAttribute("thereIsNoSuchAttribute"));
		}
		
		[Test(description="Tests whether the descriptor parsed the dependancies correctly")]
		public function testDependancies():void{
			Assert.assertEquals(descriptor.unresolvedDependancies[0].toString(), "SomeOtherModule");
			Assert.assertEquals(descriptor.unresolvedDependancies[1].toString(), "SomeOtherOtherModule");
			Assert.assertEquals(descriptor.unresolvedDependancies.length, 2);
		}
		
		[Test(description="Test to make sure a common BigBlueButton Application Domain is set before loading the module, for Security purposes", expects="Error")]
		public function testApplicationDomain():void{
			descriptor.load(dummy);
		}
		
		[Test(async, description="Test to make sure a module loads properly")]
		public function testModuleLoading():void{
			Async.handleEvent(this, descriptor.loader, ModuleEvent.READY, handleLoaded, 500, null, handleTimeout);
			
			descriptor.setApplicationDomain(ApplicationDomain.currentDomain);
			descriptor.load(dummy);
		}
		
		protected function handleLoaded(event:ModuleEvent, ...args):void{
			var modLoader:ModuleLoader = event.target as ModuleLoader;
			var module:IBigBlueButtonModule = modLoader.child as IBigBlueButtonModule;
			Assert.assertNotNull(module);
			Assert.assertEquals(module.moduleName, "DummyModule");
		}
		
		protected function handleTimeout(...args):void{
			//The modules failed to load
		}
		
		protected function dummy(...args):void{
			
		}
	}
}