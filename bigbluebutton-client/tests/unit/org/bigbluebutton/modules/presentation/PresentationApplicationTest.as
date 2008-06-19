package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.PresentationApplication;
	
	public class PresentationApplicationTest extends TestCase
	{
		private var test:PresentationApplication;
		
		public function PresentationApplicationTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new PresentationApplicationTest("testConstructor"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new PresentationApplication(4, "room", "host", "service");
		}
		
		override public function tearDown():void{
			
		}
		
		public function testConstructor():void{
			assertTrue(test != null);	
		}

	}
}