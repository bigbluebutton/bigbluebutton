package tests.main
{
	import org.flexunit.Assert;

	public class TestCase1
	{
		private var count:int = 0;
		
		[Before]
		public function runBeforeEveryTest():void{
			count = 10;
		}
		
		[After]
		public function runAfterEveryTest():void{
			count = 0;
		}
		
		[Test]
		public function subtraction():void{
			Assert.assertEquals(8, count - 2);
		}
	}
}