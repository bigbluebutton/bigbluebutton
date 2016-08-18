package org.bigbluebutton.modules.deskshare.view.components
{
    import mx.events.FlexEvent;
    import mx.core.UIComponent;

    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.util.i18n.ResourceUtil;
    import org.bigbluebutton.main.views.VideoWithWarningsBase;
    import org.bigbluebutton.core.UsersUtil;

    public class VideoWithWarnings extends VideoWithWarningsBase {

        private static const LOGGER:ILogger = getClassLogger(VideoWithWarnings);

        private var callback:Function = null;

        public function VideoWithWarnings() {
            super();
            this.addEventListener(FlexEvent.CREATION_COMPLETE , creationCompleteHandler);
        }

        private function creationCompleteHandler(e:FlexEvent):void {
            if(callback != null) {
               callback();
               if(UsersUtil.amIPresenter())
                  setWarning();
            }
        }

        private function setWarning():void {
            _text.setStyle("styleName", "deskshareWarningLabelStyle");
            _text.text = ResourceUtil.getInstance().getString('bbb.desktopPublish.sharingMessage');
            _text.visible = true;
            _textBackground.setStyle("styleName", "deskshareWarningBackgroundStyle");
        }

        public function setCallback(callback:Function):void {
            this.callback = callback;
        }

        public function get videoHolder():UIComponent {
            return _videoHolder;
        }
    }
}
