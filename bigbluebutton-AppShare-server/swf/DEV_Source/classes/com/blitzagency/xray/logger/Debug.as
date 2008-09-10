/*
    Debug class for use with bit-101 Flash Debug Panel
    See www.bit-101.com/DebugPanel
    This work is licensed under a Creative Commons Attribution 2.5 License.
    See http://creativecommons.org/licenses/by/2.5/
    
    Authors: Keith Peters and Tim Walling
    www.bit-101.com
    www.timwalling.com
	
	Modified for Xray:
	John Grden
	neoRiley@gmail.com
	www.osflash.org/xray
*/

class com.blitzagency.xray.logger.Debug
{    
	private static var xrayLC:LocalConnection;
	private static var connected:Boolean = false;
    
	
	private static function makeConnection():Void
	{
		xrayLC = new LocalConnection();
		connected = xrayLC.connect("_xray_standAlone_debug");
	}
	
	/**
     *	Traces any value to the debug panel, with an optional message level.
     *	@param pMsg The value to trace.
     *	@param pLvl Optional. The level for this message. Values are 0 through 4, or Debug.Debug, Debug.INFO, Debug.WARN, Debug.ERROR, Debug.FATAL.
     */
    public static function trace(pMsg:Object, pPackage:String, pLevel:Number):Void 
	{	
		// trace to the Flash IDE output window
		_global["trace"](pMsg);
		
		// if xray connector exists, pass the love along via xray's localconnection
		if(_global.com.blitzagency.xray.Xray.lc_info) 
		{
			_global.com.blitzagency.xray.Xray.lc_info.setTrace({trace:pMsg, level:pLevel, package:pPackage});
		}
		else
		{
			if(xrayLC == undefined) 
			{
				makeConnection();
			}

			if(connected)
			{
				var sent:Boolean = xrayLC.send("_xray_view_conn", "setTrace", pMsg, pLevel, pPackage);
			}
		}
    }

	/**
	 *	Recursively traces an object's value to the debug panel.
	 *	@param o The object to trace.
	 *	@param pRecurseDepth Optional. How many levels deep to recursively trace. Defaults to 0, which traces only the top level value.
     *	@param pIndent Optional. Number of spaces to indent each new level of recursion.
	 * 	@param pPackage - passed in via XrayLogger.  Package info sent along to Xray's interface for package filtering
     */
	public static function traceObject(o:Object, pRecurseDepth:Number, pIndent:Number, pPackage:String, pLevel:Number):Void 
	{
		var recurseDepth:Number;
		var indent:Number;
		
		if (pRecurseDepth == undefined) 
		{
			recurseDepth = 0;
		} 
		else 
		{
			recurseDepth = pRecurseDepth;
		}
		
		if (pIndent == undefined) 
		{
			indent = 0;
		} 
		else 
		{
			indent = pIndent;
		}
		
		for (var prop:String in o)
		{
			var lead:String = "";
			for (var i:Number=0; i<indent; i++) 
			{
				lead += "    ";
			}
			var obj:String = o[prop].toString();
			if (o[prop] instanceof Array) 
			{
			    obj = "[Array]";
			}
			if (obj == "[object Object]") 
			{
    			obj = "[Object]";
    		}
			Debug.trace(lead + prop + ": " + obj, pPackage, pLevel);
			if (recurseDepth > 0) 
			{
				traceObject(o[prop], recurseDepth-1, indent+1, pPackage, pLevel);
			}
		}
	}
}
