package org.bigbluebutton.modules.layout.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.TimerEvent;
  import flash.utils.Timer;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.ModuleLoadEvent;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.layout.events.LayoutEvent;
  import org.bigbluebutton.modules.layout.events.LayoutLockedEvent;
  import org.bigbluebutton.modules.layout.events.LayoutFromRemoteEvent;
  import org.bigbluebutton.modules.layout.events.RemoteSyncLayoutEvent;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class MessageReceiver implements IMessageListener
  {
    private var _dispatcher:Dispatcher;
    
    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
      _dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
//      trace("LAYOUT: received message " + messageName);
      
      switch (messageName) {
        case "getCurrentLayoutResponse":
          handleGetCurrentLayoutResponse(message);
          break;
        case "layoutLocked":
          handleLayoutLocked(message);
          break;
        case "syncLayout":
          handleSyncLayout(message);
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
      trace("LayoutService: handling the first layout. locked = [" + message.locked + "] layout = [" + message.layout + "]"); 

      lockLayout(message.locked, message.setById);
      
      _dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.APPLY_DEFAULT_LAYOUT_EVENT));
      
      _dispatcher.dispatchEvent(new ModuleLoadEvent(ModuleLoadEvent.LAYOUT_MODULE_STARTED));
    }
 
    private function handleSyncLayout(message:Object):void {
      _dispatcher.dispatchEvent(new RemoteSyncLayoutEvent(message.layout));
      if (message.layout == "") return;
      
      var layoutDefinition:LayoutDefinition = new LayoutDefinition();
      layoutDefinition.load(new XML(message.layout));
      layoutDefinition.name = "[" + ResourceUtil.getInstance().getString('bbb.layout.combo.remote') + "] " + layoutDefinition.name;  
      var redefineLayout:LayoutFromRemoteEvent = new LayoutFromRemoteEvent();
      redefineLayout.layout = layoutDefinition;
      redefineLayout.remote = true;
      
      _dispatcher.dispatchEvent(redefineLayout);      
    }
    
    private function handleLayoutLocked(message:Object):void {
      if (message.hasOwnProperty("locked") && message.hasOwnProperty("setById"))
        lockLayout(message.locked, message.setById);
    }
    
    private function lockLayout(locked:Boolean, setById:String):void {
      trace("LayoutService: received locked layout message. locked=[" + locked + "] by=[" + setById + "]");
      _dispatcher.dispatchEvent(new LayoutLockedEvent(locked, setById));
    }
  }
}
