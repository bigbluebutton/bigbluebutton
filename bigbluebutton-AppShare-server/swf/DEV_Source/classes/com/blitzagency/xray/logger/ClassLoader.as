/**
 * @author John Grden
 */
class com.blitzagency.xray.logger.ClassLoader
{
	public static var CLASS_REF = com.blitzagency.xray.logger.ClassLoader;
	
	public static var initialized:Boolean = initialize();
	
	private static function initialize():Boolean
	{
		initializeClasses();
		return true;
	}
	
	public static function getClassByName(name:String):Function 
	{
		if(!initialized) initialize();
		var clazz:Function = eval('_global.'+name);
		return clazz;
	}
	
	public static function getInstanceByName(name:String, args:Array):Object 
	{
		if(!initialized) initialize();
		var clazz:Function = getClassByName(name);
		if(args==undefined) args = new Array();
		var result:Object = new Object();
		result.__proto__ = clazz.prototype;
		clazz.apply(result, args);
		return result;
	}
	
	/**
	 * References all of the classes that need to be loaded dynamically. This could eventually be
	 * replaced with Simon Wacker's Ant Script that loads all needed classes via MTASC from 
	 * a Spring context.xml file. This is not yet production ready at this time (May 24, 2006)
	 */
	public static function initializeClasses():Void
	{
		//_global.trace("initializeClasses called");
		var obj = com.blitzagency.xray.logger.XrayLogger;
		//obj = com.blitzagency.xray.logger.asUnitLogger;
	}
}