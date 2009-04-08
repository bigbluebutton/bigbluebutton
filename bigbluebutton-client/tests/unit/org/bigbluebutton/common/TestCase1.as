package org.bigbluebutton.common
{
	import net.digitalprimates.fluint.tests.TestCase
	
	public class TestCase1 extends TestCase
	{
		public function testMath():void {
			var x:int = 5 + 3;
			assertEquals( 8, x );        
		}
	}
}