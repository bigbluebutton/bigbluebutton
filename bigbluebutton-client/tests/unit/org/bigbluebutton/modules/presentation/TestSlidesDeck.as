package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.vo.SlidesDeck;
	
	public class TestSlidesDeck extends TestCase
	{
		private var test:SlidesDeck;
		
		public function TestSlidesDeck(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestSlidesDeck("testSlidesDeck"));
			
			return ts;
		}
		
		public function testSlidesDeck():void{
			assertTrue(test == null);
			test = new SlidesDeck();
			assertTrue(test != null);
		}

	}
}