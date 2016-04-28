package org.bigbluebutton.web.util.i18n {
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	
	import mx.events.ModuleEvent;
	import mx.modules.IModuleInfo;
	import mx.modules.ModuleManager;
	
	/**
	 * Dispatched once module loading is complete.
	 */
	[Event(name = "ready", type = "mx.events.ModuleEvent")]
	
	/**
	 * Dispatched if an error is encountered while loading the module.
	 */
	[Event(name = "error", type = "mx.events.ModuleEvent")]
	
	/**
	 * Loads a remote module.  Specifically, this is a workaround to allow an application being run
	 * locally (not using a web server) to load a module residing on a remote server.
	 * Usually, when attemping to do so using resourceManager.loadResourceModule(),
	 * StyleManager.loadStyleDeclarations(), or IModuleInfo.load() without passing in bytes
	 * results in errors such as the following:
	 *
	 * Error: Unable to load resource module from http://aaronhardy.com/locales/en_US.swf
	 * Error: Unable to load style(SWF is not a loadable module): http://aaronhardy.com/fonts/Astroid.swf.
	 *
	 * Be aware that any module imported with this class may have access to anything within
	 * your application's security sandbox.
	 */
	public class ModuleMarshaller extends EventDispatcher {
		protected var url:String;
		
		/**
		 * Appears to need to be stored in the class scope, otherwise garbage collection
		 * wipes out some of the event handling within IModuleInfo.
		 */
		protected var module:IModuleInfo;
		
		/**
		 * Constructor.
		 * @param url The external module to load into the application.
		 */
		public function ModuleMarshaller(url:String) {
			this.url = url;
		}
		
		/**
		 * Starts the loading process by loading in the module as bytes.
		 */
		public function loadModule():URLLoader {
			var urlRequest:URLRequest = new URLRequest(url);
			var urlLoader:URLLoader = new URLLoader(urlRequest);
			urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
			urlLoader.addEventListener(Event.COMPLETE, bytesLoadedHandler);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, errorHandler);
			urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, errorHandler);
			return urlLoader;
		}
		
		/**
		 * Once the module bytes are loaded, convert them back into a module within the
		 * application's security domain.
		 */
		protected function bytesLoadedHandler(event:Event):void {
			var styleModuleBytes:ByteArray = ByteArray(URLLoader(event.target).data);
			module = ModuleManager.getModule(url);
			module.addEventListener(ModuleEvent.READY, modReadyHandler);
			module.addEventListener(ModuleEvent.ERROR, errorHandler);
			module.load(null, null, styleModuleBytes);
		}
		
		/**
		 * Once the module information is loaded, use the factory to create an instance of the
		 * module.
		 */
		protected function modReadyHandler(event:ModuleEvent):void {
			ModuleManager.getModule(url).factory.create();
			dispatchEvent(event.clone());
		}
		
		/**
		 * Reports errors that may have occurred.
		 */
		protected function errorHandler(event:Event):void {
			if (event is ModuleEvent) {
				dispatchEvent(event.clone());
			} else if (event is ErrorEvent) {
				dispatchEvent(new ModuleEvent(ModuleEvent.ERROR, false, false, 0, 0, ErrorEvent(event).text));
			}
		}
	
	}
}
