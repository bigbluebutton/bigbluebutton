package org.bigbluebutton.web.user.views {
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import mx.core.UIComponent;
	
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.gridClasses.GridItemRenderer;
	import spark.layouts.HorizontalLayout;
	
	public class MediaItemRenderer extends GridItemRenderer {
		private var webcamButton:Button;
		private var microphoneButton:Button;
		private var kickButton:Button;
		
		private var amIModerator:Boolean = false;
		
		public function MediaItemRenderer() {
			super();
			
			clipAndEnableScrolling = true;
			
			var l:HorizontalLayout = new HorizontalLayout();
			l.gap = 0
			layout = l;

			webcamButton = new Button();
			webcamButton.enabled = false;
			webcamButton.width = 21;
			webcamButton.height = 21;
			addElement(webcamButton);
			microphoneButton = new Button();
			microphoneButton.enabled = false;
			microphoneButton.width = 21;
			microphoneButton.height = 21;
			microphoneButton.addEventListener(MouseEvent.CLICK, handleMicButtonClickEvent);
			addElement(microphoneButton);
			kickButton = new Button();
			kickButton.styleName = "userButtonStyle mediaKickStyle";
			kickButton.enabled = false;
			kickButton.width = 21;
			kickButton.height = 21;
			kickButton.addEventListener(MouseEvent.CLICK, handleKickButtonClickEvent);
			addElement(kickButton);
		}
		
		private function handleMicButtonClickEvent(e:MouseEvent):void {
			if (data != null) {
				(grid.dataGrid as UserDataGrid).changeMute(data.userID, !data.muted);
			}
		}
		
		private function handleKickButtonClickEvent(e:MouseEvent):void {
			if (data != null) {
				(grid.dataGrid as UserDataGrid).kickUser(data.userID);
			}
		}
		
		override public function prepare(hasBeenRecycled:Boolean):void {
			// this.currentState
			
			if (data != null) {
				var amIModerator:Boolean = (grid.dataGrid as UserDataGrid).amIModerator;
				
				if (data.hasStream) {
					//if (data.viewingStream || data.me) {
						webcamButton.styleName = "userButtonStyle mediaWebcamStyle";
						webcamButton.enabled = false;
					/*} else {
						webcamButton.styleName = "userButtonStyle mediaWebcamStyle";
						webcamButton.enabled = true;
					}*/
				} else {
					webcamButton.styleName = "userButtonStyle";
					webcamButton.enabled = false;
				}//this.grid
				//this.hovered
				
				if (data.voiceJoined) {
					if (hovered && !data.muted && (amIModerator || data.me)) {
						microphoneButton.styleName = "userButtonStyle mediaMutedStyle";
						microphoneButton.enabled = true;
					} else if (hovered && data.muted && data.me) {
						microphoneButton.styleName = "userButtonStyle mediaMicrophoneStyle";
						microphoneButton.enabled = true;
					} else if (data.muted) {
						microphoneButton.styleName = "userButtonStyle mediaMutedStyle";
						microphoneButton.enabled = false;
					} else {
						microphoneButton.styleName = "userButtonStyle mediaMicrophoneStyle";
						microphoneButton.enabled = false;
					}
				} else if (data.listenOnly) {
					microphoneButton.styleName = "userButtonStyle mediaListenStyle";
					microphoneButton.enabled = false;
				} else {
					microphoneButton.styleName = "userButtonStyle";
					microphoneButton.enabled = false;
				}
				
				kickButton.visible = kickButton.enabled = !data.me && hovered && amIModerator;
			}
		}
	}
}
