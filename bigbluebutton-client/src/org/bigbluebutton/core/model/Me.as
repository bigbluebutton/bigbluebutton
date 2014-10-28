package org.bigbluebutton.core.model
{
  public class Me
  {
    private var _id: String;
    private var _name: String;
    private var _externalId: String;
    private var _token: String;
    private var _layout: String;
    private var _avatarURL: String;
    private var _logoutURL: String;
    
    public function Me(builder: MeBuilder) {
      _id = builder.id;
      _name = builder.name;
      _externalId = builder.externalId;
      _token = builder.token;
      _layout = builder.layout;
      _logoutURL = builder.logoutURL;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get name():String {
      return _name;
    }
    
    public function get externalId():String {
      return _externalId;
    }
    
    public function get layout():String {
      return _layout;
    }
    
    public function get avatarURL():String {
      return _avatarURL;
    }
    
    public function get logoutURL():String {
      return _logoutURL;
    }
  }
}