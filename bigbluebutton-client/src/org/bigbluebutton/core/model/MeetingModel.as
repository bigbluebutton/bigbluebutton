package org.bigbluebutton.core.model
{
  public class MeetingModel
  {
    private static var instance:MeetingModel = null;
    
    private var _meeting: Meeting;
    
    private var _meetingMuted:Boolean = false;
    private var _meetingMutedExceptPresenter:Boolean = false;
    
    public function MeetingModel(enforcer: MeetingModelSingletonEnforcer)
    {
      if (enforcer == null){
        throw new Error("There can only be 1 MeetingModel instance");
      }
    }
    
    public static function getInstance():MeetingModel{
      if (instance == null){
        instance = new MeetingModel(new MeetingModelSingletonEnforcer());
      }
      return instance;
    }  
    
    public function set meeting(value: Meeting):void {
      _meeting = value;
    }
    
    public function get meeting():Meeting {
      return _meeting;
    }
    
    public function set recording(record: Boolean):void {
      _meeting.isRecording = record;
    }
    
    public function set meetingMuted(muted:Boolean):void {
      _meetingMuted = muted;
    }
    
    public function get meetingMuted():Boolean {
      return _meetingMuted;
    }
    
    public function set meetingMutedExceptPresenter(muted:Boolean):void {
      _meetingMutedExceptPresenter = muted;
    }
    
    public function get meetingMutedExceptPresenter():Boolean {
      return _meetingMutedExceptPresenter;
    }
    
    
  }
}

class MeetingModelSingletonEnforcer{}