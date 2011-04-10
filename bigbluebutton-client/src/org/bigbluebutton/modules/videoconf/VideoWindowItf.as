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
	import org.bigbluebutton.modules.videoconf.events.DragEvent;
	import org.bigbluebutton.modules.videoconf.events.CloseWindowEvent;

	import mx.core.UIComponent;
	
	import flash.events.MouseEvent;
	import flash.media.Video;
	import flash.geom.Point;
	
	public class VideoWindowItf extends MDIWindow
	{
		protected var _video:Video;
		protected var _videoHolder:UIComponent;
		
		protected var PADDING_HORIZONTAL:Number = 6;
		protected var PADDING_VERTICAL:Number = 29;
		protected var _minWidth:int = 160 + PADDING_HORIZONTAL;
		protected var _minHeight:int = 120 + PADDING_VERTICAL;
		protected var aspectRatio:Number = 1;
		protected var keepAspect:Boolean = true;

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
			if (_video == null || this.minimized) return;
			
		//	if (this.width != _video.width + PADDING_HORIZONTAL
		//	        && this.height == _video.height + PADDING_VERTICAL) {
		//		this.height = Math.floor(this.width / aspectRatio)
		//	} else if (this.width == _video.width + PADDING_HORIZONTAL
		//	        && this.height != _video.height + PADDING_VERTICAL) {
		//		this.width = Math.floor(this.height * aspectRatio)
		//	}
			
			var tmpWidth:Number = this.width - PADDING_HORIZONTAL;
			var tmpHeight:Number = this.height - PADDING_VERTICAL;
			
			if (tmpWidth > Math.floor(tmpHeight * aspectRatio))
				tmpWidth = Math.floor(tmpHeight * aspectRatio);
			if (tmpHeight > Math.floor(tmpWidth / aspectRatio))
				tmpHeight = Math.floor(tmpWidth / aspectRatio);
			
			_video.width = tmpWidth;
			_video.height = tmpHeight;
			_videoHolder.width = tmpWidth;
			_videoHolder.height = tmpHeight;
		
			if (!keepAspect || this.maximized) {				
				_video.x = Math.floor ((this.width - PADDING_HORIZONTAL - tmpWidth) / 2);
				_video.y = Math.floor ((this.height - PADDING_VERTICAL - tmpHeight) / 2);
			} else {
				_video.x = 0;
				_video.y = 0;
				this.width = tmpWidth + PADDING_HORIZONTAL;
				this.height = tmpHeight + PADDING_VERTICAL;
			}
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
		
		public function onDragStart(event:MDIWindowEvent):void {
			mousePositionOnDragStart = new Point(mouseX, mouseY);
		//	LogUtil.debug("mousePositionOnDragStart " + mousePositionOnDragStart.toString());
		//	LogUtil.debug("mousePositionOnDragStart localToContent " + localToContent(mousePositionOnDragStart).toString());
		//	LogUtil.debug("mousePositionOnDragStart contentToLocal " + contentToLocal(mousePositionOnDragStart).toString());
		//	LogUtil.debug("mousePositionOnDragStart localToGlobal " + localToGlobal(mousePositionOnDragStart).toString());
		//	LogUtil.debug("mousePositionOnDragStart contentToGlobal " + contentToGlobal(mousePositionOnDragStart).toString());
		}
		
		public function onDragEnd(event:MDIWindowEvent):void {
			var e:DragEvent = new DragEvent();
		//	e.localPosition = mousePositionOnDragStart;
			e.localPosition = new Point(mouseX, mouseY);
			e.globalPosition = localToGlobal(new Point(mouseX, mouseY));
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
			
		
				
	}
}