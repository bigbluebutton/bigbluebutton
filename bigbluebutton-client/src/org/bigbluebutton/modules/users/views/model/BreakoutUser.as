package org.bigbluebutton.modules.users.views.model
{
  
  public class BreakoutUser
  {
    
    [Bindable] public var id: String;
    [Bindable] public var name: String;
    
    public function BreakoutUser(id: String, name: String)
    {
        this.id = id;
        this.name = name;
    }
  }
}