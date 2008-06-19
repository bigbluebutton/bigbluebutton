package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.PresentationModel;
	
	public class PresentationModelTest extends TestCase
	{
		private var test:PresentationModel;
	
		public function PresentationModelTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new PresentationModelTest("testPresentationModel"));
			ts.addTest(new PresentationModelTest("testOpen"));
			ts.addTest(new PresentationModelTest("testClose"));
			
			return ts;
		}
		
		public function testPresentationModel():void{
			assertTrue(test == null);
			test = new PresentationModel();
			assertFalse(test == null);
			
		}
		
		public function testOpen():void{
			assertTrue(test.userid == null);
			test.open(5);
			assertTrue(test.userid == 5);	
		}
		
		public function testClose():void{
			test.close();
			assertTrue(test.isConnected == false);	
		}

	}
}