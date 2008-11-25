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
	import org.bigbluebutton.modules.presentation.model.SlideProxy;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.FileUploadWindow;
	import org.bigbluebutton.modules.presentation.view.components.PresentationWindow;
	import org.bigbluebutton.modules.presentation.view.components.ThumbnailWindow;
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
			_presWin.addEventListener(OPEN_THUMBNAIL, onOpenThumbnail);
		}
		
		private function resetSlidePosition():void {
			_presWin.slideView.myLoader.percentHeight = 100;
			_presWin.slideView.myLoader.percentWidth = 100;
			_presWin.slideView.myLoader.x = 1;
			_presWin.slideView.myLoader.y = 1;
			
		}
		
		private function onKeyPressed(event:KeyboardEvent):void {
			switch (event.keyCode) {
				case Keyboard.LEFT:				
					gotoPreviousSlide();		
				break;
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
					PresentModuleConstants.THUMBNAIL_WINDOW_CLOSE,
					PresentModuleConstants.CLEAR_EVENT
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
					handleStartShareEvent();
					break;
				case PresentModuleConstants.READY_EVENT:
					handleReadyEvent();
					break;
				case PresentModuleConstants.PRESENTATION_LOADED:
					handlePresentationLoadedEvent();
					break;
				case PresentModuleConstants.PRESENTER_MODE:
					handlePresenterMode();
					break;
				case PresentModuleConstants.VIEWER_MODE:
					handleViewerMode();
					break;
				case PresentModuleConstants.OPEN_PRESENT_WINDOW:
		   			_presWin.height = 440;
		   			_presWin.width = 450;
		   			_presWin.title = PresentationWindow.TITLE;
		   			_presWin.showCloseButton = false;	
		   			_presWin.xPosition = 240;
		   			_presWin.yPosition = 20;
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
				case PresentModuleConstants.THUMBNAIL_WINDOW_CLOSE:
					removeThumbnailPopup();
					break;
			}
		}
	
		private function handleDisplaySlide(slidenum:int):void {
			trace('DISPLAY_SLIDE in PresentationWindowMediator ' + slidenum);
			if ((_presWin.slideView.slides != null) && (slidenum >= 0) && (slidenum < _presWin.slideView.slides.length)) {
				_presWin.slideView.selectedSlide = slidenum;
				_presWin.slideNumLbl.text = (slidenum + 1) + " of " + _presWin.slideView.slides.length;
				//_presWin.slideView.myLoader.load(_presWin.slideView.slides.getItemAt(slidenum));
				
				var slideProxy:SlideProxy = facade.retrieveProxy(SlideProxy.NAME) as SlideProxy;
				slideProxy.load(slidenum, _presWin.slideView.slides.getItemAt(slidenum) as String);
				
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
		
		private function handlePresenterMode():void
		{			
			_presWin.uploadPres.visible = true;
			
			proxy.presenterMode(true);
			if (proxy.presentationLoaded) {
            	_presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;	
				_presWin.backButton.visible = true;
				_presWin.forwardButton.visible = true;	
				_presWin.thumbnailBtn.visible = true;	
			}
		}

		private function handleViewerMode():void
		{			
			_presWin.uploadPres.visible = false;
			_presWin.thumbnailBtn.visible = false;
			proxy.presenterMode(false);
			if (proxy.presentationLoaded) {
            	_presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;	
				_presWin.backButton.visible = false;
				_presWin.forwardButton.visible = false;		
			}
			removeFileUploadPopup();
			removeThumbnailPopup();
		}
				
		private function handleStartShareEvent():void
		{	
			if (! proxy.isPresenter()) {
				proxy.loadPresentation();
			}
		}
				
		private function handleReadyEvent():void
		{			
			proxy.loadPresentation();
		}

		private function handleClearPresentation():void
		{			
			_presWin.slideView.visible = false;		
			_presWin.slideView.selectedSlide = 0;
			_presWin.slideNumLbl.text = "";
			if (facade.hasProxy(SlideProxy.NAME)) {
				var sp:SlideProxy = facade.retrieveProxy(SlideProxy.NAME) as SlideProxy;
				sp.clear();
			}
			
			if ( ! facade.hasMediator( SlideViewMediator.NAME ) ) {
				facade.registerMediator(new SlideViewMediator(_presWin.slideView ));
			}		

		}

		private function handlePresentationLoadedEvent():void
		{	
			_presWin.slideView.slides = proxy.slides;         	
            _presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;		
			_presWin.slideView.visible = true;		

			if (facade.hasProxy(SlideProxy.NAME)) {
				var sp:SlideProxy = facade.retrieveProxy(SlideProxy.NAME) as SlideProxy;
				sp.clear();
			}
			
			if ( ! facade.hasMediator( SlideViewMediator.NAME ) ) {
				facade.registerMediator(new SlideViewMediator(_presWin.slideView ));
			}		
				
			if (proxy.isPresenter()) {
				// Remove the uploadWindow
				PopUpManager.removePopUp(_presWin.uploadWindow);
				// Remove the mediator	
				facade.removeMediator(FileUploadWindowMediator.NAME);
				
				_presWin.backButton.visible = true;
				_presWin.forwardButton.visible = true;
				_presWin.thumbnailBtn.visible = true;
				proxy.sharePresentation(true);
				proxy.gotoSlide(0);
			} else {
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

		}
				
		protected function openFileUploadWindow(e:Event) : void{
            _presWin.uploadWindow = FileUploadWindow(PopUpManager.createPopUp( _presWin, FileUploadWindow, false));
			
			var point1:Point = new Point();
            // Calculate position of TitleWindow in Application's coordinates. 
            point1.x = _presWin.slideView.x;
            point1.y = _presWin.slideView.y;                
            point1 = _presWin.slideView.localToGlobal(point1);
            _presWin.uploadWindow.x = point1.x + 25;
            _presWin.uploadWindow.y = point1.y + 25;
            
            if ( ! facade.hasMediator( FileUploadWindowMediator.NAME ) ) {
            	facade.registerMediator(new FileUploadWindowMediator( _presWin.uploadWindow ));
            } 
        }

		private function removeThumbnailPopup():void{
			if (_presWin.thumbnailWindow != null) {
				//Remove the upload window
				PopUpManager.removePopUp(_presWin.thumbnailWindow);
				//Remove the mediator
				facade.removeMediator(ThumbnailWindowMediator.NAME);
				_presWin.thumbnailBtn.enabled = true;	
				_presWin.thumbnailWindow = null;			
			}
		}

		protected function onOpenThumbnail(e:Event) : void{
            _presWin.thumbnailWindow = ThumbnailWindow(PopUpManager.createPopUp( _presWin, ThumbnailWindow, false));
			_presWin.thumbnailWindow.slides = _presWin.slideView.slides;
			_presWin.thumbnailWindow.slideList.selectedIndex = _presWin.slideView.selectedSlide;
			
			var point1:Point = new Point();
            // Calculate position of TitleWindow in Application's coordinates. 
            point1.x = _presWin.slideView.x;
            point1.y = _presWin.slideView.y;                
            point1 = _presWin.slideView.localToGlobal(point1);
            _presWin.thumbnailWindow.x = point1.x + 25;
            _presWin.thumbnailWindow.y = point1.y + 25;
            _presWin.thumbnailBtn.enabled = false;
            
            if ( ! facade.hasMediator( FileUploadWindowMediator.NAME ) ) {
            	facade.registerMediator(new ThumbnailWindowMediator( _presWin.thumbnailWindow ));
            } 
        }

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
	}
}
