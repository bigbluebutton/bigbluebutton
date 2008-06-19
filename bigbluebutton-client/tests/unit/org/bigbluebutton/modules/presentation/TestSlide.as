package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.vo.Slide;
	
	public class TestSlide extends TestCase
	{
		private var test:Slide;
		
		public function TestSlide(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestSlide("testSlide"));
			
			return ts;
		}
		
		public function testSlide():void{
			assertTrue(test == null);
			test = new Slide();
			assertTrue(test != null);
			assertTrue(test.name == null);
			assertTrue(test.source == null);
			assertTrue(test.title == null);
		}

	}
}