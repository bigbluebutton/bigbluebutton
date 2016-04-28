package org.bigbluebutton.web.deskshare.views {
	import flash.display.Bitmap;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.net.NetConnection;
	import flash.net.URLRequest;
	
	import flexlib.controls.HSlider;
	
	import mx.containers.Canvas;
	import mx.controls.Button;
	import mx.controls.VideoDisplay;
	import mx.events.MoveEvent;
	import mx.events.ResizeEvent;
	import mx.events.ScrollEvent;
	
	import org.bigbluebutton.lib.deskshare.views.IDeskshareView;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	import org.bigbluebutton.web.window.views.BBBWindow;
	import org.osflash.signals.Signal;
	
	import spark.components.Group;
	import spark.components.HScrollBar;
	import spark.components.Scroller;
	import spark.components.VScrollBar;
	import spark.layouts.VerticalLayout;
	
	
	public class DeskshareWindow extends BBBWindow implements IDeskshareView {
		
		private var _deskshareVideoView:DeskshareVideoView;
		
		private var _videoDisplay:VideoDisplay;
		
		private var _deskshareGroup:Group;
		
		private var _displayActualSizeButton:Button;
		
		private var _hscroll:HScrollBar;
		
		private var _vscroll:VScrollBar;
		
		private var _displayActualSize:Boolean = false;
		
		public function DeskshareWindow() {
			super();
			hideWindow();
			title = ResourceUtil.getInstance().getString("bbb.desktopView.title");
			width = 300;
			height = 400;
			
			_deskshareGroup = new Group();
			_deskshareGroup.clipAndEnableScrolling = true;
			_deskshareGroup.percentHeight = 100;
			_deskshareGroup.percentWidth = 100;
			_deskshareGroup.horizontalScrollPosition = 50;
			
			addElement(_deskshareGroup);
			
			var layout:VerticalLayout = new VerticalLayout();
			layout.verticalAlign = "middle";
			
			_deskshareGroup.layout = layout;
			
			_videoDisplay = new VideoDisplay();
			_videoDisplay.width = 0; //this hides the black background
			
			_deskshareGroup.addElement(_videoDisplay);
			
			_hscroll = new HScrollBar();
			_hscroll.percentWidth = 100;
			_hscroll.addEventListener(Event.CHANGE, scrollChange);
			addElement(_hscroll);
			
			_vscroll = new VScrollBar();
			_vscroll.percentHeight = 100;
			_vscroll.addEventListener(Event.CHANGE, scrollChange);
			addElement(_vscroll);
			
			showScrollers(_displayActualSize);
			
			_displayActualSizeButton = new Button();
			_displayActualSizeButton.label = ResourceUtil.getInstance().getString("bbb.desktopView.actualSize");
			_displayActualSizeButton.addEventListener(MouseEvent.CLICK, changeDisplayMode)
			this.addEventListener(MouseEvent.MOUSE_OVER, mouseOverWindow);
			this.addEventListener(MouseEvent.MOUSE_OUT, mouseOutWindow)
			addElement(_displayActualSizeButton);
			
			this.addEventListener(MoveEvent.MOVE, moveWindow)
		}
		
		private function mouseOverWindow(e:MouseEvent):void {
			showDisplayActualSizeButton(true);
		}
		
		private function mouseOutWindow(e:MouseEvent):void {
			showDisplayActualSizeButton(false);
		}
		
		private function scrollChange(e:Event):void {
			setDeskshareVideoPosition(this.width, this.height);
		}
		
		private function showDisplayActualSizeButton(value:Boolean):void {
			_displayActualSizeButton.visible = value;
			_displayActualSizeButton.includeInLayout = value;
		}
		
		private function showScrollers(value:Boolean):void {
			_vscroll.visible = value;
			_hscroll.visible = value;
		}
		
		private function changeDisplayMode(e:MouseEvent):void {
			if (_displayActualSize) {
				_displayActualSize = false;
				_displayActualSizeButton.label = ResourceUtil.getInstance().getString("bbb.desktopView.actualSize");
				
			} else {
				_displayActualSize = true;
				_displayActualSizeButton.label = ResourceUtil.getInstance().getString("bbb.desktopView.fitToWindow");
			}
			showScrollers(_displayActualSize);
			setDeskshareVideoPosition(this.width, this.height);
		}
		
		private function setDeskshareVideoPosition(w:Number, h:Number):void {
			if (_deskshareVideoView) {
				// validates the view to get actual components dimensions
				this.validateNow();
				// limit the view the window borders
				h -= titleBarOverlay.height + 3;
				w -= 2;
				if (_displayActualSize) {
					// if deskshare video fits window, hide scroll bars
					if (_deskshareVideoView.videoWidth < w) {
						_hscroll.value = 50;
						_hscroll.visible = false;
					} else {
						_hscroll.visible = true;
						h -= _hscroll.height;
					}
					if (_deskshareVideoView.videoHeight < h) {
						_vscroll.value = 50;
						_vscroll.visible = false;
					} else {
						_vscroll.visible = true;
						w -= _vscroll.width;
					}
					_deskshareVideoView.displayOriginalSize(w, h, _hscroll.value, _vscroll.value);
					_hscroll.width = w;
					_vscroll.height = h;
					_vscroll.x = w;
					_hscroll.y = h;
				} else {
					_deskshareVideoView.setVideoPosition(x, y, w, h);
				}
			}
			_deskshareGroup.width = w;
			_deskshareGroup.height = h;
			_displayActualSizeButton.x = (w - _displayActualSizeButton.width) / 2;
			_displayActualSizeButton.y = h - titleBarOverlay.height * 2;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			setDeskshareVideoPosition(w, h);
		}
		
		private function moveWindow(e:MoveEvent):void {
			setDeskshareVideoPosition(this.width, this.height);
		}
		
		public function showWindow():void {
			this.visible = true;
			this.includeInLayout = true;
		}
		
		public function hideWindow():void {
			this.visible = false;
			this.includeInLayout = false;
		}
		
		public function get deskshareGroup():Group {
			return _deskshareGroup;
		}
		
		public function startStream(connection:NetConnection, name:String, streamName:String, userID:String, width:Number, height:Number):void {
			if (_deskshareVideoView) {
				stopStream();
			}
			_deskshareVideoView = new DeskshareVideoView(_videoDisplay);
			_deskshareVideoView.percentWidth = 100;
			_deskshareVideoView.percentHeight = 100;
			_deskshareGroup.addElement(_deskshareVideoView);
			_deskshareVideoView.addVideo();
			_deskshareVideoView.initializeScreenSizeValues(width, height, this.deskshareGroup.height, this.deskshareGroup.width);
			_deskshareVideoView.startStream(connection, name, streamName, userID);
			setDeskshareVideoPosition(this.width, this.height);
			_deskshareVideoView.addMouse();
		}
		
		public function changeMouseLocation(x:Number, y:Number):void {
			if (_deskshareVideoView) {
				_deskshareVideoView.moveMouse(x, y);
			}
		}
		
		/**
		 * Close the video stream and remove video from layout
		 */
		public function stopStream():void {
			if (_deskshareVideoView) {
				_deskshareVideoView.removeMouse();
				_deskshareVideoView.close();
				if (this.deskshareGroup.containsElement(_deskshareVideoView)) {
					this.deskshareGroup.removeElement(_deskshareVideoView);
				}
				_deskshareVideoView = null;
			}
		}
	}
}

