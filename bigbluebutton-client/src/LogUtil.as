package
{
	import mx.logging.ILogger;
	import mx.logging.Log;
	
	import org.bigbluebutton.common.Constants;
	
	public class LogUtil
	{
		private static const LOGGER:String = "BBBLOGGER";
		
		public static function debug(message:String):void
		{
			logger.debug(message);
		}

		public static function info(message:String):void
		{
			logger.info(message);
		}
		
		public static function error(message:String):void
		{
			logger.error(message);
		}

		public static function fatal(message:String):void
		{
			logger.fatal(message);
		}
		
		public static function warn(message:String):void
		{
			logger.warn(message);
		}
		
		private static function get logger():ILogger {
			return Log.getLogger(Constants.LOG_TARGET_NAME);
		}
	}
}