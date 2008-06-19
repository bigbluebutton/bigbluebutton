package org.bigbluebutton.modules.voiceconference
{
	import flash.events.NetStatusEvent;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;
	import org.bigbluebutton.modules.voiceconference.model.business.NetConnectionDelegate;
	import org.bigbluebutton.modules.voiceconference.model.business.VoiceConfConnectResponder;
	
	public class VoiceResponderTest extends TestCase
	{
		private var test:VoiceConfConnectResponder;
		private var facade:VoiceConferenceFacade;
		private var listener:MockNotificationListener;
		private var nc:MockNetConnection;
		private var ncDelegate:NetConnectionDelegate;
		private var room:VoiceConferenceRoom;
		
		public function VoiceResponderTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new VoiceResponderTest("testConstructor"));
			ts.addTest(new VoiceResponderTest("testListNotifications"));
			ts.addTest(new VoiceResponderTest("testSendMeetMeEvent"));
			
			return ts;
		}
		
		override public function setUp():void{
			room = new VoiceConferenceRoom("hello");
			test = new VoiceConfConnectResponder(room);
			facade = VoiceConferenceFacade.getInstance();
			facade.registerMediator(test);
			listener = new MockNotificationListener();
			facade.registerMediator(listener);
			nc = new MockNetConnection();
			ncDelegate = new NetConnectionDelegate("hello");
			facade.registerProxy(ncDelegate);
		}
		
		public function testConstructor():void{
			assertTrue(test != null);
		}
		
		public function testListNotifications():void{
			var notes:Array = test.listNotificationInterests();
			assertTrue(notes[0] == VoiceConfConnectResponder.CLOSE);
			assertTrue(notes[1] == VoiceConfConnectResponder.RESULT);
			assertTrue(notes[2] == VoiceConfConnectResponder.FAULT);
			assertTrue(notes[3] == VoiceConferenceFacade.MUTE_UNMUTE_USER_COMMAND);
			assertTrue(notes[4] == VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND);
			assertTrue(notes[5] == VoiceConferenceFacade.EJECT_USER_COMMAND);
		}
		
		public function testProxy():void{
			assertTrue(test.proxy == ncDelegate);
		}
		
		public function testSendMeetMeEvent():void{
			test.sendNewMeetMeEvent();
			assertTrue(listener.userJoin);
		}

	}
}