package org.bigbluebutton.modules.voiceconference
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;
	
	public class TestVoiceConferenceRoom extends TestCase
	{
		private var test:VoiceConferenceRoom;
		
		public function TestVoiceConferenceRoom(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			ts.addTest(new TestVoiceConferenceRoom("testConferenceRoom"));
			ts.addTest(new TestVoiceConferenceRoom("testURI"));
			return ts;
		}
		
		override public function setUp():void{
			test = new VoiceConferenceRoom("local");
		}
		
		public function testConferenceRoom():void{
			assertTrue(test != null);
		}
		
		public function testURI():void{
			assertTrue(test.getUri() == "local");
			test.setUri("hello");
			assertTrue(test.getUri() == "hello");
		}

	}
}