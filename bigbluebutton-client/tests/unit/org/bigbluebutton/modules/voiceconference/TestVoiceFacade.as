package org.bigbluebutton.modules.voiceconference
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	public class TestVoiceFacade extends TestCase
	{
		private var test:VoiceConferenceFacade;
		
		public function TestVoiceFacade(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestVoiceFacade("testGetInstance"));
			ts.addTest(new TestVoiceFacade("testStartup"));
			ts.addTest(new TestVoiceFacade("testMeetMeRoom"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = VoiceConferenceFacade.getInstance();
		}
		
		public function testGetInstance():void{
			assertTrue(test != null);
		}
		
		public function testStartup():void{
			test.startup(new VoiceModule, "hello");	
		}
		
		//Note that if this test passes it means the singleton is also working properly
		public function testMeetMeRoom():void{
			assertTrue(test.meetMeRoom != null);
		}

	}
}