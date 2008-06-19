package org.bigbluebutton.modules.voiceconference
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.control.notifiers.MuteNotifier;
	
	public class MuteNotifierTest extends TestCase
	{
		private var test:MuteNotifier;
		
		public function MuteNotifierTest(methodName:String)
		{
			super(methodName);	
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new MuteNotifierTest("testMuteNotifier"));
			
			return ts;
		}
		
		public function testMuteNotifier():void{
			assertTrue(test == null);
			test = new MuteNotifier(5, true);
			assertTrue(test.userid == 5);
			assertTrue(test.muteUser == true);
		}

	}
}