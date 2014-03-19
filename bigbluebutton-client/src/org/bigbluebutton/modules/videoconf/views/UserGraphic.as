package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.DisplayObject;
    import mx.containers.Canvas;
    import mx.core.UIComponent;

    import org.bigbluebutton.main.model.users.BBBUser;
    import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

    public class UserGraphic extends UIComponent {

        protected var _user:BBBUser = null;
        protected var _options:VideoConfOptions;
        protected var _origWidth:Number = 320;
        protected var _origHeight:Number = 240;
        protected var _background:Canvas;

        public function UserGraphic() {
            _background = new Canvas();
            _background.setStyle("backgroundColor","red");
            _background.setStyle("borderStyle","solid");
            _background.setStyle("borderColor","#000000");
            _background.setStyle("borderThickness","1");
            addChild(_background);
        }

        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);

            _background.width = unscaledWidth;
            _background.height = unscaledHeight;
        }

        protected function setOriginalDimensions(width:Number, height:Number):void {
            _origWidth = width;
            _origHeight = height;
        }

        public function get aspectRatio():Number {
            return _origWidth / _origHeight;
        }

        private var _previousUnscaledWidth:Number;
        private var _previousUnscaledHeight:Number;
        private var _object_x:Number;
        private var _object_y:Number;

        protected function resetGraphicDimensions(object:DisplayObject, unscaledWidth:Number, unscaledHeight:Number):void {
//            if (_previousUnscaledWidth != unscaledWidth || _previousUnscaledHeight != unscaledHeight) {
//                trace("=============> updateDisplayList " + unscaledWidth + " " + unscaledHeight);
                if (unscaledWidth / unscaledHeight > aspectRatio) {
                    object.height = unscaledHeight;
                    object.width = Math.ceil(unscaledHeight * aspectRatio);
                    _object_y = 0;
                    _object_x = Math.ceil((unscaledWidth - object.width) / 2);
                } else {
                    object.width = unscaledWidth;
                    object.height = Math.ceil(unscaledWidth / aspectRatio);
                    _object_x = 0;
                    _object_y = Math.ceil((unscaledHeight - object.height) / 2);
                }
                _previousUnscaledWidth = unscaledWidth;
                _previousUnscaledHeight = unscaledHeight;
                object.x = _object_x;
                object.y = _object_y;
//            }
        }

        public function set user(value:BBBUser):void {
            _user = value;
        }

        public function get user():BBBUser {
            return _user;
        }

        public function set options(value:VideoConfOptions):void {
            _options = value;
        }

        public function get options():VideoConfOptions {
            return _options;
        }
    }
}