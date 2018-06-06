package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;

  public class PresentationUploadTokenFail extends Event {
    public static const PRESENTATION_UPLOAD_TOKEN_FAIL:String = "PresentationUploadTokenFail";

    public var podId: String;
    public var filename: String;

    public function PresentationUploadTokenFail(_podId: String, _filename: String) {
      super(PRESENTATION_UPLOAD_TOKEN_FAIL, true, false);
      this.podId = _podId;
      this.filename = _filename;
    }
  }
}
