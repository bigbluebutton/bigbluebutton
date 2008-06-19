package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.business.NetConnectionDelegate;
	import org.bigbluebutton.modules.presentation.model.business.PresentationDelegate;
	import org.bigbluebutton.modules.voiceconference.MockNetConnection;
	
	public class TestNetConnectionDelegate extends TestCase
	{
		private var test:NetConnectionDelegate;
		private var facade:PresentationFacade;
		private var nc:MockNetConnection;
		
		public function TestNetConnectionDelegate(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestNetConnectionDelegate("testConstructor"));
			ts.addTest(new TestNetConnectionDelegate("testConnect"));
			ts.addTest(new TestNetConnectionDelegate("testGetConnUri"));
			ts.addTest(new TestNetConnectionDelegate("testDisconnect"));
			ts.addTest(new TestNetConnectionDelegate("testGetConnection"));
			
			return ts;
		}
		
		override public function setUp():void{
			nc = new MockNetConnection();
			test  = new NetConnectionDelegate(new PresentationDelegate(nc));
			test.setNetConnection(nc);
			facade = PresentationFacade.getInstance();
		}
		
		override public function tearDown():void{
			
		}
		
		public function testConstructor():void{
			assertTrue(test != null);
		}
		
		public function testConnect():void{
			test.connect("host", "room");
			assertTrue(nc.client == test);
			assertFalse(nc.client == null);
			assertTrue(nc.connectionOpen);
		}
		
		public function testGetConnUri():void{
			test.connect("host", "room");
			assertTrue(test.connUri == "host/presentation/room");
			assertFalse(test.connUri == "oooo");
		}
		
		public function testDisconnect():void{
			test.disconnect();
			assertTrue(!nc.connectionOpen);
		}
		
		public function testGetConnection():void{
			assertFalse(test.getConnection() == null);
			assertTrue(test.getConnection() == nc);
		}

	}
}