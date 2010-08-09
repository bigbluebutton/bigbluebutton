package tests.main.users.tests
{
	import org.bigbluebutton.main.model.users.UserService;

	public class UserServiceTest
	{
		private var userService:UserService;
		
		[Before]
		public function setUp():void{
			userService = new UserService();
		}
		
		[After]
		public function tearDown():void{
			userService = null;
		}
		
		[Test]
		public function test1():void{
			
		}
	}
}