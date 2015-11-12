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

package org.bigbluebutton.modules.polling.views
{
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import mx.containers.HBox;
	import mx.containers.VBox;
	import mx.controls.Button;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.model.FocusableImage;
	import org.bigbluebutton.modules.present.ui.views.SlideView;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class PollResultsView extends VBox {
		private static const LOGGER:ILogger = getClassLogger(PollResultsView);      

		private var _pollGraphic:ResizablePollGraphic;
		private var _topBox:HBox;
		private var _botBox:HBox;
		private var _data:Array = [{a:"True", v:10}, {a:"False", v:3}];
		
		private var publishBtn1:Button;
		private var publishBtn2:Button;
		private var closeBtn1:Button;
		private var closeBtn2:Button;
		
		public function PollResultsView(result:Array) {
			super();
			setStyle("horizontalAlign", "center");
			
			_topBox = new HBox();
			publishBtn1 = new Button();
			publishBtn1.label = ResourceUtil.getInstance().getString('bbb.polling.publishButton.tooltip');
			publishBtn1.addEventListener(MouseEvent.CLICK, handlePublishClick);
			_topBox.addChild(publishBtn1);
			closeBtn1 = new Button();
			closeBtn1.label = ResourceUtil.getInstance().getString('bbb.polling.closeButton.tooltip');
			closeBtn1.addEventListener(MouseEvent.CLICK, handleCloseClick);
			_topBox.addChild(closeBtn1);
			addChild(_topBox);
			
			_pollGraphic = new ResizablePollGraphic();
			_pollGraphic.data = result;
			_pollGraphic.width = 200;
			_pollGraphic.minWidth = 130;
			_pollGraphic.height = ((23+10)*_pollGraphic.data.length+10);
			_pollGraphic.minHeight = ((16+10)*_pollGraphic.data.length+10);
			_pollGraphic.objectToMove = this;
			addChild(_pollGraphic);
			
			_botBox = new HBox();
			_botBox.visible = false;
			publishBtn2 = new Button();
			publishBtn2.label = ResourceUtil.getInstance().getString('bbb.polling.publishButton.tooltip');
			publishBtn2.addEventListener(MouseEvent.CLICK, handlePublishClick);
			_botBox.addChild(publishBtn2);
			closeBtn2 = new Button();
			closeBtn2.label = ResourceUtil.getInstance().getString('bbb.polling.closeButton.tooltip');
			closeBtn2.addEventListener(MouseEvent.CLICK, handleCloseClick);
			_botBox.addChild(closeBtn2);
			addChild(_botBox);
			
			_pollGraphic.addEventListener(MouseEvent.MOUSE_DOWN, mouseDownHandler);
			_pollGraphic.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
			
			//parent.addEventListener(ResizeEvent.RESIZE, parentResizedHandler);
			//addEventListener(MoveEvent.MOVE, moveHandler, true); //doesn't fire when dragging
			//BindingUtils.bindSetter(yChangeHandler, this, "y"); //only fired when drag stops
		}
		
		private function handlePublishClick(e:MouseEvent):void {
			var slide:FocusableImage = SlideView(parent).slideLoader;
			var x1:int, y1:int, x2:int, y2:int, nx1:Number, ny1:Number, nx2:Number, ny2:Number;
			var slideXY:Point = slide.globalToLocal(localToGlobal(new Point(_pollGraphic.x, _pollGraphic.y)));
			x1 = slideXY.x;
			y1 = slideXY.y;
			x2 = slideXY.x+_pollGraphic.width;
			y2 = slideXY.y+_pollGraphic.height;
			nx1 = (x1*100.0)/slide.width;
			ny1 = (y1*100.0)/slide.height;
			nx2 = (x2*100.0)/slide.width;
			ny2 = (y2*100.0)/slide.height;
			LOGGER.debug("x1 {0} y1 {1} x2 {2} y2 {3}", [x1, y1, x2, y2]);
			LOGGER.debug("nx1 {0} ny1 {1} nx2 {2} ny2 {3}", [nx1, ny1, nx2, ny2]);
		}
		
		private function handleCloseClick(e:MouseEvent):void {
			
		}
		
		private function mouseDownHandler(e:MouseEvent):void {
			LOGGER.debug("mouseDownHandler");
			_pollGraphic.addEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
			var dragRect:Rectangle = new Rectangle(0, 0-_pollGraphic.y, parent.width-this.width, parent.height-_pollGraphic.height);
			startDrag(false, dragRect);
			e.stopImmediatePropagation();
		}
		
		private function mouseUpHandler(e:MouseEvent):void {
			LOGGER.debug("mouseUpHandler");
			_pollGraphic.removeEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
			stopDrag();
		}
		
		private function mouseMoveHandler(e:MouseEvent):void {
			//trace("mouseMoveHandler " + this.y);
			e.updateAfterEvent();
			
			if (this.y < 0) {
				_topBox.visible = false;
				_botBox.visible = true;
			} else if (this.y + this.height > parent.height) {
				_topBox.visible = true;
				_botBox.visible = false;
			}
		}
	}
}