/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.modules.videoconf
{
	import flexlib.mdi.containers.MDIWindow;
	import flexlib.mdi.events.MDIWindowEvent;

	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Images;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.DragWindowEvent;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.main.views.MainCanvas;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	import mx.core.UIComponent;
    import mx.controls.Button;	
    
	import flash.events.MouseEvent;
	import flash.media.Video;
	import flash.geom.Point;
	
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
		protected var originalWidth:Number;
		protected var originalHeight:Number;

		protected var mousePositionOnDragStart:Point;
		
		public var streamName:String;
		public var userId:int;
		[Bindable] public var resolutions:Array;
		
		protected function getVideoResolution(stream:String):Array {
			for each (var resStr:String in resolutions){
				if (resStr == stream.substr(0, resStr.length))
					return resStr.split( "x" );
			}
			return null;
		}
	
		protected function get paddingVertical():Number {
			return this.borderMetrics.top + this.borderMetrics.bottom;
		}
		
		protected function get paddingHorizontal():Number {
			return this.borderMetrics.left + this.borderMetrics.right;
		}
		
		protected function onResize():void {
			if (_video == null || _videoHolder == null || this.minimized) return;
			
		//	if (this.width != _video.width + PADDING_HORIZONTAL
		//	        && this.height == _video.height + PADDING_VERTICAL) {
		//		this.height = Math.floor(this.width / aspectRatio)
		//	} else if (this.width == _video.width + PADDING_HORIZONTAL
		//	        && this.height != _video.height + PADDING_VERTICAL) {
		//		this.width = Math.floor(this.height * aspectRatio)
		//	}
			
			// limits the window size to the parent size
			this.width = (this.parent != null? Math.min(this.width, this.parent.width): this.width);
			this.height = (this.parent != null? Math.min(this.height, this.parent.height): this.height); 
			
			var tmpWidth:Number = this.width - PADDING_HORIZONTAL;
			var tmpHeight:Number = this.height - PADDING_VERTICAL;
			
			tmpWidth = Math.min (tmpWidth, Math.floor(tmpHeight * aspectRatio));
			tmpHeight = Math.min (tmpHeight, Math.floor(tmpWidth / aspectRatio));
			
			_video.width = _videoHolder.width = tmpWidth;
			_video.height = _videoHolder.height = tmpHeight;
		
			if (!keepAspect || this.maximized) {
				_video.x = Math.floor ((this.width - PADDING_HORIZONTAL - tmpWidth) / 2);
				_video.y = Math.floor ((this.height - PADDING_VERTICAL - tmpHeight) / 2);
			} else {
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
			if (_buttonsEnabled)
				return MainCanvas.POPUP;
			else
				// the window is docked, so it should not be moved on reset layout
				return MainCanvas.UNTOUCHED;
		}
			
		public function onDragStart(event:MDIWindowEvent = null):void {
            var e:DragWindowEvent = new DragWindowEvent(DragWindowEvent.DRAG_START);
            e.mouseLocal = new Point(mouseX, mouseY);
            e.mouseGlobal = this.localToGlobal(new Point(mouseX, mouseY));
            e.window = this;
            dispatchEvent(e);
		}
		
		public function onDragEnd(event:MDIWindowEvent = null):void {
			var e:DragWindowEvent = new DragWindowEvent(DragWindowEvent.DRAG_END);
		//	e.localPosition = mousePositionOnDragStart;
			e.mouseLocal = new Point(mouseX, mouseY);
			e.mouseGlobal = this.localToGlobal(new Point(mouseX, mouseY));
		//	LogUtil.debug("e.globalPosition " + e.globalPosition.toString());
			e.window = this;
			dispatchEvent(e);
		}
		
		override public function close(event:MouseEvent = null):void{
			var e:CloseWindowEvent = new CloseWindowEvent();
			e.window = this;
			dispatchEvent(e);

			super.close(event);
		}
		
		private var keepAspectBtn:Button = null;
		private var fitVideoBtn:Button = null;
		private var originalSizeBtn:Button = null;
		private var BUTTONS_SIZE:int = 20;
		private var BUTTONS_PADDING:int = 10;
		private var _buttonsVisible:Boolean = true;
		private var _buttonsEnabled:Boolean = true;
		
		private var img_unlock_keep_aspect:Class = images.lock_open;
		private var img_lock_keep_aspect:Class = images.lock_close;
		private var img_fit_video:Class = images.arrow_in;
		private var img_original_size:Class = images.shape_handles;
		
		protected function createButtons():void {
			keepAspectBtn = new Button();
			fitVideoBtn = new Button();
			originalSizeBtn = new Button();
			
			keepAspectBtn.setStyle("icon", img_lock_keep_aspect);
			fitVideoBtn.setStyle("icon", img_fit_video);
			originalSizeBtn.setStyle("icon", img_original_size);

			keepAspectBtn.toolTip = ResourceUtil.getInstance().getString('bbb.video.keepAspectBtn.tooltip');
			fitVideoBtn.toolTip = ResourceUtil.getInstance().getString('bbb.video.fitVideoBtn.tooltip');
			originalSizeBtn.toolTip = ResourceUtil.getInstance().getString('bbb.video.originalSizeBtn.tooltip');
			
			keepAspectBtn.addEventListener(MouseEvent.CLICK, onKeepAspectClick);
			fitVideoBtn.addEventListener(MouseEvent.CLICK, onFitVideoClick);
			originalSizeBtn.addEventListener(MouseEvent.CLICK, onOriginalSizeClick);
			
			keepAspectBtn.width = keepAspectBtn.height 
				= fitVideoBtn.width = fitVideoBtn.height
				= originalSizeBtn.width = originalSizeBtn.height = BUTTONS_SIZE;
			
			hideButtons();
			updateButtonsPosition();
			
			addChild(keepAspectBtn);
			addChild(fitVideoBtn);
			addChild(originalSizeBtn);
			
			// creates the window keeping the aspect ratio 
			onKeepAspectClick();
		}
		
		protected function updateButtonsPosition():void {
			if (keepAspectBtn == null
					|| fitVideoBtn == null
					|| originalSizeBtn == null)
				return;
			
			// put the buttons uppon the video
			keepAspectBtn.y = fitVideoBtn.y = originalSizeBtn.y = _video.y + _video.height - keepAspectBtn.height - BUTTONS_PADDING;
			keepAspectBtn.x = _video.x + _video.width - keepAspectBtn.width - BUTTONS_PADDING;
			fitVideoBtn.x = keepAspectBtn.x - fitVideoBtn.width - BUTTONS_PADDING;
			originalSizeBtn.x = fitVideoBtn.x - originalSizeBtn.width - BUTTONS_PADDING;
		}
		
		protected function showButtons(event:MouseEvent = null):void {
			if (!_buttonsVisible && _buttonsEnabled) {
				//LogUtil.debug("showButtons");
				keepAspectBtn.visible = true;
				fitVideoBtn.visible = true;
				originalSizeBtn.visible = true;
				_buttonsVisible = true;
			}
		}
		
		protected function hideButtons(event:MouseEvent = null):void {
			if (_buttonsVisible && _buttonsEnabled) {
				//LogUtil.debug("hideButtons");
				keepAspectBtn.visible = false;
				fitVideoBtn.visible = false;
				originalSizeBtn.visible = false;
				_buttonsVisible = false;
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
			if (!enabled) hideButtons();
			_buttonsEnabled = enabled;
		}
		
		protected function onOriginalSizeClick(event:MouseEvent = null):void {
			_video.width = _videoHolder.width = originalWidth;
			_video.height = _videoHolder.height = originalHeight;
			onFitVideoClick();
		}		
		
		protected function onFitVideoClick(event:MouseEvent = null):void {
			var newWidth:int = _video.width + paddingHorizontal;
			var newHeight:int = _video.height + paddingVertical;
			
			this.x += (this.width - newWidth)/2;
			this.y += (this.height - newHeight)/2;
			this.width = newWidth;
			this.height = newHeight;
			onResize();
		}
		
		protected function onKeepAspectClick(event:MouseEvent = null):void {
			keepAspect = !keepAspect;
			keepAspectBtn.selected = keepAspect;
			fitVideoBtn.enabled = !keepAspect;
			
			keepAspectBtn.setStyle("icon", (keepAspect? img_lock_keep_aspect: img_unlock_keep_aspect));
			
			onFitVideoClick();
		}
		
	}
}