package tests.main.modules
{
	import tests.main.modules.tests.ConfigXMLTest;
	import tests.main.modules.tests.DependencyResolverTest;
	import tests.main.modules.tests.ModuleDescriptorTest;
	import tests.main.modules.tests.ModuleManagerTest;
	import tests.main.modules.tests.PortsProxyTest;

	[Suite]
	[RunWith("org.flexunit.runners.Suite")]
	public class ModulesTestSuite
	{
		public var configXMLTest:ConfigXMLTest;
		public var dependancyTest:DependencyResolverTest;
		public var moduleDescriptorTest:ModuleDescriptorTest;
		public var moduleManagerTest:ModuleManagerTest;
		public var portsTest:PortsProxyTest;
	}
}