package org.bigbluebutton.air.main.models {
	import flash.events.PermissionEvent;
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.permissions.PermissionStatus;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class Media implements IMedia {
		
		private var _cameraPermissionSignal:Signal = new Signal();
		
		public function get cameraPermissionSignal():ISignal {
			return _cameraPermissionSignal;
		}
		
		private var _microphonePermissionSignal:Signal = new Signal();
		
		public function get microphonePermissionSignal():ISignal {
			return _microphonePermissionSignal;
		}
		
		public function get cameraAvailable():Boolean {
			return Camera.isSupported;
		}
		
		public function get cameraPermissionGranted():Boolean {
			return Camera.permissionStatus == PermissionStatus.GRANTED;
		}
		
		public function get microphoneAvailable():Boolean {
			return Microphone.isSupported;
		}
		
		public function get microphonePermissionGranted():Boolean {
			return Microphone.permissionStatus == PermissionStatus.GRANTED;
		}
		
		public function requestCameraPermission():void {
			if (cameraAvailable && Camera.names.length > 0 && !cameraPermissionGranted) {
				var camera:Camera = Camera.getCamera(Camera.names[0]);
				
				if (camera == null) {
					camera = Camera.getCamera();
				}
				
				if (camera != null) {
					camera.addEventListener(PermissionEvent.PERMISSION_STATUS, function(event:PermissionEvent):void {
						cameraPermissionSignal.dispatch(event.status);
					});
					try {
						camera.requestPermission();
					} catch (error:Error) {
						// Handle permission request impossible
					}
				}
			}
		}
		
		public function requestMicrophonePermission():void {
			if (microphoneAvailable && !microphonePermissionGranted) {
				var selectedMicrophone:Microphone = Microphone.getMicrophone();
				
				if (selectedMicrophone) {
					selectedMicrophone.addEventListener(PermissionEvent.PERMISSION_STATUS, function(event:PermissionEvent):void {
						microphonePermissionSignal.dispatch(event.status);
					});
					
					try {
						selectedMicrophone.requestPermission();
					} catch (error:Error) {
						// Handle permission request impossible
					}
				}
			}
		}
	}
}
