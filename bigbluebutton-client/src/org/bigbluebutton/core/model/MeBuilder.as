package org.bigbluebutton.core.model
{
  public class MeBuilder
  {
    internal var id: String;
    internal var name: String;
    internal var externalId: String;
    internal var token: String;
    internal var welcome: String;
    internal var avatarUrl: String;
    internal var layout: String;
    internal var logoutUrl: String;
    internal var dialNumber: String;
    internal var role: String;
    internal var customData:Object;
    
    public function MeBuilder(id: String, name: String) {
      this.id = id;
      this.name = name;
    }
    
    public function withExternalId(value: String):MeBuilder {
      externalId = value;
      return this;
    }
    
    public function withToken(value: String):MeBuilder {
      token = value;
      return this;
    }
    
    public function withWelcome(value: String):MeBuilder {
      welcome = value;
      return this;
    }
    
    public function withAvatar(value: String):MeBuilder {
      avatarUrl = value;
      return this;
    }
    
    public function withLayout(value: String):MeBuilder {
      layout = value;
      return this;
    }
    
    public function withLogoutUrl(value: String):MeBuilder {
      logoutUrl = value;
      return this;
    }
    
    public function withDialNumber(value: String):MeBuilder {
      dialNumber = value;
      return this;
    }
    
    public function withRole(value: String):MeBuilder {
      role = value;
      return this;
    }
    
    public function withCustomData(value: Object):MeBuilder {
      customData = value;
      return this;
    }
    
    public function build():Me {
      return new Me(this);
    }
  }
}