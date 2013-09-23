package tests
{
	import tests.main.modules.ModulesTestSuite;
	import tests.main.users.UsersTestSuite;

	[Suite]
	[RunWith("org.flexunit.runners.Suite")]
	public class BBBTestSuite
	{
		public var modulesSuite:ModulesTestSuite;
		public var usersSuite:UsersTestSuite;
	}
}