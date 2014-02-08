package org.bigbluebutton.modules.present.model
{
  import mx.collections.ArrayCollection;

  public class PresentationModel
  {
    private static var instance:PresentationModel = null;
    
    private var _presentations:ArrayCollection = new ArrayCollection();
    
    private var _presenter: Presenter;
    
    /**
     * This class is a singleton. Please initialize it using the getInstance() method.
     * 
     */		
    public function PresentationModel(enforcer:SingletonEnforcer) {
      if (enforcer == null){
        throw new Error("There can only be 1 PresentationModel instance");
      }
      initialize();
    }
    
    private function initialize():void {
      
    }
    
    /**
     * Return the single instance of the PresentationModel class
     */
    public static function getInstance():PresentationModel{
      if (instance == null){
        instance = new PresentationModel(new SingletonEnforcer());
      }
      return instance;
    }
    
    public function setPresenter(p: Presenter):void {
      _presenter = p;
    }
    
    public function getPresenter():Presenter {
      return _presenter;
    }
    
    public function addPresentation(p: Presentation):void {
      
    }
  }
}

class SingletonEnforcer{}