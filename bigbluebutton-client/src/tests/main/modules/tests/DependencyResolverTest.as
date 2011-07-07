/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
package tests.main.modules.tests
{
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.model.ConfigParameters;
	import org.bigbluebutton.main.model.modules.DependancyResolver;
	import org.bigbluebutton.main.model.modules.ModuleDescriptor;
	import org.flexunit.Assert;
	import org.flexunit.async.Async;

	public class DependencyResolverTest
	{
		private var resolver:DependancyResolver;
		private var unsortedModules:Dictionary;
		private var sortedModules:ArrayCollection;
		private var config:ConfigParameters;
		
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
			config = null;
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
		
		[Test(async, description="Testing the actual config.xml. Test passes when config.xml loaded properly and module tree successfully built")]
		public function testActual():void{
			var asyncHandler:Function = Async.asyncHandler(this, handleTimer, 500, null, handleTimeout);
			config = new ConfigParameters(asyncHandler);
		}
		
		protected function handleTimer(...args):void{
			var modules:Dictionary = config.getModules();
			sortedModules = resolver.buildDependencyTree(modules);
			
			Assert.assertNotNull(modules);
			Assert.assertNotNull(sortedModules);
		}
		
		protected function handleTimeout():void{
			Assert.fail("config.xml did not load");
		}
	}
}