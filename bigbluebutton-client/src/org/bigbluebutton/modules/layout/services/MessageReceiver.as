package org.bigbluebutton.modules.layout.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.TimerEvent;
  import flash.utils.Timer;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.ModuleLoadEvent;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.layout.events.LayoutEvent;
  import org.bigbluebutton.modules.layout.events.RedefineLayoutEvent;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class MessageReceiver implements IMessageListener
  {
    private var _dispatcher:Dispatcher;
    private var _locked:Boolean = false;
    
    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
      _dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
      trace("LAYOUT: received message " + messageName);
      
      switch (messageName) {
        case "getCurrentLayoutResponse":
          handleGetCurrentLayoutResponse(message);
          break;
        case "remoteUpdateLayout":
          handleRemoteUpdateLayout(message);
          break;
      }
    }
    
    /*
    * the application of the first layout should be delayed to avoid
    * strange movements of the windows before set the correct position
    */
    private var _applyFirstLayoutTimer:Timer = new Timer(750,1);
    
    private function handleGetCurrentLayoutResponse(message:Object):void {
      _applyFirstLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
        onReceivedFirstLayout(message);
      });
      _applyFirstLayoutTimer.start();
    }
    
    private function onReceivedFirstLayout(message:Object):void {
      trace("LayoutService: handling the first layout"); 
      if (message.locked)
        remoteUpdateLayout(message.locked, message.setByUserID, message.layout);
      else
        _dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.APPLY_DEFAULT_LAYOUT_EVENT));
      
      _dispatcher.dispatchEvent(new ModuleLoadEvent(ModuleLoadEvent.LAYOUT_MODULE_STARTED));
    }
    
    private function handleRemoteUpdateLayout(message:Object):void {
      remoteUpdateLayout(message.locked, message.setByUserID, message.layout);
    }
    
    public function remoteUpdateLayout(locked:Boolean, userID:String, layout:String):void {
      var dispatchedByMe:Boolean = UserManager.getInstance().getConference().amIThisUser(userID);
      
      LogUtil.debug("LayoutService: received a remote update" + (locked? " from " + (dispatchedByMe? "myself": "a remote user"): ""));
      LogUtil.debug("Locked? " + (locked? "yes": "no"));
      
      if (!_locked && locked) {
        _dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.REMOTE_LOCK_LAYOUT_EVENT));
        _dispatcher.dispatchEvent(new CoreEvent(EventConstants.REMOTE_LOCKED_LAYOUT));
      } else if (_locked && !locked) {
        _dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.REMOTE_UNLOCK_LAYOUT_EVENT));
        _dispatcher.dispatchEvent(new CoreEvent(EventConstants.REMOTE_UNLOCKED_LAYOUT));
      }
      
      if (locked && !dispatchedByMe) {
        LogUtil.debug("LayoutService: handling remote layout");
        LogUtil.debug(layout);
        var layoutDefinition:LayoutDefinition = new LayoutDefinition();
        layoutDefinition.load(new XML(layout));
        layoutDefinition.name = "[" + ResourceUtil.getInstance().getString('bbb.layout.combo.remote') + "] " + layoutDefinition.name;  
        var redefineLayout:RedefineLayoutEvent = new RedefineLayoutEvent();
        redefineLayout.layout = layoutDefinition;
        redefineLayout.remote = true;
        _dispatcher.dispatchEvent(redefineLayout);
      }
      _locked = locked;
    }
  }
}