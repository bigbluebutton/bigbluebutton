package org.bigbluebutton.modules.presentation
{
	import flash.net.FileReference;
	import flash.net.URLRequest;
	
	public class MockFileReference extends FileReference
	{
		public function MockFileReference()
		{
		}
		
		override public function upload(request:URLRequest, uploadDataFieldName:String="Filedata", testUpload:Boolean=false):void{
			
		}

	}
}