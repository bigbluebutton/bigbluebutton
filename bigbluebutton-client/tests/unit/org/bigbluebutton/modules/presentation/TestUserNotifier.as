package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.controller.notifiers.UserNotifier;
	
	public class TestUserNotifier extends TestCase
	{
		private var test:UserNotifier;
		
		public function TestUserNotifier(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestUserNotifier("testUserNotifier"));
			ts.addTest(new TestUserNotifier("testName"));
			ts.addTest(new TestUserNotifier("testUserID"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new UserNotifier(4, "Mr.T");
		}
		
		public function testUserNotifier():void{
			assertTrue(test != null);
		}
		
		public function testName():void{
			assertTrue(test.name == "Mr.T");
			assertFalse(test.name == "The A-Team");
		}
		
		public function testUserID():void{
			assertTrue(test.userid == 4);
			assertFalse(test.userid == 58);
		}

	}
}