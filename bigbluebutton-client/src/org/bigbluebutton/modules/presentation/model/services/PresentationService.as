package org.bigbluebutton.modules.presentation.model.services
{
	import flash.events.*;
	
	import mx.rpc.IResponder;
	import mx.rpc.http.HTTPService;
	
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	        	
	/**
	 * This class directly communicates with an HTTP service in order to send and recives files (slides
	 * in this case)
	 * <p>
	 * This class extends the Proxy class of the pureMVC framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	        	
	public class PresentationService extends Proxy implements IProxy
	{
		public static const ID:String = "PresentationService";
		    
		private var service : HTTPService;
		
		private var responder : IResponder;
		
		/**
		 * The default constructor 
		 * @param url - the address of the HTTP service
		 * @param responder - A responer, in this case a PresentationApplication class
		 * 
		 */		
		public function PresentationService(url:String, responder : IResponder)
		{
			super(ID);
			service = new HTTPService();
			this.responder = responder;
			load(url);
		}
		
		/**
		 * Load slides from an HTTP service. Response is received in the Responder class' onResult method 
		 * @param url
		 * 
		 */		
		public function load(url : String) : void
		{
			service.url = url;
			
			var call : Object = service.send();
			call.addResponder(responder);
			
		}
	}
}