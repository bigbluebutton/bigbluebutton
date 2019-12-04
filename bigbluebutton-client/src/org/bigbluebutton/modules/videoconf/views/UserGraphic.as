package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.DisplayObject;
    
    import mx.containers.Canvas;
    import mx.core.UIComponent;
    
    import org.bigbluebutton.core.model.users.User2x;
    import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

    public class UserGraphic extends UIComponent {
        protected var _user:User2x = null;
        protected var _options:VideoConfOptions;
        protected var _origWidth:Number = 320;
        protected var _origHeight:Number = 240;
        protected var _background:Canvas;

        protected var BORDER_THICKNESS:int = 0;

        public function UserGraphic() {
            super();

            _background = new Canvas();
			_background.styleName = "userGraphicBackground";
            _background.horizontalScrollPolicy = "off";
            _background.verticalScrollPolicy = "off";
			BORDER_THICKNESS = _background.getStyle("borderThickness");

            addChild(_background);
        }

        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);

            _background.setActualSize(unscaledWidth, unscaledHeight);
        }

        protected function setOriginalDimensions(width:Number, height:Number):void {
            _origWidth = width;
            _origHeight = height;
            invalidateDisplayList();
        }

        public function get aspectRatio():Number {
            return _origWidth / _origHeight;
        }

        protected function updateDisplayListHelper(unscaledWidth:Number, unscaledHeight:Number, object:DisplayObject):void {
            if (object == null) {
                return;
            }

            var object_x:Number;
            var object_y:Number;
            var object_width:Number;
            var object_height:Number;

            unscaledHeight -= BORDER_THICKNESS * 2;
            unscaledWidth -= BORDER_THICKNESS * 2;

            if (unscaledWidth / unscaledHeight > aspectRatio) {
                object_height = unscaledHeight;
                object_width = Math.ceil(unscaledHeight * aspectRatio);
                object_y = BORDER_THICKNESS;
                object_x = Math.floor((unscaledWidth - object_width) / 2);
            } else {
                object_width = unscaledWidth;
                object_height = Math.ceil(unscaledWidth / aspectRatio);
                object_x = BORDER_THICKNESS;
                object_y = Math.floor((unscaledHeight - object_height) / 2);
            }

            object.x = object_x;
            object.y = object_y;
            object.width = object_width;
            object.height = object_height;
        }

        public function set user(value:User2x):void {
            _user = value;
        }

        public function get user():User2x {
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