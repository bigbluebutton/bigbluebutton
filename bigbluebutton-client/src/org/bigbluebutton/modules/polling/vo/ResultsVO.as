package org.bigbluebutton.modules.polling.vo
{
  import mx.collections.ArrayCollection;

  public class ResultsVO
  {
    private var _results:Array = new Array();
    
    public function addResult(result:ResultVO):void
    {
      _results.push(result);
    }
    
    public function get results():Array {
      return _results;
    }
  }
}