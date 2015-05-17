package org.bigbluebutton.core.model.users
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
    
    public function UserBuilder(id: String, name: String) {
      
    }
    
    public function withAvatar(value: String):UserBuilder {
      return this;
    }
    
    public function withExternalId(value: String):UserBuilder {
      return this;
    }
    
    public function withToken(value: String):UserBuilder {
      return this;
    }
    
    public function withLayout(value: String):UserBuilder {
      return this;
    }
    
    public function withWelcome(value: String):UserBuilder {
      return this;  
    }
    
    public function withDialNumber(value: String):UserBuilder {
      return this;  
    }
    
    public function withRole(value: String):UserBuilder {
      return this;  
    }

    public function withGuest(value: Boolean):UserBuilder {
      return this;
    }
    
    public function withCustomData(value: String):UserBuilder {
      return this;  
    }
    
    public function build():User {
      return null;
    }
    
  }
}