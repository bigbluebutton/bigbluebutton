package org.bigbluebutton.main.views
{

    import com.asfusion.mate.events.Dispatcher;
    import flash.events.StatusEvent;
    import flash.events.TimerEvent;
    import flash.events.ActivityEvent;
    import flash.media.Camera;
    import flash.media.Video
    import flash.net.NetStream;
    import flash.system.Security;
    import flash.system.SecurityPanel;
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.text.TextFieldAutoSize;
    import flash.utils.Timer;
    import mx.core.UIComponent;
    import mx.containers.Canvas;
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.VideoProfile;
    import org.bigbluebutton.util.i18n.ResourceUtil;

    public class VideoWithWarnings extends UIComponent{

        private var hideWarningTimer:Timer = null;
        private var _camera:Camera = null;
        private var _activationTimer:Timer = null;
        private var _waitingForActivation:Boolean = false;
        private var _cameraAccessDenied:Boolean = false;
        private var _video:Video=null;
        private var label:TextField;
        private var _videoProfile:VideoProfile;
        private var _filters:Array=null;
        private var _showPreviewMsg=false;

        public function VideoWithWarnings(vp:VideoProfile=null){
            super();
            videoProfile = vp;
            label = new TextField();
            label.setTextFormat(new TextFormat());
            label.selectable = false;
            label.multiline = true;
            label.wordWrap = true;
            label.autoSize = TextFieldAutoSize.CENTER;
            addChild(label);
        }

        public function cameraState():Boolean { return _camera != null;}

        public function getCamera():Camera { return _camera;}

        public function set videoProfile(vp:VideoProfile):void {_videoProfile = vp;}
        
        public function get videoProfile():VideoProfile {return _videoProfile;}

        public function videoFilters(f:Array):void { _filters = f;}

        private function attachCamera(c:Camera):void {_video.attachCamera(c);}

        private function clear():void { _video.clear();}

        private function hideWarning(e:TimerEvent):void { label.visible = false; }

        private function showWarning(resourceName:String, autoHide:Boolean=false, color:int=0xFF0000):void {
            const text:String = ResourceUtil.getInstance().getString(resourceName);

            if (hideWarningTimer != null)
                hideWarningTimer.stop();

            if (autoHide) {
                hideWarningTimer = new Timer(3000, 1);
                hideWarningTimer.addEventListener(TimerEvent.TIMER, hideWarning);
                hideWarningTimer.start();
            }

            // bring the label to front
            label.text = text;
            label.textColor=color;
            label.visible = true;
            resizeText(); 
            LogUtil.debug("Showing warning: " + text);
        }
        
        public function updateCamera(camIndex:int, showPreviewMsg:Boolean=false):void {

            disableCamera();
            _camera = Camera.getCamera(camIndex.toString());

            if (_camera == null) {
                showWarning('bbb.video.publish.hint.cantOpenCamera');
                return;
            }

            _showPreviewMsg = showPreviewMsg;
            _camera.addEventListener(ActivityEvent.ACTIVITY, onActivityEvent);
            _camera.addEventListener(StatusEvent.STATUS, onStatusEvent);

            if (_camera.muted)
                if (_cameraAccessDenied)
                    Security.showSettings(SecurityPanel.PRIVACY)
                else
                    showWarning('bbb.video.publish.hint.waitingApproval');
            else
                onCameraAccessAllowed();

            displayVideoPreview();
            invalidateDisplayList();
        }
        
        private function displayVideoPreview():void {
            trace("Using this video profile:: " + _videoProfile.toString());
            _camera.setMotionLevel(5, 1000);
            _camera.setKeyFrameInterval(_videoProfile.keyFrameInterval);
            _camera.setMode(_videoProfile.width, _videoProfile.height, _videoProfile.modeFps);
            _camera.setQuality(_videoProfile.qualityBandwidth, _videoProfile.qualityPicture);

            if (_camera.width != _videoProfile.width || _camera.height != _videoProfile.height)
                LogUtil.debug("Resolution " + _videoProfile.width + "x" + _videoProfile.height + " is not supported, using " + _camera.width + "x" + _camera.height + " instead");

            addVideo(_camera.width, _camera.height);
            attachCamera(_camera);
        }

        private function resizeText():void
        {
            label.width = this.width;
            var lblFormat:TextFormat = label.getTextFormat();
            lblFormat.size=17;
            label.setTextFormat(lblFormat);
            label.y=(int) (this.height - label.height);
            label.x=(int) (this.width - label.textWidth)/2;
        }

        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            if(_video){
                if(unscaledWidth/unscaledHeight > _videoProfile.width/_videoProfile.height){
                    width = width = _video.width = unscaledHeight / _videoProfile.height * _videoProfile.width;
                    height = _video.height = unscaledHeight;
                } else {
                    height = _video.height = unscaledWidth * _videoProfile.height / _videoProfile.width;
                    width = _video.width = unscaledWidth;
                }
                resizeText();
            }
        }

        private function addVideo(w:int=320, h:int=240):void{ 
            _video = new Video(w, h);
            if(_filters)
                _video.filters=_filters;
            _video.smoothing = true;
            addChild(_video);
            setChildIndex(_video, 0);
        }

        public function attachNetStream(ns:NetStream):void {
            disableCamera();
            addVideo(_videoProfile.width, _videoProfile.height);
            _video.attachNetStream(ns);
        }

        public function disableCamera():void {
            if(_video){
                clear();
                attachCamera(null);
                removeChild(_video)
            }
            _video = null;
            _camera = null;
        }
        private function onActivityEvent(e:ActivityEvent):void {
            if (_waitingForActivation && e.activating) {
                _activationTimer.stop();
                if(_showPreviewMsg)
                    showWarning('bbb.video.publish.hint.videoPreview', false, 0xFFFF00);
                else
                    label.visible = false;
                _waitingForActivation = false;
            }
        }

        private function onStatusEvent(e:StatusEvent):void {
            if (e.code == "Camera.Unmuted") {
                onCameraAccessAllowed();
                // this is just to overwrite the message of waiting for approval
                showWarning('bbb.video.publish.hint.openingCamera');
            } else {
                onCameraAccessDisallowed();
            }
        }

        private function onCameraAccessAllowed():void {
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
            showWarning('bbb.video.publish.hint.cameraDenied');
            _cameraAccessDenied = true;
        }

        private function activationTimeout(e:TimerEvent):void {
            showWarning('bbb.video.publish.hint.cameraIsBeingUsed');
        }
    }
}
