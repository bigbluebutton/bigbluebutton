package tests.main.modules
{
	import tests.main.modules.tests.ConfigXMLTest;
	import tests.main.modules.tests.DependancyLoaderTest;

	[Suite]
	[RunWith("org.flexunit.runners.Suite")]
	public class ModulesTestSuite
	{
		public var configXMLTest:ConfigXMLTest;
		public var dependancyTest:DependancyLoaderTest;
	}
}