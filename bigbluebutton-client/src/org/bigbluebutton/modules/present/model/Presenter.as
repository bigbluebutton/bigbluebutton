package org.bigbluebutton.modules.present.model
{
  public class Presenter
  {
    public var userId: String;
    public var name: String;
    public var assignedBy: String;
    
    public function Presenter(userId: String, name: String, assignedBy: String)
    {
      this.userId = userId;
      this.name = name;
      this.assignedBy = assignedBy;
    }
  }
}