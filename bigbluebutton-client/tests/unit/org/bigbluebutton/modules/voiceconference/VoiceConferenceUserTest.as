package org.bigbluebutton.modules.voiceconference
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.model.vo.VoiceConferenceUser;
	
	public class VoiceConferenceUserTest extends TestCase
	{
		private var test:VoiceConferenceUser;
		
		public function VoiceConferenceUserTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			ts.addTest(new VoiceConferenceUserTest("testUser"));
			return ts;
		}
		
		override public function setUp():void{
			test = new VoiceConferenceUser();
		}
		
		public function testUser():void{
			test.callerIdName = "Me";
			test.callerIdNumber = "5";
			test.dateJoined = new Date("02/01/2005");
			test.muted = true;
			test.roomNumber = "1";
			test.talking = false;
			test.userNumber = 7;
			assertTrue(test.callerIdName == "Me");
			assertTrue(test.callerIdNumber == "5");
			assertTrue(test.dateJoined.getFullYear() == 2005);
			assertTrue(test.dateJoined.getMonth() == 01);
			assertTrue(test.dateJoined.getDay() == 02);
			assertTrue(test.roomNumber == "1");
			assertTrue(test.muted == true);
			assertTrue(test.talking == false);
			assertTrue(test.userNumber == 7);
		}

	}
}