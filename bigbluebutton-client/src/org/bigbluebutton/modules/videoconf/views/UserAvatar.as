package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.Loader;
    import flash.events.Event;
    import flash.net.URLRequest;
    
    import mx.core.UIComponent;

    public class UserAvatar extends UserGraphic {

      private var _imageLoader:Loader = null;
      private var _completed:Boolean;

      public function UserAvatar() {
          super();
      }

      public function load(avatarUrl:String):void {
          _imageLoader = new Loader;
          _completed = false;

          _imageLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoadingComplete);
          
          var request:URLRequest = new URLRequest(avatarUrl);
          _imageLoader.load(request);
      }

      private function onLoadingComplete(event:Event):void {
          _completed = true;
          addChild(_imageLoader);
          setOriginalDimensions(_imageLoader.width, _imageLoader.height);
          if (parent && parent is UIComponent) 
            UIComponent(parent).invalidateDisplayList();
      }

      override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
          super.updateDisplayList(unscaledWidth, unscaledHeight);

          if (_completed) {
              updateDisplayListHelper(unscaledWidth, unscaledHeight, _imageLoader);
          }
      }

    }
}