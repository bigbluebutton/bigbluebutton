/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.deskShare.view
{
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.media.Video;
	import flash.net.NetStream;
	
	import mx.controls.Alert;
	import mx.core.UIComponent;
	
	import org.bigbluebutton.modules.deskShare.DeskShareModuleConstants;
	import org.bigbluebutton.modules.deskShare.model.business.DeskShareProxy;
	import org.bigbluebutton.modules.deskShare.model.vo.CaptureResolutionVO;
	import org.bigbluebutton.modules.deskShare.view.components.DeskShareWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The DeskShareWindowMediator is a mediator class for the DeskShareWindow. It listens to the window events and dispatches them accordingly 
	 * @author Snap
	 * 
	 */	
	public class DeskShareWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "DeskShareWindowMediator";
		public static const START_SHARING:String = "START_SHARING";
		public static const START_VIEWING:String = "START_VIEWING";
		
		private var _module:DeskShareModule;
		private var _window:DeskShareWindow;
		private var _deskShareWindowOpen:Boolean = false;
		
		private var sharing:Boolean = false;
		private var viewing:Boolean = false;
		
		private var captureWidth:int;
		private var captureHeight:int;
		
		/**
		 * The default constructor 
		 * @param module - the DeskShareModule to which the window belongs to
		 * 
		 */		
		public function DeskShareWindowMediator(module:DeskShareModule)
		{
			super(NAME, module);
			_module = module;
			_window = new DeskShareWindow();
			_window.name = _module.username;
			
			_window.addEventListener(START_SHARING, onStartSharingEvent);
		}
		
		/**
		 * Lists the notifications to which this class should listen to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					DeskShareModuleConstants.CLOSE_WINDOW,
					DeskShareModuleConstants.OPEN_WINDOW,
					DeskShareModuleConstants.START_VIEWING,
					DeskShareModuleConstants.STOP_VIEWING,
					DeskShareModuleConstants.GOT_HEIGHT,
					DeskShareModuleConstants.GOT_WIDTH,
					DeskShareModuleConstants.APPLET_STARTED
					];
		}
		
		/**
		 * Handles the notifications to which this class listens to as they appear 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case DeskShareModuleConstants.CLOSE_WINDOW:
					if (_deskShareWindowOpen){
						facade.sendNotification(DeskShareModuleConstants.REMOVE_WINDOW, _window);
						_deskShareWindowOpen = false;
					}
					break;
				case DeskShareModuleConstants.OPEN_WINDOW:
					_window.title = "Desk Share";
					_window.showCloseButton = false;
					_window.xPosition = 675;
					_window.yPosition = 310;
					facade.sendNotification(DeskShareModuleConstants.ADD_WINDOW, _window);
					_deskShareWindowOpen = true;
					break;
				case DeskShareModuleConstants.START_VIEWING:
					if (!sharing){
						var capResVO:CaptureResolutionVO = notification.getBody() as CaptureResolutionVO;
						_window.videoWidth = capResVO.width;
						_window.videoHeight = capResVO.height;
						startViewing();
					} 
					break;
				case DeskShareModuleConstants.STOP_VIEWING:
					if (viewing) stopViewing();
					break;
				case DeskShareModuleConstants.GOT_HEIGHT:
					_window.videoHeight = notification.getBody() as Number;
					startViewing();
					break;
				case DeskShareModuleConstants.GOT_WIDTH:
					_window.videoWidth = notification.getBody() as Number;
					break;
				case DeskShareModuleConstants.APPLET_STARTED:
					if(sharing) onAppletStart();
					break;
			}
		}
		
		/**
		 * A convinience getter for the proxy of the module 
		 * @return 
		 * 
		 */		
		private function get proxy():DeskShareProxy{
			return facade.retrieveProxy(DeskShareProxy.NAME) as DeskShareProxy;
		}
		
		private function startViewing():void{
			_window.videoPlayer = new Video(_window.videoWidth, _window.videoHeight);
			_window.videoPlayer.width = _window.videoWidth;
			_window.videoPlayer.height = _window.videoHeight;
			_window.videoHolder = new UIComponent();
			_window.videoHolder.width = _window.videoWidth;
			_window.videoHolder.height = _window.videoHeight;
			_window.videoHolder.setActualSize(_window.videoWidth, _window.videoHeight);
			_window.videoHolder.addChild(_window.videoPlayer);
			_window.canvas.addChildAt(_window.videoHolder,0);
			_window.videoHolder.x = 0;
			_window.videoHolder.y = 20;
			
			_window.dimensionsBox.visible = false;
			_window.height = 600;//_window.videoHeight + 73;
			_window.width = 500;//_window.videoWidth + 12;
			_window.canvas.visible = true;
			//_window.canvas.width = videoWidth;
			//_window.canvas.height = videoHeight;
			_window.ns = new NetStream(proxy.getConnection());
			_window.ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			_window.ns.client = this;
			_window.ns.bufferTime = 0;
			_window.ns.receiveVideo(true);
			_window.ns.receiveAudio(false);
			_window.videoPlayer.attachNetStream(_window.ns);
			
			var room:String = _module.getRoom();
			_window.ns.play(room);
			//_window.lblStatus.text = "You are viewing the desktop for presenter of room " + room;
			_window.resizable = true;
			
			viewing = true;
			_window.btnStartApplet.visible = false;
			_window.addZoomSlider();
			_window.addDragSupport();
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			
		}
		
		/**
		 * Sends a call to the capture applet to stop broadcasting 
		 * 
		 */		
		private function stopApplet():void{
			ExternalInterface.call("stopApplet");
			proxy.sendStopViewingNotification();
		}
		
		/**
		 * Stops the client from viewing the broadcast stream  
		 * 
		 */		
		private function stopViewing():void{
			_window.ns.close();
			viewing = false;
			_window.btnStartApplet.visible = true;
			_window.canvas.visible = false;
			_window.width = 236;
			_window.height = 74;
			_window.lblStatus.text = "";
			_window.ns.close();
			_window.canvas.removeChild(_window.videoHolder);
			_window.videoHeight = 0;
			_window.videoWidth = 0;
			
			_window.width = _window.dimensionsBox.width + 7;
			_window.height = _window.bar.height + _window.dimensionsBox.height + 33;
			_window.dimensionsBox.visible = true;
			_window.dimensionsBox.box.visible = true;
			_window.resizable = false;
			
			_window.removeZoomSlider();
			_window.removeDragSupport();
		}
		
		/**
		 * Called when the start sharing button is pressed, this method calls javascript to start the capture applet 
		 * @param e
		 * 
		 */		
		private function onStartSharingEvent(e:Event):void{
			if (!sharing){
				//Alert.show(_module.getRoom().toString());
				var captureX:Number = _window.dimensionsBox.box.x * DeskShareModuleConstants.SCALE;
				var captureY:Number = _window.dimensionsBox.box.y * DeskShareModuleConstants.SCALE;
				captureWidth = Math.round(_window.dimensionsBox.box.width * DeskShareModuleConstants.SCALE - 5);
				captureHeight = Math.round(_window.dimensionsBox.box.height * DeskShareModuleConstants.SCALE - 5);
				sharing = true;
				ExternalInterface.call("startApplet", _module.getCaptureServerUri(), _module.getRoom(), 
														captureX, captureY, captureWidth, captureHeight,
														_module.tunnel().toString());
														
				//ExternalInterface.addCallback("appletStartNotification", onAppletStart);
				
			} else{
				sharing = false;
				_window.btnStartApplet.label = "Start Sharing";
				_window.btnStartApplet.selected = false;
				_window.width = _window.dimensionsBox.width + 7;
				_window.height = _window.bar.height + _window.dimensionsBox.height + 33;
				_window.dimensionsBox.stopThumbnail();
				
				stopApplet();
			}	
		}
		
		/**
		 * Method called from the html template once the applet has started 
		 * 
		 */		
		public function onAppletStart():void{
			_window.capturing = true;
			_window.height = _window.bar.height + _window.dimensionsBox.height + 33;
			_window.width = _window.dimensionsBox.width + 7;
			_window.btnStartApplet.label = "Stop Sharing";
			//_window.lblStatus.text = "You are sharing your desktop with room " + _module.getRoom();
			_window.dimensionsBox.x = 0;
			_window.dimensionsBox.y = _window.bar.height + 5;
			_window.dimensionsBox.startThumbnail(proxy.getConnection(), _module.getRoom());
			
			//Send a notification to all room participants to start viewing the stream
			proxy.sendStartViewingNotification(captureWidth, captureHeight);
		}
		
		/**
		 * Called when the start viewing button is pressed, this mathod starts viewing the stream 
		 * @param e
		 * 
		 */		
		private function onStartViewingEvent(e:Event):void{
			if (!viewing) startViewing();
			else stopViewing();
		}
		
		public function stop():void{
			_window.close();
			_window = null;
		}

	}
}