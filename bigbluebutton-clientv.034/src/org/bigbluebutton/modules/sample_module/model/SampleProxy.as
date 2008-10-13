package org.bigbluebutton.modules.sample_module.model
{
	import org.bigbluebutton.modules.sample_module.SampleFacade;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The job of the proxy class is to communicate with web services and manipulate data objects. This proxy is a very simple one,
	 * just to show you roughly how it functions. 
	 * @author Denis
	 * 
	 */	
	public class SampleProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "SampleProxy";
		
		public function SampleProxy(data:String)
		{
			super(NAME, data);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
		}
		
		override public function getData():Object{
			return data as String;
		}
		
		public function test():void{
			sendNotification(SampleFacade.TEST, getData());
		}

	}
}