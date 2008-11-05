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
	import flash.geom.Point;
	
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
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
			
			_presWin.addEventListener(SHARE, sharePresentation);
			_presWin.addEventListener(OPEN_UPLOAD, openFileUploadWindow);
			_presWin.addEventListener(UNSHARE, unsharePresentation);
			_presWin.addEventListener(MAXIMIZE, maximize);
			_presWin.addEventListener(RESTORE, restore);
			_presWin.addEventListener(PREVIOUS_SLIDE, onPreviousSlide);
			_presWin.addEventListener(NEXT_SLIDE, onNextSlide);
		}
		
		private function resetSlidePosition():void {
			_presWin.slideView.myLoader.percentHeight = 100;
			_presWin.slideView.myLoader.percentWidth = 100;
			_presWin.slideView.myLoader.x = 1;
			_presWin.slideView.myLoader.y = 1;
			
		}
		private function onPreviousSlide(e:Event) : void{
			// resetSlidePosition();
			facade.sendNotification(PresentModuleConstants.GOTO_SLIDE, 
					_presWin.slideView.selectedSlide - 1);
		}
		
		private function onNextSlide(e:Event) : void{
			// resetSlidePosition();
			facade.sendNotification(PresentModuleConstants.GOTO_SLIDE, 
					_presWin.slideView.selectedSlide + 1);			
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
					PresentModuleConstants.VIEW_EVENT,
					PresentModuleConstants.MAXIMIZE_PRESENTATION,
					PresentModuleConstants.RESTORE_PRESENTATION,
					PresentModuleConstants.OPEN_PRESENT_WINDOW,
					PresentModuleConstants.CLOSE_PRESENT_WINDOW,
					PresentModuleConstants.PRESENTATION_LOADED,
					PresentModuleConstants.START_SHARE,
					PresentModuleConstants.DISPLAY_SLIDE,
					PresentModuleConstants.PRESENTER_MODE,
					PresentModuleConstants.VIEWER_MODE
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
				case PresentModuleConstants.VIEW_EVENT:
					handleViewEvent();
					break;
				case PresentModuleConstants.MAXIMIZE_PRESENTATION:
					handleMaximizeEvent();
					break;
				case PresentModuleConstants.RESTORE_PRESENTATION:
					handleRestorePresentation();
					break;
				case PresentModuleConstants.PRESENTER_MODE:
					handlePresenterMode();
					break;
				case PresentModuleConstants.VIEWER_MODE:
					handleViewerMode();
					break;
				case PresentModuleConstants.OPEN_PRESENT_WINDOW:
		   			_presWin.height = 440;
		   			_presWin.width = 430;
		   			_presWin.title = PresentationWindow.TITLE;
		   			_presWin.showCloseButton = false;	
		   			_presWin.xPosition = 200;
		   			_presWin.yPosition = 20;
		   			facade.sendNotification(PresentModuleConstants.ADD_WINDOW, _presWin);		   							
					break;
				case PresentModuleConstants.CLOSE_PRESENT_WINDOW:
					facade.sendNotification(PresentModuleConstants.REMOVE_WINDOW, _presWin);
					break;
				case PresentModuleConstants.DISPLAY_SLIDE:
					var slidenum:int = notification.getBody() as int;
					trace('DISPLAY_SLIDE in PresentationWindowMediator ' + slidenum);
					if ((_presWin.slideView.slides != null) && (slidenum >= 0) && (slidenum < _presWin.slideView.slides.length)) {
						_presWin.slideView.selectedSlide = slidenum;
						_presWin.slideNumLbl.text = (slidenum + 1) + " of " + _presWin.slideView.slides.length;
					}
					break;
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
			}
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

		private function handlePresentationLoadedEvent():void
		{	
			_presWin.slideView.slides = proxy.slides;         	
            _presWin.slideNumLbl.text = (_presWin.slideView.selectedSlide + 1) + " of " + _presWin.slideView.slides.length;		
			_presWin.slideView.visible = true;		
			
			if (proxy.isPresenter()) {
				// Remove the uploadWindow
				PopUpManager.removePopUp(_presWin.uploadWindow);
				// Remove the mediator	
				facade.removeMediator(FileUploadWindowMediator.NAME);
				
				_presWin.backButton.visible = true;
				_presWin.forwardButton.visible = true;
				proxy.sharePresentation(true);
				proxy.gotoSlide(0);
			} else {
				proxy.getCurrentSlideNumber();
			}
		}
				
		/**
		 * Handles a received View notification 
		 * 
		 */		
		private function handleViewEvent():void{			
//			_presWin.thumbnailView.visible = true;
		}
		
		/**
		 * Handles a received Maximize notification 
		 * 
		 */		
		private function handleMaximizeEvent():void{
//			if (!presentationWindow.model.presentation.isPresenter){
//				presentationWindow.maximize();	
//			}
		}
		
		private function handleRestorePresentation():void{
//			if (!presentationWindow.model.presentation.isPresenter){
//				presentationWindow.restore();
//			}
		}
		

		/**
		 * Share a presentation with the rest of the room on the server 
		 * @param e
		 * 
		 */		
		private function sharePresentation(e:Event) : void{
//			if (!presentationWindow.model.presentation.isSharing){
///				sendNotification(PresentationApplication.SHARE, true);
//				presentationWindow.uploadPres.enabled = false;	
				//proxy.gotoPage(1);
//			}		
		}
		
		/**
		 * Unshare a shared presentation 
		 * @param e
		 * 
		 */		
		private function unsharePresentation(e:Event):void{
//			if (presentationWindow.model.presentation.isSharing) {
//				sendNotification(PresentationApplication.SHARE, false);
//				presentationWindow.uploadPres.enabled = true;
//			}
		}
		
		/**
		 * Opens the file upload window in order to upload slides 
		 * @param e
		 * 
		 */		
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

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
               
        protected function maximize(e:Event):void{
//        	proxy.maximize();
        }
        
        protected function restore(e:Event):void{
 //       	proxy.restore();
        }

	}
}