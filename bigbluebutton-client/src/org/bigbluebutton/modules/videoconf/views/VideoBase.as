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

import org.bigbluebutton.modules.videoconf.events.DragEvent;
import org.bigbluebutton.modules.videoconf.events.CloseWindowEvent;

private var PADDING_HORIZONTAL:Number = 6;
private var PADDING_VERTICAL:Number = 29;
private var _minWidth:int = 160 + PADDING_HORIZONTAL;
private var _minHeight:int = 120 + PADDING_VERTICAL;
private var aspectRatio:Number = 1;
private var keepAspect:Boolean = true;

private var mousePositionOnDragStart:Point;

private function get paddingVertical():Number {
	return this.borderMetrics.top + this.borderMetrics.bottom;
}

private function get paddingHorizontal():Number {
	return this.borderMetrics.left + this.borderMetrics.right;
}

private function onResize():void {
	if (video == null || this.minimized) return;
	
//	if (this.width != video.width + PADDING_HORIZONTAL
//	        && this.height == video.height + PADDING_VERTICAL) {
//		this.height = Math.floor(this.width / aspectRatio)
//	} else if (this.width == video.width + PADDING_HORIZONTAL
//	        && this.height != video.height + PADDING_VERTICAL) {
//		this.width = Math.floor(this.height * aspectRatio)
//	}
	
	var tmpWidth:Number = this.width - PADDING_HORIZONTAL;
	var tmpHeight:Number = this.height - PADDING_VERTICAL;
	
	if (tmpWidth > Math.floor(tmpHeight * aspectRatio))
		tmpWidth = Math.floor(tmpHeight * aspectRatio);
	if (tmpHeight > Math.floor(tmpWidth / aspectRatio))
		tmpHeight = Math.floor(tmpWidth / aspectRatio);
	
	video.width = tmpWidth;
	video.height = tmpHeight;
	videoHolder.width = tmpWidth;
	videoHolder.height = tmpHeight;

	if (!keepAspect || this.maximized) {				
		video.x = Math.floor ((this.width - PADDING_HORIZONTAL - tmpWidth) / 2);
		video.y = Math.floor ((this.height - PADDING_VERTICAL - tmpHeight) / 2);
	} else {
		video.x = 0;
		video.y = 0;
		this.width = tmpWidth + PADDING_HORIZONTAL;
		this.height = tmpHeight + PADDING_VERTICAL;
	}
}

private function setAspectRatio(width:int,height:int):void {
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

