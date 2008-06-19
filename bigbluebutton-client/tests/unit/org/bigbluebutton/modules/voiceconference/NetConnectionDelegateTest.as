package org.bigbluebutton.modules.voiceconference
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.model.business.NetConnectionDelegate;
	
	public class NetConnectionDelegateTest extends TestCase
	{
		private var test:NetConnectionDelegate;
		public var facade:VoiceConferenceFacade;
		private var listener:MockNotificationListener;
		private var nc:MockNetConnection;
		
		public function NetConnectionDelegateTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new NetConnectionDelegateTest("testConnectionDelegate"));
			ts.addTest(new NetConnectionDelegateTest("testConnect"));
			ts.addTest(new NetConnectionDelegateTest("testCloseConnection"));
			ts.addTest(new NetConnectionDelegateTest("testNetStatus"));
			ts.addTest(new NetConnectionDelegateTest("testGetURI"));
			ts.addTest(new NetConnectionDelegateTest("testGetConnection"));
			ts.addTest(new NetConnectionDelegateTest("testMuteAll"));
			ts.addTest(new NetConnectionDelegateTest("testMuteUnmute"));
			ts.addTest(new NetConnectionDelegateTest("testEject"));
			
			return ts;
		}
		
		override public function setUp():void{
			
			test = new NetConnectionDelegate("testURI");
			facade = VoiceConferenceFacade.getInstance();
			facade.registerProxy(test);
			listener = new MockNotificationListener();
			facade.registerMediator(listener);
			nc = new MockNetConnection();
		}
		
		override public function tearDown():void{
			facade.removeMediator(MockNotificationListener.NAME);
			facade.removeProxy(NetConnectionDelegate.NAME);
		}
		
		public function testConnectionDelegate():void{
			assertTrue(test!= null);
		}
		
		public function testConnect():void{ 
			test.connect(nc);
			assertTrue(nc.connectionOpen == true);
			assertTrue(nc.client == test);
		}
		
		public function testCloseConnection():void{
			test.connect(nc);
			test.close();
			assertTrue(nc.connectionOpen == false);
		}
		
		public function testNetStatus():void{
			test.connect(nc);
			//when you close a connection it should generate a net status event
			test.close();
			assertTrue(listener.closeReceived);
		}
		
		public function testGetURI():void{
			assertTrue(test.getUri() == "testURI");
		}
		
		public function testGetConnection():void{
			test.connect(nc);
			assertTrue(test.getConnection() == nc);
		}
		
		public function testMuteAll():void{
			test.muteAllUsers(true);
			assertTrue(listener.muteAllReceived);
		}
		
		public function testMuteUnmute():void{
			test.muteUnmuteUser(5,true);
			assertTrue(listener.muteUnmuteReceived);
		}
		
		public function testEject():void{
			test.ejectUser(5);
			assertTrue(listener.ejectReceived);
		}

	}
}