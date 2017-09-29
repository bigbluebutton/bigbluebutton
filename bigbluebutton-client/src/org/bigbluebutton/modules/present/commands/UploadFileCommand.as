package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  import flash.net.FileReference;
  
  public class UploadFileCommand extends Event
  {
    public static const UPLOAD_FILE:String = "presentation upload file command";
    
    public var filename:String;
    public var file:FileReference;
    public var isDownloadable:Boolean;
    public var podId: String;
    
    public function UploadFileCommand()
    {
      super(UPLOAD_FILE, true, false);
    }
  }
}