package org.bigbluebutton.modules.presentation
{
	import flash.events.Event;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.view.PresentationPanel;
	import org.bigbluebutton.modules.presentation.view.PresentationPanelMediator;
	
	public class PresentationPanelMediatorTest extends TestCase
	{
		private var test:PresentationPanelMediator;
		private var facade:PresentationFacade;
		private var listener:PresentationNotificationListener;
		
		public function PresentationPanelMediatorTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new PresentationPanelMediatorTest("testConstructor"));
			ts.addTest(new PresentationPanelMediatorTest("testListNotifications"));
			ts.addTest(new PresentationPanelMediatorTest("testConnectToPresentation"));
			//ts.addTest(new PresentationPanelMediatorTest("testSharePresentation"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new PresentationPanelMediator(new PresentationPanel());
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
			assertTrue(notes[0] == PresentationFacade.CLEAR_EVENT);
			assertTrue(notes[1] == PresentationFacade.READY_EVENT);
			assertTrue(notes[2] == PresentationFacade.VIEW_EVENT);
		}
		
		public function testConnectToPresentation():void{
			test.presentationPanel.dispatchEvent(new Event(PresentationPanelMediator.CONNECT));
			assertTrue(listener.receivedLeaveEvent || listener.receivedJoinEvent);
		}
		
		//Can't test due to difficulties of creating GUI dependencies
		//public function testSharePresentation():void{
		//	test.presentationPanel.dispatchEvent(new Event(PresentationPanelMediator.SHARE));
		//	assertTrue(listener.receivedShareEvent);	
		//}

	}
}