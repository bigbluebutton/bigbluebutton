package org.bigbluebutton.air.main.models {
	import org.osflash.signals.ISignal;
	
	public interface IMedia {
		function get cameraAvailable():Boolean;
		function get cameraPermissionGranted():Boolean;
		function get microphoneAvailable():Boolean;
		function get microphonePermissionGranted():Boolean;
		function get cameraPermissionSignal():ISignal;
		function get microphonePermissionSignal():ISignal;
		function requestCameraPermission():void;
		function requestMicrophonePermission():void;
	}
}
