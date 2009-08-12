/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.presentation.view
{
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.geom.Point;
	import flash.ui.Keyboard;
	
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.controller.MoveSlideCommand;
	import org.bigbluebutton.modules.presentation.controller.ZoomSlideCommand;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	import org.bigbluebutton.modules.presentation.model.Slide;
	import org.bigbluebutton.modules.presentation.model.SlideProxy;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.FileUploadWindow;
	import org.bigbluebutton.modules.presentation.view.components.PresentationWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * This class is a Mediator class of the PresentationWindow GUI component 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PresentationWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PresentationWindowMediator";
		
		public static const PREVIOUS_SLIDE:String = "PREVIOUS_SLIDE";
		public static const NEXT_SLIDE:String = "NEXT_SLIDE";
		public static const OPEN_THUMBNAIL:String = "OPEN_THUMBNAIL";
		public static const RESET_ZOOM:String = "RESET_ZOOM";
		
		public static const CONNECT:String = "Connect to Presentation";
		public static const SHARE:String = "Share Presentation";
		public static const OPEN_UPLOAD:String = "Open File Upload Window"
		public static const UNSHARE:String = "Unshare Presentation";
		public static const MAXIMIZE:String = "Maximize Presentation";
		public static const RESTORE:String = "Restore Presentation";
		
		private var _module:IBigBlueButtonModule;
		private var _presWin:PresentationWindow = new PresentationWindow();
		
	
		/**
		 * The constructor. Registers the view component with this mediator 
		 * @param view
		 * 
		 */		
		public function PresentationWindowMediator(module:IBigBlueButtonModule)
		{
			super(NAME);
			_module = module;	
			_presWin.addEventListener(KeyboardEvent.KEY_UP, onKeyPressed);		
			_presWin.addEventListener(OPEN_UPLOAD, openFileUploadWindow);
			_presWin.addEventListener(PREVIOUS_SLIDE, onPreviousSlide);
			_presWin.addEventListener(NEXT_SLIDE, onNextSlide);
			_presWin.addEventListener(RESET_ZOOM, onResetZoom);
		}
		
		private function resetSlidePosition():void {
			_presWin.slideView.myLoader.percentHeight = 100;
			_presWin.slideView.myLoader.percentWidth = 100;
			_presWin.slideView.myLoader.x = 1;
			_presWin.slideView.myLoader.y = 1;
			
		}
		
		private function onKeyPressed(event:KeyboardEvent):void {
			//Alert.show("Key Pressed");
			switch (event.keyCode) {
				case Keyboard.LEFT:	
				case Keyboard.DOWN:			
					gotoPreviousSlide();		
				break;
				case Keyboard.UP:
				case Keyboard.RIGHT: 
				case Keyboard.SPACE:
					gotoNextSlide();
				break; 
			}
		}
		
		private function onPreviousSlide(e:Event) : void{
			gotoPreviousSlide();
		}
		
		private function onNextSlide(e:Event) : void{
			gotoNextSlide();						
		}
			
		private function gotoPreviousSlide():void {
			// resetSlidePosition();
			if (_presWin.slideView.selectedSlide > 0) {
				facade.sendNotification(PresentModuleConstants.GOTO_SLIDE, 
					_presWin.slideView.selectedSlide - 1);
			}
		}	
			
		private function gotoNextSlide():void {
			// resetSlidePosition();
			if (_presWin.slideView.selectedSlide < _presWin.slideView.slides.length - 1) {
				facade.sendNotification(PresentModuleConstants.GOTO_SLIDE, 
					_presWin.slideView.selectedSlide + 1);
			}
		}	
			
		/**
		 *  
		 * @return A list of the notifications this class listens to
		 * This class listens to:
		 * 	PresentationFacade.READY_EVENT
		 * 	PresentationFacade.VIEW_EVENT
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.READY_EVENT,
					PresentModuleConstants.OPEN_PRESENT_WINDOW,
					PresentModuleConstants.CLOSE_PRESENT_WINDOW,
					PresentModuleConstants.PRESENTATION_LOADED,
					PresentModuleConstants.START_SHARE,
					PresentModuleConstants.DISPLAY_SLIDE,
					PresentModuleConstants.PRESENTER_MODE,
					PresentModuleConstants.VIEWER_MODE,
					PresentModuleConstants.REMOVE_UPLOAD_WINDOW,
					PresentModuleConstants.CLEAR_EVENT,
					PresentModuleConstants.PRESENTER_NAME
					];
		}
		
		/**
		 * Handles a received notification 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PresentModuleConstants.START_SHARE:
					handleStartShareEvent(notification.getBody() as String);
					break;
				case PresentModuleConstants.READY_EVENT:
					handleReadyEvent(notification.getBody());
					break;
				case PresentModuleConstants.PRESENTATION_LOADED:
					handlePresentationLoadedEvent(notification.getBody() as String);
					break;
				case PresentModuleConstants.PRESENTER_MODE:
					handlePresenterMode(notification.getBody().presenterName);
					break;
				case PresentModuleConstants.VIEWER_MODE:
					handleViewerMode();
					break;
				case PresentModuleConstants.OPEN_PRESENT_WINDOW:
		   			_presWin.height = 450;
		   			_presWin.width = 450;
		   			_presWin.title = PresentationWindow.TITLE;
		   			_presWin.showCloseButton = false;	
		   			_presWin.xPosition = 220;
		   			_presWin.yPosition = 0;
		   			facade.sendNotification(PresentModuleConstants.ADD_WINDOW, _presWin);		   							
					break;
				case PresentModuleConstants.CLOSE_PRESENT_WINDOW:
					facade.sendNotification(PresentModuleConstants.REMOVE_WINDOW, _presWin);
					break;
				case PresentModuleConstants.DISPLAY_SLIDE:
					var slidenum:int = notification.getBody() as int;
					handleDisplaySlide(slidenum);
					break;
				case PresentModuleConstants.CLEAR_EVENT:
					handleClearPresentation();
				break;
				case PresentModuleConstants.REMOVE_UPLOAD_WINDOW:
					removeFileUploadPopup();
					break;
				case PresentModuleConstants.PRESENTER_NAME:
					displayPresenterName(notification.getBody() as String);
					break;
			}
		}
	
		private function  displayPresenterName(presenterName:String):void {
			if (! proxy.isPresenter()) {
				_presWin.presenterNameLabel.text = presenterName + " is currently presenting.";
				_presWin.presenterNameLabel.visible = true;
			} else {
				_presWin.presenterNameLabel.text = "";
				_presWin.presenterNameLabel.visible = false;
			}
		}
		
		private function resetPositionAndSize():void {
			_presWin.slideView.myLoader.width = _presWin.slideView.imageCanvas.width;
			_presWin.slideView.myLoader.height = _presWin.slideView.imageCanvas.height;
			_presWin.slideView.myLoader.x = 0;
			_presWin.slideView.myLoader.y = 0;			
		}
		
		private function handleDisplaySlide(slidenum:int):void {
			if ((_presWin.slideView.slides != null) && (slidenum >= 0) && (slidenum < _presWin.slideView.slides.length)) {
				
				//Disable for now.
				//resetPositionAndSize();
				
				_presWin.slideView.selectedSlide = slidenum;
				_presWin.slideNumLbl.text = (slidenum + 1) + " of " + _presWin.slideView.slides.length;
				
				var slideProxy:SlideProxy = facade.retrieveProxy(SlideProxy.NAME) as SlideProxy;
				slideProxy.load(_presWin.slideView.slides.getItemAt(slidenum) as Slide);
				
				if (slidenum == 0) {
					_presWin.backButton.enabled = false;
				} else {
					_presWin.backButton.enabled = true;
				}
				
				if (slidenum < _presWin.slideView.slides.length - 1) {
					_presWin.forwardButton.enabled = true;
				} else {
					_presWin.forwardButton.enabled = false;
				}
			}			
		}
		
		private function handlePresenterMode(presenterName:String):void
		{			
			_presWin.uploadPres.visible = true;
			
			proxy.presenterMode(true);
			proxy.setPresenterName(presenterName);
			if (proxy.presentationLoaded) {
            	_presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;	
				_presWin.backButton.visible = true;
				_presWin.forwardButton.visible = true;	
				_presWin.zoomSlider.visible = true;

				//Initialize the thumbnails mediator
				if ( ! facade.hasMediator( ThumbnailViewMediator.NAME ) ) {
	            	facade.registerMediator(new ThumbnailViewMediator( _presWin.thumbnailWindow ));
	            } 
	           	_presWin.thumbnailWindow.setFisheyeVisibility(true);
			}
		}

		private function handleViewerMode():void
		{			
			_presWin.uploadPres.visible = false;
			proxy.presenterMode(false);
			if (proxy.presentationLoaded) {
            	_presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;	
				_presWin.backButton.visible = false;
				_presWin.forwardButton.visible = false;	
				_presWin.zoomSlider.visible = false;	

				//Initialize the thumbnails mediator
				if ( facade.hasMediator( ThumbnailViewMediator.NAME ) ) {
					facade.removeMediator(ThumbnailViewMediator.NAME)
	            }
	           	_presWin.thumbnailWindow.setFisheyeVisibility(false);
			}
			removeFileUploadPopup();
		}
				
		private function handleStartShareEvent(presentationName:String):void
		{	
			if (! proxy.isPresenter())
			{
				LogUtil.debug("\n\nPresentationWindowMediator::handleStartShareEvent()... presentationName=" + presentationName + "  proxy.isPresenter()=" + proxy.isPresenter() + "\n"); 
				proxy.loadPresentation(presentationName);
			}
		}
				
		private function handleReadyEvent(info:Object):void
		{			
			proxy.loadPresentation(String(info["presentationName"]));
			
			//Initialize the thumbnails mediator
			if ( ! facade.hasMediator( ThumbnailViewMediator.NAME ) ) {
            	facade.registerMediator(new ThumbnailViewMediator( _presWin.thumbnailWindow ));
            } 
            _presWin.thumbnailWindow.setFisheyeVisibility(true);
		}

		private function handleClearPresentation():void
		{			
			_presWin.slideView.visible = false;		
			_presWin.slideView.selectedSlide = 0;
			_presWin.slideNumLbl.text = "";
			_presWin.presenterNameLabel.text = "";
			_presWin.presenterNameLabel.visible = false;
			if (facade.hasProxy(SlideProxy.NAME)) {
				var sp:SlideProxy = facade.retrieveProxy(SlideProxy.NAME) as SlideProxy;
				sp.clear();
			}
			
			if ( ! facade.hasMediator( SlideViewMediator.NAME ) ) {
				facade.registerMediator(new SlideViewMediator(_presWin.slideView ));
			}		

		}

		private function handlePresentationLoadedEvent(presentationName:String):void
		{	
			LogUtil.debug('PresentationWindowMediator::handlePresentationLoadedEvent()...presentationName=' + presentationName);

			_presWin.slideView.slides = proxy.slides;         	
            _presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;		
			_presWin.slideView.visible = true;		
			_presWin.btnResetZoom.visible = true;
			_presWin.zoomSlider.visible = true;

			if (facade.hasProxy(SlideProxy.NAME)) {
				var sp:SlideProxy = facade.retrieveProxy(SlideProxy.NAME) as SlideProxy;
				sp.clear();
			}
			
			if ( ! facade.hasMediator( SlideViewMediator.NAME ) ) {
				facade.registerMediator(new SlideViewMediator(_presWin.slideView ));
			}		
				
			if (proxy.isPresenter()) 
			{
				removeFileUploadPopup();
				
				_presWin.backButton.visible = true;
				_presWin.forwardButton.visible = true;
				_presWin.zoomSlider.visible = true;
			
				LogUtil.debug('PresentationWindowMediator::handlePresentationLoadedEvent()..._presWin.thumbnailWindow.fisheye.selectedIndex has been set to 0');
				_presWin.thumbnailWindow.fisheye.selectedIndex = 0; // Initialize to prevent ArrayIndexException

				proxy.sharePresentation(true, presentationName);
				proxy.gotoSlide(0);
				
				_presWin.thumbnailWindow.setDataProvider(_presWin.slideView.slides);
				_presWin.isPresenter = true;
				
				if (facade.hasMediator( ThumbnailViewMediator.NAME ) ) {
	    	       	_presWin.thumbnailWindow.setFisheyeVisibility(true);
            	} 

			} else 
			{
				proxy.getCurrentSlideNumber();
			}
		}
		
		private function removeFileUploadPopup():void{
			if (_presWin.uploadWindow != null) {
				//Remove the upload window
				PopUpManager.removePopUp(_presWin.uploadWindow);
				//Remove the mediator
				facade.removeMediator(FileUploadWindowMediator.NAME);	
				_presWin.uploadWindow = null;			
			}

			if (facade.hasMediator( ThumbnailViewMediator.NAME ) ) {
	           	_presWin.thumbnailWindow.setFisheyeVisibility(true);
            } 
		}
				
		protected function openFileUploadWindow(e:Event) : void
		{
			if (_presWin.uploadWindow != null) return;
			
            //_presWin.uploadWindow = FileUploadWindow(PopUpManager.createPopUp( _presWin, FileUploadWindow, false));
			_presWin.uploadWindow = new FileUploadWindow();
			_presWin.uploadWindow.presentationNames = proxy.getPresentationNames();
			mx.managers.PopUpManager.addPopUp(_presWin.uploadWindow, _presWin, false);
			
			var point1:Point = new Point();
            // Calculate position of TitleWindow in Application's coordinates. 
            point1.x = _presWin.slideView.x;
            point1.y = _presWin.slideView.y;                
            point1 = _presWin.slideView.localToGlobal(point1);
            _presWin.uploadWindow.x = point1.x + 25;
            _presWin.uploadWindow.y = point1.y + 25;
            //_presWin.uploadWindow.presentationNames = proxy.getPresentationNames();
            if ( ! facade.hasMediator( FileUploadWindowMediator.NAME ) ) {
            	facade.registerMediator(new FileUploadWindowMediator( _presWin.uploadWindow ));
            } 

            //Initialize the thumbnails mediator
			if (facade.hasMediator( ThumbnailViewMediator.NAME ) ) {
            	//facade.removeMediator(ThumbnailViewMediator.NAME);
	           	_presWin.thumbnailWindow.setFisheyeVisibility(false);
            } 
        }
        
        protected function onResetZoom(e:Event):void{
        	_presWin.zoomSlider.value = 100;
        	sendNotification(ZoomSlideCommand.ZOOM_SLIDE_COMMAND, new ZoomNotifier(1,1));
        	sendNotification(MoveSlideCommand.MOVE_SLIDE_COMMAND, new MoveNotifier(0,0));
        }

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
		
		public function getXPos():Number{
			return _presWin.slideView.myLoader.x;
		}
		
		public function getYPos():Number{
			return _presWin.slideView.myLoader.y;
		}
	}
}
