package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.view.FileUploadWindow;
	import org.bigbluebutton.modules.presentation.view.FileUploadWindowMediator;
	
	public class FileUploadWindowMediatorTest extends TestCase
	{
		private var test:FileUploadWindowMediator;
		private var facade:PresentationFacade;
		private var listener:PresentationNotificationListener;
		
		public function FileUploadWindowMediatorTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new FileUploadWindowMediatorTest("testConstructor"));
			ts.addTest(new FileUploadWindowMediatorTest("testListNotifications"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new FileUploadWindowMediator(new FileUploadWindow());
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
			assertTrue(notes[0] == PresentationFacade.UPLOAD_COMPLETED_EVENT);
			assertTrue(notes[1] == PresentationFacade.UPLOAD_PROGRESS_EVENT);
			assertTrue(notes[2] == PresentationFacade.UPLOAD_IO_ERROR_EVENT);
			assertTrue(notes[3] == PresentationFacade.UPLOAD_SECURITY_ERROR_EVENT);
			assertTrue(notes[4] == PresentationFacade.CONVERT_PROGRESS_EVENT);
			assertTrue(notes[5] == PresentationFacade.EXTRACT_PROGRESS_EVENT);
			assertTrue(notes[6] == PresentationFacade.UPDATE_PROGRESS_EVENT);
			assertTrue(notes[7] == PresentationFacade.CONVERT_SUCCESS_EVENT);
		}
		
		// Could not test the rest of the methods in this class due to GUI dependencies

	}
}