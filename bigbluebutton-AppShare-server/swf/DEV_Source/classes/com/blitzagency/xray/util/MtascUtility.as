//import com.blitzagency.xray.logger.XrayLogger;
import com.blitzagency.xray.logger.LogManager;
import com.blitzagency.xray.logger.Log;

/**
 * @author Chris Allen mrchrisallen@gmail.com
 * @author John Grden neoriley@gmail.com
 */
class com.blitzagency.xray.util.MtascUtility 
{
	public static var initialized:Boolean = initialize();
	
	private static var logger:Object; // XrayLogger
	
	public static function initialize():Boolean
	{
		// i added this method to force it's compiling with the xray connector
		return true;
	}
	
	public static function trace(log:Log, fullClassName:String, fileName:String, lineNumber:Number):Void
	{
		/*
		* NOTES:
		* 
		* 	A trace statement should now look like:
		* 
		*        trace(log.debug(message, dump));
		* 
		* 	then, when received here, take msg properties and deal with it.
		* 
		*   resulting output is like this:
		* 
		* 	com.blitzagency.Main::run : line 32
			What's obj got?
			John: [Object]
				phone: ring
		*/
		
		if(logger == undefined) 
		{
			logger = LogManager.getLogger("com.blitzagency.xray.logger.XrayLogger");
		}
		
		// check for items missing.  we do this to account for someone just doing trace(obj) or trace(string)
		var softMessage:String = "";
		var level:Number = 0;
		var dump:Object;
		if(typeof(log) == "string")
		{
			softMessage = String(log);
		}else
		{
			softMessage = log.getMessage() == undefined ? "" : log.getMessage();
			level = log.getLevel() == undefined ? 0 : log.getLevel();
			dump = log.getDump();// == undefined ? log : log.getDump();
		}
		
		// put the final message together
		var message:String =  fullClassName + " : line " + lineNumber;
		if(softMessage.length > 0) message += "\n" + softMessage;
		
		switch(level)
		{
			case 0:
				logger.debug(message, dump, fullClassName);
			break;
			
			case 1:
				logger.info(message, dump, fullClassName);
			break;
			
			case 2:
				logger.warn(message, dump, fullClassName);
			break;
			
			case 3:
				logger.error(message, dump, fullClassName);
			break;
			
			case 4:
				logger.fatal(message, dump, fullClassName);
			break;
		}
	}
}
