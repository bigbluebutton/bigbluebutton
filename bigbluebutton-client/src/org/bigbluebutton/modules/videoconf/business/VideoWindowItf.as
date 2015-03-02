/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.modules.videoconf.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.media.Video;
	
	import flexlib.mdi.containers.MDIWindow;
	import flexlib.mdi.events.MDIWindowEvent;
	
	import mx.containers.Panel;
	import mx.controls.Button;
	import mx.core.UIComponent;
	import mx.events.FlexEvent;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.Images;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.DragWindowEvent;
	import org.bigbluebutton.core.EventConstants;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.events.CoreEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.events.KickUserEvent;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.main.views.MainCanvas;
	import org.bigbluebutton.modules.videoconf.events.UserTalkingEvent;
	import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
	import org.bigbluebutton.modules.videoconf.views.ControlButtons;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class VideoWindowItf extends MDIWindow implements IBbbModuleWindow
	{
		protected var _video:Video;
		protected var _videoHolder:UIComponent;
		// images must be static because it needs to be created *before* the PublishWindow creation
		static protected var images:Images = new Images();
		
		static public var PADDING_HORIZONTAL:Number = 6;
		static public var PADDING_VERTICAL:Number = 29;
		protected var _minWidth:int = 160 + PADDING_HORIZONTAL;
		protected var _minHeight:int = 120 + PADDING_VERTICAL;
		protected var aspectRatio:Number = 1;
		protected var keepAspect:Boolean = false;
	
		protected var mousePositionOnDragStart:Point;
		
		public var streamName:String;
    
    private var windowType:String = "VideoWindowItf";
    
    public var userID:String = null;

    protected var _controlButtons:ControlButtons = new ControlButtons();
		
    [Bindable] public var resolutions:Array;

	protected var videoConfOptions:VideoConfOptions = new VideoConfOptions();

    public function VideoWindowItf() {
      super();
	  
	  this.addEventListener(FlexEvent.CREATION_COMPLETE, onCreationComplete);
    }
    
    private function onCreationComplete(event:FlexEvent):void {
      tabFocusEnabled = false;
      accessibilityEnabled = false;
      titleBarOverlay.accessibilityEnabled = false;
      titleBarOverlay.tabFocusEnabled = false;
      closeBtn.accessibilityEnabled = false;
      closeBtn.tabFocusEnabled = false;
    }
    
    public function getWindowType():String {
      return windowType;
    }
    
    protected function updateControlButtons():void {
      _controlButtons.updateControlButtons();
    }
    
		protected function getVideoResolution(stream:String):Array {
			var pattern:RegExp = new RegExp("(\\d+x\\d+)-([A-Za-z0-9]+)-\\d+", "");
			if (pattern.test(stream)) {
				LogUtil.debug("The stream name is well formatted [" + stream + "]");
        var uid:String = UserManager.getInstance().getConference().getMyUserId();
        LogUtil.debug("Stream resolution is [" + pattern.exec(stream)[1] + "]");
        LogUtil.debug("Userid [" + pattern.exec(stream)[2] + "]");
        userID = pattern.exec(stream)[2];
        addControlButtons();
        return pattern.exec(stream)[1].split("x");
			} else {
				LogUtil.error("The stream name doesn't follow the pattern <width>x<height>-<userId>-<timestamp>. However, the video resolution will be set to the lowest defined resolution in the config.xml: " + resolutions[0]);
				return resolutions[0].split("x");
			}
		}
		    
		protected function get paddingVertical():Number {
			return this.borderMetrics.top + this.borderMetrics.bottom;
		}
		
		protected function get paddingHorizontal():Number {
			return this.borderMetrics.left + this.borderMetrics.right;
		}
		
		static private var RESIZING_DIRECTION_UNKNOWN:int = 0; 
		static private var RESIZING_DIRECTION_VERTICAL:int = 1; 
		static private var RESIZING_DIRECTION_HORIZONTAL:int = 2; 
		static private var RESIZING_DIRECTION_BOTH:int = 3;
		private var resizeDirection:int = RESIZING_DIRECTION_BOTH;
		
		/**
		 * when the window is resized by the user, the application doesn't know
		 * about the resize direction
		 */
		public function onResizeStart(event:MDIWindowEvent = null):void {
			resizeDirection = RESIZING_DIRECTION_UNKNOWN;
		}
		
		/**
		 * after the resize ends, the direction is set to BOTH because of the
		 * non-user resize actions - like when the window is docked, and so on
		 */
		public function onResizeEnd(event:MDIWindowEvent = null):void {
			resizeDirection = RESIZING_DIRECTION_BOTH;
		}
		
		protected function onResize():void {
			if (_video == null || _videoHolder == null || this.minimized) return;
			
			// limits the window size to the parent size
			this.width = (this.parent != null? Math.min(this.width, this.parent.width): this.width);
			this.height = (this.parent != null? Math.min(this.height, this.parent.height): this.height); 
			
			var tmpWidth:Number = this.width - PADDING_HORIZONTAL;
			var tmpHeight:Number = this.height - PADDING_VERTICAL;
			
			// try to discover in which direction the user is resizing the window
			if (resizeDirection != RESIZING_DIRECTION_BOTH) {
				if (tmpWidth == _video.width && tmpHeight != _video.height)
					resizeDirection = (resizeDirection == RESIZING_DIRECTION_VERTICAL || resizeDirection == RESIZING_DIRECTION_UNKNOWN? RESIZING_DIRECTION_VERTICAL: RESIZING_DIRECTION_BOTH);
				else if (tmpWidth != _video.width && tmpHeight == _video.height)
					resizeDirection = (resizeDirection == RESIZING_DIRECTION_HORIZONTAL || resizeDirection == RESIZING_DIRECTION_UNKNOWN? RESIZING_DIRECTION_HORIZONTAL: RESIZING_DIRECTION_BOTH);
				else
					resizeDirection = RESIZING_DIRECTION_BOTH;
			}
			
			// depending on the direction, the tmp size is different
			switch (resizeDirection) {
				case RESIZING_DIRECTION_VERTICAL:
					tmpWidth = Math.floor(tmpHeight * aspectRatio);
					break;
				case RESIZING_DIRECTION_HORIZONTAL:
					tmpHeight = Math.floor(tmpWidth / aspectRatio);
					break;
				case RESIZING_DIRECTION_BOTH:
					// this direction is used also for non-user window resize actions
					tmpWidth = Math.min (tmpWidth, Math.floor(tmpHeight * aspectRatio));
					tmpHeight = Math.min (tmpHeight, Math.floor(tmpWidth / aspectRatio));
					break;
			}
			
			_video.width = _videoHolder.width = tmpWidth;
			_video.height = _videoHolder.height = tmpHeight;
			
			if (!keepAspect || this.maximized) {
				// center the video in the window
				_video.x = Math.floor ((this.width - PADDING_HORIZONTAL - tmpWidth) / 2);
				_video.y = Math.floor ((this.height - PADDING_VERTICAL - tmpHeight) / 2);
			} else {
				// fit window dimensions on video
				_video.x = 0;
				_video.y = 0;
				this.width = tmpWidth + PADDING_HORIZONTAL;
				this.height = tmpHeight + PADDING_VERTICAL;
			}
			
			// reposition the window to fit inside the parent window
			if (this.parent != null) {
				if (this.x + this.width > this.parent.width)
					this.x = this.parent.width - this.width;
				if (this.x < 0)
					this.x = 0;
				if (this.y + this.height > this.parent.height)
					this.y = this.parent.height - this.height;
				if (this.y < 0)
					this.y = 0;
			}
			
			updateButtonsPosition();
		}
		
		public function updateWidth():void {
			this.width = Math.floor((this.height - paddingVertical) * aspectRatio) + paddingHorizontal;
			onResize();
		}
		
		public function updateHeight():void {
			this.height = Math.floor((this.width - paddingHorizontal) / aspectRatio) + paddingVertical;
			onResize();
		}
		
		protected function setAspectRatio(width:int,height:int):void {
			aspectRatio = (width/height);
			this.minHeight = Math.floor((this.minWidth - PADDING_HORIZONTAL) / aspectRatio) + PADDING_VERTICAL;
		}
		
		public function getPrefferedPosition():String{
			if (_controlButtonsEnabled)
				return MainCanvas.POPUP;
			else
				// the window is docked, so it should not be moved on reset layout
				return MainCanvas.ABSOLUTE;
		}
			
		override public function close(event:MouseEvent = null):void{
      trace("VideoWIndowItf close window event");
      
			var e:CloseWindowEvent = new CloseWindowEvent();
			e.window = this;
			dispatchEvent(e);
			
			super.close(event);
		}
		   
		private var _controlButtonsEnabled:Boolean = true;
		
		private var img_unlock_keep_aspect:Class = images.lock_open;
		private var img_lock_keep_aspect:Class = images.lock_close;
		private var img_fit_video:Class = images.arrow_in;
		private var img_original_size:Class = images.shape_handles;
		private var img_mute_icon:Class = images.webcam_mute;
    private var signOutIcon:Class = images.webcam_kickuser;
    private var adminIcon:Class = images.webcam_make_presenter;
    private var chatIcon:Class = images.webcam_private_chat;
    
    protected function addControlButtons():void {
      _controlButtons.sharerUserID = userID;
      _controlButtons.visible = true;
      this.addChild(_controlButtons);
    }
    
		protected function get controlButtons():ControlButtons {
			if (_controlButtons == null) {				
				_controlButtons.visible = false;							
			} 
			return _controlButtons;
		}
		
		protected function createButtons():void {      
      updateButtonsPosition();
		}
		
		protected function updateButtonsPosition():void {
      if (this.width < controlButtons.width) {
        controlButtons.visible = false;
      }
      
			if (controlButtons.visible == false) {
				controlButtons.y = controlButtons.x = 0;
			} else {
				controlButtons.y = this.height - PADDING_VERTICAL - controlButtons.height - controlButtons.padding;
				controlButtons.x = this.width - PADDING_HORIZONTAL - controlButtons.width - controlButtons.padding;
			}
		}
		
		protected function showButtons(event:MouseEvent = null):void {
			if (_controlButtonsEnabled && controlButtons.visible == false && this.width > controlButtons.width) {
				controlButtons.visible = true;
				updateButtonsPosition();
			}
		}
		
		protected function hideButtons(event:MouseEvent = null):void {
			if (_controlButtonsEnabled && controlButtons.visible == true) {
				controlButtons.visible = false;
				updateButtonsPosition();
			}
		}
		
		protected function onDoubleClick(event:MouseEvent = null):void {
			// it occurs when the window is docked, for example
			if (!this.maximizeRestoreBtn.visible) return;
			
			this.maximizeRestore();
		}
		
		override public function maximizeRestore(event:MouseEvent = null):void {
			// if the user is maximizing the window, the control buttons should disappear
			buttonsEnabled = this.maximized;
			super.maximizeRestore(event);
		}
		
		public function set buttonsEnabled(enabled:Boolean):void {
			if (!enabled) 
				hideButtons();
			_controlButtonsEnabled = enabled;
		}
		
		
    protected function userMuted(muted:Boolean):void {
      _controlButtons.userMuted(muted);
    }
    
    protected function simulateClick():void {
    	if (videoConfOptions.focusTalking) {
    		var talkingEvent:UserTalkingEvent = new UserTalkingEvent(UserTalkingEvent.TALKING);
    		dispatchEvent(talkingEvent);
    	}
    }
	}
}