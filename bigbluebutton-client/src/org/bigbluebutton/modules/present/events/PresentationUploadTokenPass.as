package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;

  public class PresentationUploadTokenPass extends Event {
    public static const PRESENTATION_UPLOAD_TOKEN_PASS:String = "PresentationUploadTokenPass";

    public var podId: String;
    public var token: String;
    public var filename: String;

    public function PresentationUploadTokenPass(_podId: String, _token: String, _filename: String) {
      super(PRESENTATION_UPLOAD_TOKEN_PASS, true, false);
      this.podId = _podId;
      this.token = _token;
      this.filename = _filename;
    }
  }
}
