package org.bigbluebutton.core.model.users
{
  
  public class User2x {
    public var intId: String;
    public var extId: String;
    public var name: String;
    public var role: String;
    public var guest: Boolean;
    public var authed: Boolean;
    public var waitingForAcceptance: Boolean;
    public var emoji: String;
    public var locked: Boolean;
    public var presenter: Boolean;
    public var avatar: String;
    
    public var breakoutRooms: Array = new Array();
    
    // Flag to tell that user is in the process of leaving the meeting.
    public var isLeavingFlag:Boolean = false;
    
    [Bindable] private var _viewingStream:Array = new Array();
    
    [Bindable]
    public function get viewingStream():Array {
      return _viewingStream;
    }
    public function set viewingStream(v:Array):void {
      throw new Error("Please use the helpers addViewingStream or removeViewingStream to handle viewingStream");
    }
    public function addViewingStream(streamName:String):Boolean {
      if (isViewingStream(streamName)) {
        return false;
      }
      
      _viewingStream.push(streamName);
      return true;
    }
    public function removeViewingStream(streamName:String):Boolean {
      if (!isViewingStream(streamName)) {
        return false;
      }
      
      _viewingStream = _viewingStream.filter(function(item:*, index:int, array:Array):Boolean { return item != streamName; });
      return true;
    }
    private function isViewingStream(streamName:String):Boolean {
      return _viewingStream.some(function(item:*, index:int, array:Array):Boolean { return item == streamName; });
    }
    public function isViewingAllStreams():Boolean {
      return _viewingStream.length == streamNames.length;
    }
    
    [Bindable] public var streamNames:Array = new Array();
    
    [Bindable]
    public function get streamName():String {
      var streams:String = "";
      for each(var stream:String in streamNames) {
        streams = streams + stream + "|";
      }
      //Remove last |
      streams = streams.slice(0, streams.length-1);
      return streams;
    }
    
    private function hasThisStream(streamName:String):Boolean {
      return streamNames.some(function(item:*, index:int, array:Array):Boolean { return item == streamName; });
    }
    
    public function set streamName(streamNames:String):void {
      if(streamNames) {
        var streamNamesList:Array = streamNames.split("|");
      }
    }
    
    public static function copy(source: User2x):User2x {
      var dest: User2x = new User2x();
      dest.intId = source.intId;
      dest.extId = source.extId;
      dest.name = source.name;
      dest.role = source.role;
      dest.guest = source.guest;
      dest.authed = source.authed;
      dest.waitingForAcceptance = source.waitingForAcceptance;
      dest.emoji = source.emoji;
      dest.locked = source.locked;
      dest.presenter = source.presenter;
      dest.avatar = source.avatar;
      dest.breakoutRooms = new Array();
      dest.isLeavingFlag = source.isLeavingFlag;
      
      return dest;
    }
  }
}