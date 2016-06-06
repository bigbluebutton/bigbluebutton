package org.bigbluebutton.core.model
{
  import org.bigbluebutton.core.BBB;
  
  public class StunOption
  {
    public var stuns: String = "";
    
    public function parseOptions():void {
      stuns =  BBB.getConfigManager().config.application.stuns;
    }
  }
}