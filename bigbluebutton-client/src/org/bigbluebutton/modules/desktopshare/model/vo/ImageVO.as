package org.bigbluebutton.modules.desktopshare.model.vo
{
	import flash.utils.ByteArray;
	
	public class ImageVO
	{
		public var userid:String;
		public var room:String;
		public var host:String;
		public var imageString:String;
		public var stringArray:Array = new Array(["","","","","",""],["","","","","",""],["","","","","",""],
		["","","","","",""],["","","","","",""],["","","","","",""]);
		public var imageByteArray:ByteArray;
		public var row:Number;
		public var column:Number;
		public var tilewidth:Number;
		public var tileheight:Number;
		public var isSharing:Boolean = false;
		
		public function ImageVO(imageString:String)
		{
			this.imageString = imageString;
			this.column = 0;
			this.row = 0;
			
			for(var i:int = 0; i<6; i++)
			{
				for(var j:int = 0; j<6; j++)
				{
					stringArray[i][j]= "Nothing";
					//trace(stringArray[i][j]+"\n");
				}
			}
		
		}

	}
}