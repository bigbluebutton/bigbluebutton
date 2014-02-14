package org.bigbluebutton.core.model
{
  public class Me
  {
    private var _id: String;
    private var _name: String;
    private var _externalId: String;
    private var _token: String;
    private var _layout: String;
    private var _avatarUrl: String;
    private var _logoutUrl: String;
    
    public function Me(builder: MeBuilder) {
      _id = builder.id;
      _name = builder.name;
      _externalId = builder.externalId;
      
    }
  }
}