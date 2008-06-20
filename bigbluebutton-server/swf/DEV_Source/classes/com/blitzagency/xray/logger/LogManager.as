import com.blitzagency.xray.logger.ClassLoader;
import com.blitzagency.xray.util.MtascUtility;
/**
 * @author John Grden
 */
class com.blitzagency.xray.logger.LogManager
{
	public static var CLASS_REF = com.blitzagency.xray.logger.LogManager;
	public static var initialized:Boolean;
	
	private static var loggerList:Object;
	
	
	public static function initialize():Void
	{
		if(initialized) return;
		MtascUtility.initialize();
		loggerList = new Object();
		initialized = true;
	}
	
	public static function getLogger(p_logger:String):Object
	{
		// initialize loggers object if not done so already
		var package:String = p_logger.split(".").join("_");
		if(loggerList[package].instance != undefined)
		{
			// if instance already exists, pass it back
			return loggerList[package].instance;
		}
		else
		{
			// grag logger class
			var loggerObject = ClassLoader.getClassByName(p_logger);
			
			// create new instance
			var instance:Object = new loggerObject();
			
			// update list
			loggerList[package] = new Object();
			loggerList[package].instance = instance;
			
			// return logger instance
			return instance;
		}
	}
}