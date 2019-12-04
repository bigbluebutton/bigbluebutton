/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.main.model
{
  import flash.display.Bitmap;
  import flash.display.Loader;
  import flash.events.Event;
  import flash.events.IOErrorEvent;
  import flash.net.URLRequest;
  import flash.system.LoaderContext;
  
  import mx.controls.Image;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;

  public class ImageLoader
  {
	private static const LOGGER:ILogger = getClassLogger(ImageLoader);

    private var _src:String;
    private var _callback:Function;

    public function load(src:String, onSuccessCallback:Function):void {
      _src = src;
      _callback = onSuccessCallback;

      loadBitmap();
    }

    private function loadBitmap():void {
      LOGGER.debug("loadBitmap");
      var backgroundLoader:Loader = new Loader();
      backgroundLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, onBitmapLoaded, false, 0, true);
      backgroundLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onBitmapIoError);
      var context:LoaderContext = new LoaderContext();
      context.checkPolicyFile = true;
      var request:URLRequest = new URLRequest(_src);
      backgroundLoader.load(request , context);
    }

    private function onBitmapIoError(e:IOErrorEvent):void {
	  LOGGER.error("onBitmapIoError: " + e.toString());
    }

    private function onBitmapLoaded(e:Event):void {
      LOGGER.debug("onBitmapLoaded");
      try {
        var backgroundBitmap:Bitmap = Bitmap(e.target.content);
        backgroundBitmap.smoothing = true;
        _callback(backgroundBitmap, backgroundBitmap.width, backgroundBitmap.height);
      } catch(error:Error) {
        LOGGER.error("onBitmapLoaded error: " + error.toString());
        loadImage();
      }
    }

    private function loadImage():void {
      LOGGER.debug("loadImage");
      var image:Image = new Image();
      image.addEventListener(Event.COMPLETE, onImageLoaded);
      image.addEventListener(IOErrorEvent.IO_ERROR, onImageIoError);
      image.load(_src);
    }

    private function onImageLoaded(e:Event):void {
      LOGGER.debug("onImageLoaded");
      _callback(e.currentTarget, e.currentTarget.contentWidth, e.currentTarget.contentHeight);
    }

    private function onImageIoError(e:IOErrorEvent):void {
      LOGGER.error("onImageIoError: " + e.toString());
    }
  }
}
