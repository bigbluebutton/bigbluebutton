package org.bigbluebutton.modules.voiceconference
{
	import flash.events.Event;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindow;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindowMediator;
	
	public class TestWindowMediator extends TestCase
	{
		private var test:ListenersWindowMediator;
		private var listener:MockNotificationListener;
		private var facade:VoiceConferenceFacade;
		
		public function TestWindowMediator(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestWindowMediator("testConstructor"));
			ts.addTest(new TestWindowMediator("testListNotifications"));
			ts.addTest(new TestWindowMediator("testGetWindow"));
			ts.addTest(new TestWindowMediator("testUnmuteAll"));
			ts.addTest(new TestWindowMediator("testMuteAll"));
			ts.addTest(new TestWindowMediator("testEjectUser"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new ListenersWindowMediator(new ListenersWindow());
			facade = VoiceConferenceFacade.getInstance();
			facade.registerMediator(test);
			listener = new MockNotificationListener();
			facade.registerMediator(listener);
			facade.meetMeRoom = new VoiceConferenceRoom("hello");
			facade.meetMeRoom.dpParticipants = new ArrayCollection();
			facade.meetMeRoom.dpParticipants.addItem("hello");
		}
		
		override public function tearDown():void{
			facade.removeMediator(MockNotificationListener.NAME);
			facade.removeMediator(ListenersWindowMediator.NAME);
		}
		
		public function testConstructor():void{
			assertTrue(test != null);
		}
		
		public function testListNotifications():void{
			var notes:Array = test.listNotificationInterests();
			assertTrue(notes[0] == VoiceConferenceFacade.USER_JOIN_EVENT);
		}
		
		public function testGetWindow():void{
			assertTrue(test.listenersWindow != null);
		}
		
		public function testUnmuteAll():void{
			test.listenersWindow.dispatchEvent(new Event(ListenersWindowMediator.UNMUTE_ALL));
			assertTrue(listener.muteAllReceived);
		}
		
		public function testMuteAll():void{
			test.listenersWindow.dispatchEvent(new Event(ListenersWindowMediator.MUTE_ALL));
			assertTrue(listener.muteAllReceived);
		}
		
		public function testEjectUser():void{
			test.listenersWindow.dispatchEvent(new Event(ListenersWindowMediator.EJECT_USER));
		}

	}
}