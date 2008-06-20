/**
 * Used to initialise the Xray Connector Only Package
 * as a Singleton called by other classes.
 * 
 * @author Chris Allen	chris@cnmpro.com
 * @author John Grden johng@acmewebworks.com
 * @author Karina Steffens karina@neo-archaic.net
 */

import com.blitzagency.xray.util.XrayLoader;

class com.blitzagency.xray.util.XrayConnect
{

	private static var instance:XrayConnect;
	
	function XrayConnect(containerClip:MovieClip, showFPS:Boolean)
	{
		init(containerClip, showFPS);
	}

	/**
	 * Main entry point into the application.
	 */
	static public function getInstance(containerClip:MovieClip,showFPS:Boolean):XrayConnect
	{
	 if (XrayConnect.instance == undefined)
	 {
 		  XrayConnect.instance = new XrayConnect(containerClip,showFPS);
	  }
	  return  XrayConnect.instance;	  
	}

	/**
	 * The method to run when the Connector.adminToolLoadComplete event is triggered.
	 * Connector.trace, Connector.tt, Connector.tf are setup here to pass arguments to the admintool
	 */
	public function LoadComplete()
    {
		var ttExists:Boolean = _global.tt ? true : false;
		var tfExists:Boolean = _global.tf ? true : false;
		if (ttExists && tfExists){
			_global.tt("Xray Connector Loaded")
		}
	}

	private function init(containerClip:MovieClip, showFPS:Boolean):Void
	{
		XrayLoader.addEventListener("LoadComplete", this);
    	XrayLoader.loadConnector("XrayConnector.swf", containerClip, showFPS);
	}
}

