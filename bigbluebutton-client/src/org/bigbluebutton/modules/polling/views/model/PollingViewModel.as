package org.bigbluebutton.modules.polling.views.model
{
  import org.bigbluebutton.modules.polling.model.PollingModel;

  public class PollingViewModel
  {
    private var _model:PollingModel;
    
    public function PollingViewModel(model: PollingModel)
    {
      this._model = model;
    }
  }
}