package org.bigbluebutton.lib.video.services {
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.media.Camera;
	import flash.media.CameraPosition;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.common.services.DefaultConnectionCallback;
	import org.bigbluebutton.lib.common.services.IBaseConnection;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class VideoConnection extends DefaultConnectionCallback implements IVideoConnection {
		private const LOG:String = "VideoConnection::";
		
		[Inject]
		public var baseConnection:IBaseConnection;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var saveData:ISaveData;
		
		private var _ns:NetStream;
		
		private var _cameraPosition:String;
		
		protected var _connectionSuccessSignal:ISignal = new Signal();
		
		protected var _connectionFailureSignal:ISignal = new Signal();
		
		protected var _applicationURI:String;
		
		private var _camera:Camera;
		
		private var _selectedCameraQuality:VideoProfile;
		
		public static var CAMERA_QUALITY_LOW:int = 0;
		
		public static var CAMERA_QUALITY_MEDIUM:int = 1;
		
		public static var CAMERA_QUALITY_HIGH:int = 2;
		
		public function VideoConnection() {
		}
		
		[PostConstruct]
		public function init():void {
			baseConnection.init(this);
			userSession.successJoiningMeetingSignal.add(loadCameraSettings)
			baseConnection.connectionSuccessSignal.add(onConnectionSuccess);
			baseConnection.connectionFailureSignal.add(onConnectionFailure);
		}
		
		private function loadCameraSettings():void {
			if (saveData.read("cameraQuality") != null) {
				_selectedCameraQuality = userSession.videoProfileManager.getVideoProfileById(saveData.read("cameraQuality") as String);
				if (!_selectedCameraQuality) {
					_selectedCameraQuality = userSession.videoProfileManager.defaultVideoProfile;
					trace("selected camera quality " + _selectedCameraQuality)
				}
			} else {
				_selectedCameraQuality = userSession.videoProfileManager.defaultVideoProfile;
			}
			if (saveData.read("cameraPosition") != null) {
				_cameraPosition = saveData.read("cameraPosition") as String;
			} else if(this.hasOwnProperty("CameraPosition")){
				_cameraPosition = CameraPosition.FRONT;
			}
		}
		
		private function onConnectionFailure(reason:String):void {
			connectionFailureSignal.dispatch(reason);
		}
		
		private function onConnectionSuccess():void {
			_ns = new NetStream(baseConnection.connection);
			connectionSuccessSignal.dispatch();
		}
		
		public function get connectionFailureSignal():ISignal {
			return _connectionFailureSignal;
		}
		
		public function get connectionSuccessSignal():ISignal {
			return _connectionSuccessSignal;
		}
		
		public function set uri(uri:String):void {
			_applicationURI = uri;
		}
		
		public function get uri():String {
			return _applicationURI;
		}
		
		public function get connection():NetConnection {
			return baseConnection.connection;
		}
		
		public function connect():void {
			baseConnection.connect(uri, conferenceParameters.externMeetingID, conferenceParameters.username);
		}
		
		public function get cameraPosition():String {
			return _cameraPosition;
		}
		
		public function set cameraPosition(position:String):void {
			_cameraPosition = position;
		}
		
		public function get camera():Camera {
			return _camera;
		}
		
		public function set camera(value:Camera):void {
			_camera = value;
		}
		
		public function get selectedCameraQuality():VideoProfile {
			return _selectedCameraQuality;
		}
		
		public function set selectedCameraQuality(profile:VideoProfile):void {
			_selectedCameraQuality = profile;
		}
		
		/**
		 * Set video quality based on the user selection
		 **/
		public function selectCameraQuality(profile:VideoProfile):void {
			camera.setQuality(profile.qualityBandwidth, profile.qualityPicture);
			selectedCameraQuality = profile;
		}
		
		public function startPublishing(camera:Camera, streamName:String):void {
			_ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			_ns.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			_ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			_ns.client = this;
			_ns.attachCamera(camera);
			_ns.publish(streamName);
		}
		
		private function onNetStatus(e:NetStatusEvent):void {
			trace(LOG + "onNetStatus() " + e.info.code);
		}
		
		private function onIOError(e:IOErrorEvent):void {
			trace(LOG + "onIOError() " + e.toString());
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void {
			trace(LOG + "onAsyncError() " + e.toString());
		}
		
		public function stopPublishing():void {
			if (_ns != null) {
				_ns.attachCamera(null);
				_ns.close();
				_ns = null;
				_ns = new NetStream(baseConnection.connection);
			}
		}
	}
}
