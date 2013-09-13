package tests.main.users
{
	import tests.main.users.tests.JoinServiceTest;
	import tests.main.users.tests.UserServiceTest;

	[Suite]
	[RunWith("org.flexunit.runners.Suite")]
	public class UsersTestSuite
	{
		public var userServiceTest:UserServiceTest;
		public var joinServiceTest:JoinServiceTest;
	}
}