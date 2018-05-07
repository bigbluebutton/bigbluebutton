package org.bigbluebutton.main.views
{

    import flash.events.ActivityEvent;
    import flash.events.StatusEvent;
    import flash.events.TimerEvent;
    import flash.media.Camera;
    import flash.media.Video;
    import flash.net.NetStream;
    import flash.system.Security;
    import flash.system.SecurityPanel;
    import flash.utils.Timer;
    
    import mx.events.FlexEvent;
    
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.model.VideoProfile;
    import org.bigbluebutton.util.i18n.ResourceUtil;

    public class VideoWithWarnings extends VideoWithWarningsBase {

		private static const LOGGER:ILogger = getClassLogger(VideoWithWarnings);

		private var hideWarningTimer:Timer = null;
        private var _camera:Camera = null;
        private var _activationTimer:Timer = null;
        private var _waitingForActivation:Boolean = false;
        private var _cameraAccessDenied:Boolean = false;
        // TODO do something with this property
        private var _chromePermissionDenied:Boolean = false;
        private var _videoProfile:VideoProfile = null;
        private var _showPreviewMsg:Boolean = false;
        private var _video:Video = new Video();
        private var _creationCompleted:Boolean = false;

        private var _successCallback:Function = null;
        private var _failCallback:Function = null;

        public function VideoWithWarnings() {
            super();
        }

        override protected function creationCompleteHandler(e:FlexEvent):void {
			super.creationCompleteHandler(e);

            _video.smoothing = true;
            _videoHolder.addChild(_video);

            _creationCompleted = true;
        }

        public function cameraState():Boolean {
            return _camera != null;
        }

        public function getCamera():Camera {
            return _camera;
        }

        public function videoFilters(f:Array):void {
            _video.filters = f;
        }

        private function hideWarning(e:TimerEvent):void {
            _text.visible = false;
        }

        private function showMessageHelper(resourceName:String, autoHide:Boolean, styleName:String):void {
            const text:String = ResourceUtil.getInstance().getString(resourceName);

            if (hideWarningTimer != null) {
                hideWarningTimer.stop()
                hideWarningTimer = null;
            }

            if (autoHide) {
                hideWarningTimer = new Timer(3000, 1);
                hideWarningTimer.addEventListener(TimerEvent.TIMER, hideWarning);
                hideWarningTimer.start();
            }

            _text.text = text;
            // _text.text = "The quick brown fox jumps over the lazy dog";
            _text.setStyle("styleName", styleName);
            _text.visible = true;
            LOGGER.debug("Showing warning: {0}", [text]);
        }

        private function showError(resourceName:String, autoHide:Boolean=false):void {
            showMessageHelper(resourceName, autoHide, "videoMessageErrorLabelStyle");
        }

        private function showWarning(resourceName:String, autoHide:Boolean=false):void {
            showMessageHelper(resourceName, autoHide, "videoMessageWarningLabelStyle");
        }

        public function set successCallback(f:Function):void {
            _successCallback = f;
        }
        
        public function get successCallback():Function {
            return _successCallback;
        }

        public function set failCallback(f:Function):void {
            _failCallback = f;
        }
        
        public function get failCallback():Function {
            return _failCallback;
        }

        private function onSuccessCallback():void {
            if (_showPreviewMsg) {
                showWarning('bbb.video.publish.hint.videoPreview');
            } else {
                _text.visible = false;
                _text.text = " ";
            }

            if (_successCallback != null) {
                _successCallback();
            }
        }

        private function onFailCallback(resourceName:String):void {
            showError(resourceName);
            if (_failCallback != null) {
                _failCallback(resourceName);
            }
            imgChromeHelp.visible = false;
        }

        public function updateCamera(camIndex:int, vp:VideoProfile, containerWidth:int, containerHeight:int, showPreviewMsg:Boolean=false):void {
            disableCamera();

            _videoProfile = vp;
            _showPreviewMsg = showPreviewMsg;

            _camera = Camera.getCamera(camIndex.toString());
            if (camIndex == -1) {
                onFailCallback('bbb.video.publish.hint.noCamera');
            } else if (_camera == null) {
                onFailCallback('bbb.video.publish.hint.cantOpenCamera');
            } else {
                _camera.addEventListener(ActivityEvent.ACTIVITY, onActivityEvent);
                _camera.addEventListener(StatusEvent.STATUS, onStatusEvent);

                if (_camera.muted) {
                    if (_cameraAccessDenied && !_chromePermissionDenied) {
                        Security.showSettings(SecurityPanel.PRIVACY)
                    } else if (_chromePermissionDenied) {
                        showWarning('bbb.video.publish.hint.cameraDenied');
                    } else {
                        onFailCallback('bbb.video.publish.hint.waitingApproval');
                    }
                } else {
                    onCameraAccessAllowed();
                }

                displayVideoPreview();
            }

            this.width = containerWidth;
            this.height = containerHeight;
            invalidateDisplayList();
        }

        private function displayVideoPreview():void {
            _camera.setMotionLevel(5, 1000);
            _camera.setKeyFrameInterval(_videoProfile.keyFrameInterval);
            _camera.setMode(_videoProfile.width, _videoProfile.height, _videoProfile.modeFps);
            _camera.setQuality(_videoProfile.qualityBandwidth, _videoProfile.qualityPicture);

            if (_camera.width != _videoProfile.width || _camera.height != _videoProfile.height)
                LOGGER.debug("Resolution {0}x{1} is not supported, using {2}x{3} instead", [_videoProfile.width, _videoProfile.height, _camera.width, _camera.height]);

            	_video.attachCamera(_camera);
        }

        override protected function updateDisplayList(w:Number, h:Number):void {
            super.updateDisplayList(w, h);

            var videoWidth:int;
            var videoHeight:int;

            if (_creationCompleted && _videoProfile != null) {
                var ar:Number = _videoProfile.width / _videoProfile.height;
                if (w / h > ar) {
                    videoWidth  = Math.ceil(h * ar);
                    videoHeight = h;
                } else {
                    videoWidth  = w;
                    videoHeight = Math.ceil(w / ar);
                }
                videoCanvas.width  = _video.width  = videoWidth;
                videoCanvas.height = _video.height = videoHeight;
            }
        }

        public function attachNetStream(ns:NetStream, vp:VideoProfile, containerWidth:int, containerHeight:int):void {
            disableCamera();
            _videoProfile = vp;
            _video.attachNetStream(ns);

            this.width = containerWidth;
            this.height = containerHeight;
            invalidateDisplayList();
        }

        public function disableCamera():void {
            _video.clear();
            _video.attachCamera(null);
            _camera = null;
        }

        private function onActivityEvent(e:ActivityEvent):void {
            if (_waitingForActivation && e.activating) {
                _activationTimer.stop();
                _waitingForActivation = false;

                onSuccessCallback();
                imgChromeHelp.visible = false;
            }
        }

        private function onStatusEvent(e:StatusEvent):void {
            if (e.code == "Camera.Unmuted") {
                onCameraAccessAllowed();
            } else {
                onCameraAccessDisallowed();
            }
        }

        private function onCameraAccessAllowed():void {
            // this is just to overwrite the message of waiting for approval
            onFailCallback('bbb.video.publish.hint.openingCamera');

            _cameraAccessDenied = false;

            // set timer to ensure that the camera activates.  If not, it might be in use by another application
            _waitingForActivation = true;
            if (_activationTimer != null) {
                _activationTimer.stop();
            }

            _activationTimer = new Timer(10000, 1);
            _activationTimer.addEventListener(TimerEvent.TIMER, activationTimeout);
            _activationTimer.start();
        }

        private function onCameraAccessDisallowed():void {
            onFailCallback('bbb.video.publish.hint.cameraDenied');
            _cameraAccessDenied = true;
        }

        private function activationTimeout(e:TimerEvent):void {
            onFailCallback('bbb.video.publish.hint.cameraIsBeingUsed');
        }

        public function set chromePermissionDenied(value:Boolean):void {
            _chromePermissionDenied = value;
        }
    }
}
