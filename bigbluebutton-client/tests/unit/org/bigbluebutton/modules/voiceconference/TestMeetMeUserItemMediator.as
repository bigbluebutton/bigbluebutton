package org.bigbluebutton.modules.voiceconference
{
	import flash.events.Event;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.view.MeetMeUserItem;
	import org.bigbluebutton.modules.voiceconference.view.MeetMeUserItemMediator;
	
	public class TestMeetMeUserItemMediator extends TestCase
	{
		private var test:MeetMeUserItemMediator;
		private var facade:VoiceConferenceFacade;
		private var listener:MockNotificationListener;
		
		public function TestMeetMeUserItemMediator(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestMeetMeUserItemMediator("testMeetMeMediator"));
			ts.addTest(new TestMeetMeUserItemMediator("testListNotifications"));
			ts.addTest(new TestMeetMeUserItemMediator("testGetViewComponent"));
			ts.addTest(new TestMeetMeUserItemMediator("testMuteUnmuteUser"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new MeetMeUserItemMediator(new MeetMeUserItem());
			facade = VoiceConferenceFacade.getInstance();
			facade.registerMediator(test);
			listener = new MockNotificationListener();
			facade.registerMediator(listener);
		}
		
		override public function tearDown():void{
			facade.removeMediator(MockNotificationListener.NAME);
			facade.removeMediator(MeetMeUserItemMediator.NAME);
		}
		
		public function testMeetMeMediator():void{
			assertTrue(test != null);
		}
		
		public function testListNotifications():void{
			var notes:Array = test.listNotificationInterests();
			assertTrue(notes[0] == VoiceConferenceFacade.USER_JOIN_EVENT);
			assertTrue(notes.length == 1);
		}
		
		public function testGetViewComponent():void{
			assertTrue(test.meetMeUserItem != null);
		}
		
		public function testMuteUnmuteUser():void{
			//test.meetMeUserItem.isModerator = true;
			test.meetMeUserItem.dispatchEvent(new Event(MeetMeUserItemMediator.MUTE_UNMUTE_USER));
			assertTrue(!listener.muteReceived)
		}

	}
}