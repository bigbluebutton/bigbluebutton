package tests.main.modules.tests
{
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.model.modules.DependancyResolver;
	import org.bigbluebutton.main.model.modules.ModuleDescriptor;
	import org.flexunit.Assert;

	public class DependancyLoaderTest
	{
		private var resolver:DependancyResolver;
		private var unsortedModules:Dictionary;
		private var sortedModules:ArrayCollection;
		
		[Before]
		public function setUp():void{
			resolver = new DependancyResolver();
			unsortedModules = new Dictionary();
		}
		
		[After]
		public function tearDown():void{
			resolver = null;
			unsortedModules = null;
			sortedModules = null;
		}
		
		[Test(description="Testing No Dependancies between modules")]
		public function testNoDependancies():void{
			var modules:XML =
				<modules>
					<module name="Module1" />
					<module name="Module2" />
					<module name="Module3" />
					<module name="Module4" />
					<module name="Module5" />
					<module name="Module6" />
					<module name="Module7" />
					<module name="Module8" />
					<module name="Module9" />
				</modules>;
			
			var list:XMLList = modules.module;
			var item:XML;
			Assert.assertEquals(list.length(), 9);
			
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				unsortedModules[item.@name] = mod;
			}
			sortedModules = resolver.buildDependencyTree(unsortedModules);
			Assert.assertEquals(sortedModules.length, 9);
		}
		
		[Test(description="Testing Linear Dependancy Tree")]
		public function testLinearDependancies():void{
			var modules:XML =
				<modules>
					<module name="Module1" />
					<module name="Module2" dependsOn="Module1" />
					<module name="Module3" dependsOn="Module2" />
					<module name="Module4" dependsOn="Module3" />
					<module name="Module5" dependsOn="Module4" />
					<module name="Module6" dependsOn="Module5" />
					<module name="Module7" dependsOn="Module6" />
					<module name="Module8" dependsOn="Module7" />
					<module name="Module9" dependsOn="Module8" />
				</modules>;
			
			var list:XMLList = modules.module;
			var item:XML;
			Assert.assertEquals(list.length(), 9);
			
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				unsortedModules[item.@name] = mod;
			}
			sortedModules = resolver.buildDependencyTree(unsortedModules);
			for (var i:int = 0; i<sortedModules.length; i++){
				Assert.assertEquals((sortedModules.getItemAt(i) as ModuleDescriptor).getName(), "Module" + (i+1));
			}
		}
		
		[Test(description="Testing Circular Dependancy Resolution", expects="Error")]
		public function testCircularDependancies():void{
			var modules:XML =
				<modules>
					<module name="Module1" />
					<module name="Module2" dependsOn="Module3" />
					<module name="Module3" dependsOn="Module2" />
				</modules>;
			
			var list:XMLList = modules.module;
			var item:XML;
			Assert.assertEquals(list.length(), 3);
			
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				unsortedModules[item.@name] = mod;
			}
			sortedModules = resolver.buildDependencyTree(unsortedModules);
		}
		
		[Test(description="Testing Multiple Dependancies")]
		public function testMultipleDependancies():void{
			var modules:XML =
				<modules>
					<module name="Module1" />
					<module name="Module2" dependsOn="Module1, Module5" />
					<module name="Module3" dependsOn="Module2, Module1" />
					<module name="Module4" dependsOn="Module3, Module2, Module5" />
					<module name="Module5" dependsOn="Module1" />
				</modules>;
			
			var list:XMLList = modules.module;
			var item:XML;
			Assert.assertEquals(list.length(), 5);
			
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				unsortedModules[item.@name] = mod;
			}
			sortedModules = resolver.buildDependencyTree(unsortedModules);
			Assert.assertEquals((sortedModules.getItemAt(0) as ModuleDescriptor).getName(), "Module1");
			Assert.assertEquals((sortedModules.getItemAt(1) as ModuleDescriptor).getName(), "Module5");
			Assert.assertEquals((sortedModules.getItemAt(2) as ModuleDescriptor).getName(), "Module2");
			Assert.assertEquals((sortedModules.getItemAt(3) as ModuleDescriptor).getName(), "Module3");
			Assert.assertEquals((sortedModules.getItemAt(4) as ModuleDescriptor).getName(), "Module4");
		}
		
		[Test(description="Testing a Common BBB Dependancy Tree")]
		public function testCommonConfiguration():void{
			var modules:XML =
				<modules>
					<module name="Module1" />
					<module name="Module2" />
					<module name="Module3" />
					<module name="Module4" dependsOn="Module1" />
					<module name="Module5" dependsOn="Module1" />
					<module name="Module6" dependsOn="Module1" />
					<module name="Module7" dependsOn="Module1, Module8" />
					<module name="Module8" dependsOn="Module1" />
				</modules>;
			
			var list:XMLList = modules.module;
			var item:XML;
			Assert.assertEquals(list.length(), 8);
			
			for each(item in list){
				var mod:ModuleDescriptor = new ModuleDescriptor(item);
				unsortedModules[item.@name] = mod;
			}
			sortedModules = resolver.buildDependencyTree(unsortedModules);
			Assert.assertEquals((sortedModules.getItemAt(7) as ModuleDescriptor).getName(), "Module7");
		}
	}
}