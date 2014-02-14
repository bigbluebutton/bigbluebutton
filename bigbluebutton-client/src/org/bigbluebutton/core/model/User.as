package org.bigbluebutton.core.model
{
  public class User
  {
    private var _id: String;
    private var _name: String;
    private var _externalId: String;
    private var _token: String;
    private var _me: Boolean = false;
    
    public function User(builder: UserBuilder)
    {
    }
    
    public function get id():String {
      return _id;
    }
    
    public function copy():User {
      return new UserBuilder(_id, _name)
                 .withAvatar(_avatarUrl)
                 .withExternalId(_.externId).withToken(_token)
                 .withLayout(_defaultLayout).withWelcome(_welcome)
                 .withDialNumber(_dialnumber).withRole(_role)
                 .withCustomData(_customData).build();
    }
  }
}