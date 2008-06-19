package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.business.PresentationDelegate;
	import org.bigbluebutton.modules.presentation.model.vo.SlidesDeck;
	import org.bigbluebutton.modules.voiceconference.MockNetConnection;
	
	public class TestPresentationDelegate extends TestCase
	{
		private var test:PresentationDelegate;
		private var facade:PresentationFacade;
		private var nc:MockNetConnection;
		private var listener:PresentationNotificationListener;
		
		public function TestPresentationDelegate(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestPresentationDelegate("testConstructor"));
			//ts.addTest(new TestPresentationDelegate("testConnectionSuccess"));
			ts.addTest(new TestPresentationDelegate("testConnectionFailed"));
			ts.addTest(new TestPresentationDelegate("testJoin"));
			//ts.addTest(new TestPresentationDelegate("testLeave"));
			ts.addTest(new TestPresentationDelegate("testNewPageNumber"));
			//ts.addTest(new TestPresentationDelegate("testClearPresentation"));
			//ts.addTest(new TestPresentationDelegate("testProcessUpdateMessage"));
			
			return ts;
		}
		
		override public function setUp():void{
			nc = new MockNetConnection();
			test = new PresentationDelegate(nc);
			facade = PresentationFacade.getInstance();
			listener = new PresentationNotificationListener();
			facade.registerProxy(test);
			facade.registerMediator(listener);
		}
		
		override public function tearDown():void{
			
		}
		
		public function testConstructor():void{
			assertTrue(test != null);
		}
		
		//Could not test due to problems of creating a mock remote shared object
		//public function testConnectionSuccess():void{
		//	test.connectionSuccess();
		//	assertTrue(test.presentation.isConnected == true);
		//}
		
		public function testConnectionFailed():void{
			test.connectionFailed("OH NOES!");
			assertTrue(test.presentation.isConnected == false);
		}
		
		public function testJoin():void{
			test.join(5, "host", "room");
			assertTrue(test.presentation.userid == 5);
			assertTrue(test.presentation.host == "host");
			assertTrue(test.presentation.room == "room");
			assertTrue(listener.receivedLoadCommand == true);
			assertTrue(nc.connectionOpen == true);
		}
		
		//Could not test due to problems of creating a mock remote shared object
		//public function testLeave():void{
		//	test.join(5, "host", "room");
		//	assertTrue(nc.connectionOpen == false);
		//}
		
		public function testNewPageNumber():void{
			test.presentation.decks = new SlidesDeck();
			test.newPageNumber(13);
			assertTrue(test.presentation.decks.selected == 13);
		}
		
		//Could not test due to problems of creating a mock remote shared object
		//public function testClearPresentation():void{
		//	
		//}
		
		//Could not test due to problems of creating a mock remote shared object
		//public function testProcessUpdateMessage():void{
		//	
		//}

	}
}