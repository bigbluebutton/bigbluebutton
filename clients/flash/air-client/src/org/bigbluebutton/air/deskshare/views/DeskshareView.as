package org.bigbluebutton.air.deskshare.views {
	
	import flash.display.StageOrientation;
	import flash.net.NetConnection;
	
	import mx.core.FlexGlobals;
	
	public class DeskshareView extends DeskshareViewBase implements IDeskshareViewAir {
		private var deskshareVideoView:DeskshareVideoView;
		
		/**
		 *  Create VideoView with the desktop sharing stream and add it to the layout
		 */
		public function startStream(connection:NetConnection, name:String, streamName:String, userID:String, width:Number, height:Number):void {
			if (deskshareVideoView)
				stopStream();
			deskshareVideoView = new DeskshareVideoView();
			deskshareVideoView.percentWidth = 100;
			deskshareVideoView.percentHeight = 100;
			this.addElement(deskshareVideoView);
			deskshareVideoView.initializeScreenSizeValues(width, height, this.deskshareGroup.height, this.deskshareGroup.width, FlexGlobals.topLevelApplication.topActionBar.height, FlexGlobals.topLevelApplication.bottomMenu.height);
			deskshareVideoView.startStream(connection, name, streamName, userID);
			deskshareVideoView.addMouseToStage();
			rotationHandler(FlexGlobals.topLevelApplication.currentOrientation);
		}
		
		public function changeMouseLocation(x:Number, y:Number):void {
			deskshareVideoView.moveMouse(x, y);
		}
		
		private function addMouseToStage():void {
			deskshareVideoView.addMouseToStage();
		}
		
		/**
		 * Close the video stream and remove video from layout
		 */
		public function stopStream():void {
			if (deskshareVideoView) {
				deskshareVideoView.close();
				if (this.deskshareGroup.containsElement(deskshareVideoView)) {
					this.deskshareGroup.removeElement(deskshareVideoView);
				}
				deskshareVideoView = null;
			}
		}
		
		override public function rotationHandler(rotation:String):void {
			if (deskshareVideoView != null) {
				switch (rotation) {
					case StageOrientation.ROTATED_LEFT:
						deskshareVideoView.rotateVideo(-90);
						break;
					case StageOrientation.ROTATED_RIGHT:
						deskshareVideoView.rotateVideo(90);
						break;
					case StageOrientation.UPSIDE_DOWN:
						deskshareVideoView.rotateVideo(180);
						break;
					case StageOrientation.DEFAULT:
					case StageOrientation.UNKNOWN:
					default:
						deskshareVideoView.rotateVideo(0);
				}
			}
		}
	}
}
