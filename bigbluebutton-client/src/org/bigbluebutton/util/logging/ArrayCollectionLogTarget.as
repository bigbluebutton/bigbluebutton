package org.bigbluebutton.util.logging
{
	import mx.collections.ArrayCollection;
	import mx.core.mx_internal;
	import mx.logging.targets.LineFormattedTarget;
	
	use namespace mx_internal;
	
	public class ArrayCollectionLogTarget extends LineFormattedTarget
	{
		private var logMessages:ArrayCollection;
		
		public static const MAX_NUM_MESSAGES:int = 2000;
		
		public function ArrayCollectionLogTarget()
		{
			super();
			this.logMessages = new ArrayCollection();
		}
		
		override mx_internal function internalLog(message:String):void {
			if (logMessages.length >= MAX_NUM_MESSAGES) {
				logMessages.removeItemAt(0);
			} 
			logMessages.addItem(message + "\n");
		}
		
		public function clear():void {
			logMessages.removeAll();
		}
		
		public function get messages():String {
			var m:String = "";
			
			for (var i:int=0; i<logMessages.length; i++) {
				m += logMessages.getItemAt(i);			
			}
			
			return m;
		}
	}
}