package org.bigbluebutton.modules.notes.views
{
  import mx.controls.List;
  
  public class AdvancedList extends List
  {
    public function AdvancedList()
    {
      super();
    }
    
    override protected function measure():void
    {
      super.measure();
      //sovled on forum by Flex HarUI
      measuredHeight = measureHeightOfItems() + viewMetrics.top + viewMetrics.bottom;
    }
  }
}