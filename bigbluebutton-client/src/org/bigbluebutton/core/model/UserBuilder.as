package org.bigbluebutton.core.model
{
  public class UserBuilder
  {
    internal var id : String;
    internal var name : String;
    internal var externalId : String;
    internal var token : String;
    internal var welcome : String;
    internal var avatarUrl : String;
    internal var layout : String;
    internal var logoutUrl: String;
    
    public function UserBuilder()
    {
    }
  }
}