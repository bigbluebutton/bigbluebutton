package tests.main.users.tests
{
	import flash.events.Event;
	
	import flexunit.framework.Assert;
	
	import org.bigbluebutton.main.model.users.JoinService;
	import org.flexunit.async.Async;

	public class JoinServiceTest
	{
		public static const JOIN_MOCK_XML:String = "conf/join-mock.xml";
		
		private var joinService:JoinService;
		
		[Before]
		public function setUp():void{
			joinService = new JoinService();
		}
		
		[After]
		public function tearDown():void{
			joinService = null;
		}
		
		[Test(async, description="Testing the join service, to get the conference parameters from the join-mock.xml file")]
		public function testJoinMock():void{
			Async.handleEvent(this, joinService.loader, Event.COMPLETE, handleLoaded, 1000, null, timeoutHandler);
			joinService.load(JOIN_MOCK_XML);
		}
		
		protected function handleLoaded(e:Event, ...args):void{
			var xml:XML = new XML(e.target.data);
			
			Assert.assertEquals(xml.returncode, "SUCCESS");
			Assert.assertEquals(xml.fullname, "Test User");
			Assert.assertEquals(xml.conference, "conference-mock-default");
			Assert.assertEquals(xml.room, "room-mock-default");
			Assert.assertEquals(xml.voicebridge, "85115");
			Assert.assertEquals(xml.role, "MODERATOR");
		}
		
		protected function timeoutHandler(...args):void{
			
		}
		
	}
}