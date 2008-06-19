package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.controller.notifiers.JoinNotifier;
	
	public class JoinNotifierTest extends TestCase
	{
		private var test:JoinNotifier;
		
		public function JoinNotifierTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new JoinNotifierTest("testJoinNotifier"));
			ts.addTest(new JoinNotifierTest("testUserID"));
			ts.addTest(new JoinNotifierTest("testRoom"));
			ts.addTest(new JoinNotifierTest("testURL"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new JoinNotifier(5,"local","room");
		}
		
		public function testJoinNotifier():void{
			assertTrue(test != null);
		}
		
		public function testUserID():void{
			assertTrue(test.userid == 5);
			assertFalse(test.userid == 69);
		}
		
		public function testURL():void{
			assertTrue(test.url == "local");
			assertFalse(test.url == "remote");
		}
		
		public function testRoom():void{
			assertTrue(test.room == "room");
			assertFalse(test.room == "not a room.");
		}

	}
}