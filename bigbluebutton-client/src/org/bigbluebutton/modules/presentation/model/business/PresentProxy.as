package org.bigbluebutton.modules.presentation.model.business
{
	import flash.net.FileReference;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.model.services.FileUploadService;
	import org.bigbluebutton.modules.presentation.model.services.PresentationService;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class PresentProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "PresentProxy";
		
		private var _module:PresentationModule;
		private var _mode:String = PresentModuleConstants.VIEWER_MODE;
		private var _presentationLoaded:Boolean = false;
		
		private var _slides:IPresentationSlides = new PresentationSlides();
		private var _presentService:IPresentService;
		// Is teh disconnection due to user issuing the disconnect or is it the server
		// disconnecting due to t fault?
		private var manualDisconnect:Boolean = false;
		 
		public function PresentProxy(module:IBigBlueButtonModule)
		{
			super(NAME);
			_module = module as PresentationModule;
		}

		public function connect():void {
			_presentService = new PresentSOService(_module, _slides);
			_presentService.addConnectionStatusListener(connectionStatusListener);
			_presentService.addMessageSender(messageSender);
			manualDisconnect = false;
			_presentService.connect();
		}
		
		public function stop():void {
			// USer is issuing a disconnect.
			manualDisconnect = true;
			_presentService.disconnect();
		}
		
		public function get mode():String {
			return _mode;
		}
		
		public function presenterMode(presenterMode:Boolean):void {
			if (presenterMode) {
				_mode = PresentModuleConstants.PRESENTER_MODE;
			} else {
				_mode = PresentModuleConstants.VIEWER_MODE;
			}
		}
		
		public function get slides():ArrayCollection {
			return _slides.slides;
		}
		
		public function isPresenter():Boolean {
			return _mode == PresentModuleConstants.PRESENTER_MODE;
		}
		
		private function connectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (connected) {
				sendNotification(PresentModuleConstants.CONNECTED);
			} else {
				sendNotification(PresentModuleConstants.DISCONNECTED, {manual:manualDisconnect, errors:errors});
			}
		}
		
		private function messageSender(msg:String, body:Object=null):void {
			sendNotification(msg, body);
		}

		/**
		 * Upload a presentation to the server 
		 * @param fileToUpload - A FileReference class of the file we wish to upload
		 * 
		 */		
		public function uploadPresentation(presentationName:String, fileToUpload:FileReference) : void
		{
			LogUtil.debug("PresentationApplication::uploadPresentation()... ");
			var fullUri:String = _module.host + "/bigbluebutton/presentation/upload";
						
			var service:FileUploadService = new FileUploadService(fullUri, presentationName, _module.conference, _module.room);
			service.addProgressListener(uploadProgressListener);
			LogUtil.debug("using  FileUploadService..." + fullUri);
			service.upload(presentationName, fileToUpload);
		}

		public function assignPresenter(assignTo:Number, name:String):void {
			_presentService.assignPresenter(assignTo, name, _module.userid);
		}
		
		/**
		 * Loads a presentation from the server. creates a new PresentationService class 
		 * 
		 */		
		public function loadPresentation(presentationName:String) : void
		{
			LogUtil.debug("PresentProxy::loadPresentation: presentationName=" + presentationName);
			var fullUri : String = _module.host + "/bigbluebutton/presentation/" + _module.conference + "/" + _module.room + "/" + presentationName+"/slides";	
			var slideUri:String = _module.host + "/bigbluebutton/presentation/" + _module.conference + "/" + _module.room + "/" + presentationName;
			
			LogUtil.debug("PresentationApplication::loadPresentation()... " + fullUri);

			var service:PresentationService = new PresentationService();
			service.addLoadPresentationListener(loadPresentationListener);
			service.load(fullUri, _slides, slideUri);
			LogUtil.debug('number of slides=' + _slides.size());
		}	

		public function sharePresentation(share:Boolean, presentationName:String):void {
			LogUtil.debug("PresentationProxy::sharePresentation()... presentationName=" + presentationName);
			_presentService.sharePresentation(share, presentationName);
		}

		public function clearPresentation():void {
			_presentService.clearPresentation();
		}
		
		public function setPresenterName(presenterName:String):void {
			_presentService.setPresenterName(presenterName);
		}
		
		public function gotoSlide(num:int):void {
			sendNotification(PresentModuleConstants.DISPLAY_SLIDE,num);
			sendNotification(PresentModuleConstants.SYNC_ZOOM);
			if (isPresenter()) {
				_presentService.gotoSlide(num);
			}
		}
		
		public function get presentationLoaded():Boolean {
			return _presentationLoaded;
		}
		
		public function getCurrentSlideNumber():void {
			_presentService.getCurrentSlideNumber();
		}
		
		public function zoom(xPercent:Number, yPercent:Number):void {
			_presentService.zoom(xPercent, yPercent);
		}
		
		public function move(xOffset:Number, yOffset:Number):void {
			_presentService.move(xOffset, yOffset);
		}
		
		public function loadPresentationListener(loaded:Boolean, presentationName:String):void {
			if (loaded) {
				LogUtil.debug('presentation has been loaded  presentationName=' + presentationName);
				_presentationLoaded = true;
				sendNotification(PresentModuleConstants.PRESENTATION_LOADED, presentationName);
			} else {
				LogUtil.debug('failed to load presentation');
				_presentationLoaded = false;
			}
		}
		
		private function uploadProgressListener(code:String, message:Object=null):void {
			LogUtil.debug('Fileupload progress ' + code + ":" + message);
			sendNotification(code, message);
		}			
		
		public function getPresentationNames():Array{
			return PresentSOService(_presentService).getPresentationNames();
		}
		
	}
}