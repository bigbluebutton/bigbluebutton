package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.vo.DefaultSlide;
	
	public class TestDefaultSlide extends TestCase
	{
		private var test:DefaultSlide;
		
		public function TestDefaultSlide(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestDefaultSlide("testDefaultSlide"));
			
			return ts;
		}
		
		public function testDefaultSlide():void{
			assertTrue(test == null);
			test = new DefaultSlide();
			assertTrue(test != null);
			assertTrue(test.name == "Blindside Project");
			assertTrue(test.source == "assets/slides/slide-0.swf");
		}

	}
}