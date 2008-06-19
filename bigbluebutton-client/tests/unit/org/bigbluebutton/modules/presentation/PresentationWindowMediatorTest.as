package org.bigbluebutton.modules.presentation
{
	import flash.events.Event;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.view.PresentationWindow;
	import org.bigbluebutton.modules.presentation.view.PresentationWindowMediator;
	
	public class PresentationWindowMediatorTest extends TestCase
	{
		private var test:PresentationWindowMediator;
		private var facade:PresentationFacade;
		private var listener:PresentationNotificationListener;
		
		public function PresentationWindowMediatorTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new PresentationWindowMediatorTest("testConstructor"));
			ts.addTest(new PresentationWindowMediatorTest("testListNotifications"));
			ts.addTest(new PresentationWindowMediatorTest("testConnectToPresentation"));
			//ts.addTest(new PresentationWindowMediatorTest("testSharePresentation"));
			//ts.addTest(new PresentationWindowMediatorTest("testOpenUploadWindow"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new PresentationWindowMediator(new PresentationWindow());
			facade = PresentationFacade.getInstance();
			facade.registerMediator(test);
			listener = new PresentationNotificationListener();
			facade.registerMediator(listener);
		}
		
		public function testConstructor():void{
				assertTrue(test != null);
		}
		
		public function testListNotifications():void{
			var notes:Array = test.listNotificationInterests();
			assertTrue(notes[0] == PresentationFacade.READY_EVENT);
			assertTrue(notes[1] == PresentationFacade.VIEW_EVENT);
		}
		
		public function testConnectToPresentation():void{
			test.presentationWindow.dispatchEvent(new Event(PresentationWindowMediator.CONNECT));
			assertTrue(listener.receivedLeaveEvent || listener.receivedJoinEvent);
		}
		
		//Could not test these due to difficulties of creating GUI dependencies
		//public function testSharePresentation():void{
		//	test.presentationWindow.dispatchEvent(new Event(PresentationWindowMediator.SHARE));
		//	assertTrue(listener.receivedShareEvent);
		//}
		
		//Could not test these due to difficulties of creating GUI dependencies
		//public function testOpenUploadWindow():void{
		//	test.presentationWindow.dispatchEvent(new Event(PresentationWindowMediator.OPEN_UPLOAD));
		//	assertTrue(listener.receivedStartUpload);
		//}

	}
}