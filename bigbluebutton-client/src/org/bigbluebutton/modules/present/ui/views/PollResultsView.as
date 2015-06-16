package org.bigbluebutton.modules.present.ui.views
{
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	
	import mx.binding.utils.BindingUtils;
	import mx.containers.HBox;
	import mx.containers.VBox;
	import mx.controls.Button;
	import mx.events.MoveEvent;
	import mx.events.ResizeEvent;
	
	public class PollResultsView extends VBox {
		private var _pollGraphic:PollGraphic;
		private var _topBox:HBox;
		private var _botBox:HBox;
		private var _data:Array = [{a:"True", v:10}, 
									{a:"False", v:3}];
		
		private var publishBtn1:Button;
		private var publishBtn2:Button;
		private var closeBtn1:Button;
		private var closeBtn2:Button;
		
		public function PollResultsView() {
			super();
			setStyle("horizontalAlign", "center");
			
			_topBox = new HBox();
			publishBtn1 = new Button();
			publishBtn1.label = "Publish";
			publishBtn1.addEventListener(MouseEvent.CLICK, handlePublishClick);
			_topBox.addChild(publishBtn1);
			closeBtn1 = new Button();
			closeBtn1.label = "Close";
			closeBtn1.addEventListener(MouseEvent.CLICK, handleCloseClick);
			_topBox.addChild(closeBtn1);
			addChild(_topBox);
			
			_pollGraphic = new ResizablePollGraphic();
			_pollGraphic.width = 200;
			_pollGraphic.height = 150;
			//_pollGraphic.data = _data;
			addChild(_pollGraphic);
			
			_botBox = new HBox();
			_botBox.visible = false;
			publishBtn2 = new Button();
			publishBtn2.label = "Publish";
			publishBtn2.addEventListener(MouseEvent.CLICK, handlePublishClick);
			_botBox.addChild(publishBtn2);
			closeBtn2 = new Button();
			closeBtn2.label = "Close";
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
			
		}
		
		private function handleCloseClick(e:MouseEvent):void {
			
		}
		
		private function mouseDownHandler(e:MouseEvent):void {
			trace("mouseDownHandler");
			_pollGraphic.addEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
			var dragRect:Rectangle = new Rectangle(0, 0-_pollGraphic.y, parent.width-this.width, parent.height-_pollGraphic.height);
			startDrag(false, dragRect);
			e.stopImmediatePropagation();
		}
		
		private function mouseUpHandler(e:MouseEvent):void {
			trace("mouseUpHandler");
			removeEventListener(MouseEvent.MOUSE_MOVE, mouseMoveHandler);
			stopDrag();
		}
		
		private function mouseMoveHandler(e:MouseEvent):void {
			trace("mouseMoveHandler " + this.y);
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