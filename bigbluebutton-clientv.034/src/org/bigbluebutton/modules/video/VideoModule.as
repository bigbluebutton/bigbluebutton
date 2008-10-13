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
package org.bigbluebutton.modules.video
{
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.media.Camera;
	import flash.utils.Timer;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import mx.controls.Button;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.viewers.model.vo.User;
	
	/**
	 * The VideoModule is the main class of the Video Application
	 * <p>
	 * This class extends the ModuleBase class of the Flex Framework
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class VideoModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "Share Webcam";
		public static const RECORDER:String = "Recording Module";
		public static const VIEWER:String = "Viewer Module";
		
		private var facade:VideoFacade;
		private var shell:MainApplicationShell;
		public var viewComponent:MDIWindow;
		public var streamName:String;
		
		public var type:String;
		public var user:User;
		
		/**
		 * Creates a new instance of the Video Module 
		 * 
		 */		
		public function VideoModule(user:User = null)
		{
			super(NAME);
			
			if (user == null){
				this.streamName = "stream" + String( Math.floor( new Date().getTime() ) );
				this.type = RECORDER;
				this.preferedX = 600;
				this.preferedY = 240;
			} else if (user != null){
				this.user = user;
				this.streamName = user.streamName;
				this.type = VIEWER;
				this.preferedX = 10;
				this.preferedY = 10;
			}
			
			facade = VideoFacade.getInstance(this.streamName);
			this.startTime = NAME;
			this.addButton = true;
			this.displayName = "Share Webcam";
			
		}
		
		/**
		 * Accept the router from the main application to be used for sending messages back and forth 
		 * @param router
		 * @param shell
		 * 
		 */		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router, shell);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return viewComponent;
		}
		
		override public function logout():void{
			facade.sendNotification(VideoFacade.CLOSE_ALL);
			facade.removeCore(this.streamName);
		}
		
		override public function setButton(button:Button):void{
			super.setButton(button);
			listenToCameras();
			this.button.addEventListener(MouseEvent.CLICK, buttonClicked);
		}
		
		private function buttonClicked(e:MouseEvent):void{
			this.acceptRouter(this.router, this.mshell);
		}
		
		private function listenToCameras():void{
			onTimer(new TimerEvent("test"));
			var timer:Timer = new Timer(5000);
			timer.addEventListener(TimerEvent.TIMER, onTimer);
			timer.start();
		}
		
		private function onTimer(e:TimerEvent):void{
			if (Camera.getCamera() == null){
				this.button.enabled = false;
			} else if (Camera.getCamera() != null){
				this.button.enabled = true;
			}
		}

	}
}