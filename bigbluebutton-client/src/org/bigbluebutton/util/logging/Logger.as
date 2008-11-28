package org.bigbluebutton.util.logging
{
	import mx.logging.ILogger;
	import mx.logging.Log;
	import mx.logging.LogEventLevel;
	
	import org.bigbluebutton.common.Constants;
	
	public class Logger
	{
		private var target:ArrayCollectionLogTarget = new ArrayCollectionLogTarget();
		
		public function Logger()
		{
			target.filters = ["*"];
			target.level = LogEventLevel.ALL;
			target.includeTime = true;
			target.includeDate = true;
			//target.includeCategory = true;
			target.includeLevel = true;
			logger.debug("initialization");
		}
			
		public function enableLogging(enabled:Boolean):void {
			if (enabled) {
				Log.addTarget(target);
				logger.info("Turned logging on");
			} else {
				logger.info("Turning logging off");
				Log.removeTarget(target);
			}
		}
			
		public function changeFilterTarget(newFilters:Array):void {
			logger.info("Filter change!");
			Log.removeTarget(target);
			target.filters = newFilters;
			if (target.filters == null) 
				target.filters = ["*"];
			Log.addTarget(target);
		}
		
		public function get messages():String {
			return target.messages;
		}	
		
		private static function get logger():ILogger {
			return Log.getLogger(Constants.LOG_TARGET_NAME);
		}
	}
}