/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.modules.layout.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.Event;
  import flash.events.EventDispatcher;
  import flash.events.TimerEvent;
  import flash.net.FileReference;
  import flash.utils.Timer;
  
  import mx.controls.Alert;
  import mx.events.ResizeEvent;
  
  import flexlib.mdi.containers.MDICanvas;
  import flexlib.mdi.containers.MDIWindow;
  import flexlib.mdi.events.MDIManagerEvent;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.CustomMdiWindow;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.SwitchedLayoutEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.model.LayoutOptions;
  import org.bigbluebutton.modules.layout.events.LayoutFromRemoteEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.modules.layout.events.LayoutLockedEvent;
  import org.bigbluebutton.modules.layout.events.LayoutsLoadedEvent;
  import org.bigbluebutton.modules.layout.events.LayoutsReadyEvent;
  import org.bigbluebutton.modules.layout.events.LockLayoutEvent;
  import org.bigbluebutton.modules.layout.events.RemoteSyncLayoutEvent;
  import org.bigbluebutton.modules.layout.events.SyncLayoutEvent;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  import org.bigbluebutton.modules.layout.model.LayoutLoader;
  import org.bigbluebutton.modules.layout.model.LayoutModel;
  import org.bigbluebutton.util.i18n.ResourceUtil;

	public class LayoutManager extends EventDispatcher {
		private static const LOGGER:ILogger = getClassLogger(LayoutManager);      
    
		private var _canvas:MDICanvas = null;
		private var _globalDispatcher:Dispatcher = new Dispatcher();
		private var _locked:Boolean = false;
		private var _currentLayout:LayoutDefinition = null;
		private var _detectContainerChange:Boolean = true;
		private var _containerDeactivated:Boolean = false;
		private var _customLayoutsCount:int = 0;
		private var _serverLayoutsLoaded:Boolean = false;
    private var _sendCurrentLayoutUpdateTimer:Timer = new Timer(500,1);
    private var _applyCurrentLayoutTimer:Timer = new Timer(150,1);
    
    private var _layoutModel:LayoutModel = LayoutModel.getInstance();
    
		private var _eventsToDelay:Array = new Array(MDIManagerEvent.WINDOW_RESTORE,
				MDIManagerEvent.WINDOW_MINIMIZE,
				MDIManagerEvent.WINDOW_MAXIMIZE);
		

    public function LayoutManager() {
      _applyCurrentLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
        //trace(LOG + " timerEvent layout [" + _currentLayout.name +  "]");
        applyLayout(_currentLayout);
        //trace(LOG + "Applied layout after user resized browser");
      });
      _sendCurrentLayoutUpdateTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
        //trace(LOG + "Applying layout due to window resize");
        updateCurrentLayout(null);
      });
    }
    
    /**
     *  There's a race condition when the layouts combo doesn't get populated 
     *  with the server's layouts definition. The problem is that sometimes 
     *  the layouts is loaded before the combo get created, and sometimes the 
     *  combo is created first. We use two booleans to sync it and only dispatch 
     *  the layouts to populate the list when both are created.
     */
		public function loadServerLayouts(layoutUrl:String):void {
			//trace(LOG + " loading server layouts from " + layoutUrl);
			var loader:LayoutLoader = new LayoutLoader();
			loader.addEventListener(LayoutsLoadedEvent.LAYOUTS_LOADED_EVENT, function(e:LayoutsLoadedEvent):void {
				if (e.success) {
					_layoutModel.addLayouts(e.layouts);

          broadcastLayouts();
					_serverLayoutsLoaded = true;

					//trace(LOG + " layouts loaded successfully");
				} else {
					LOGGER.debug("layouts not loaded ({0})", [e.error.message]);
				}
			});
			loader.loadFromUrl(layoutUrl);
		}

    private function broadcastLayouts():void {
      var layoutsReady:LayoutsReadyEvent = new LayoutsReadyEvent();
      _globalDispatcher.dispatchEvent(layoutsReady);
    }
		
		public function saveLayoutsToFile():void {
			var _fileRef:FileReference = new FileReference();
			_fileRef.addEventListener(Event.COMPLETE, function(e:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.layout.save.complete'), "", Alert.OK, _canvas);
			});
			_fileRef.save(_layoutModel.toString(), "layouts.xml");
		}
				
		public function addCurrentLayoutToList():void {
				_layoutModel.addLayout(_currentLayout);
        
				var redefineLayout:LayoutFromRemoteEvent = new LayoutFromRemoteEvent();
				redefineLayout.layout = _currentLayout;
				// this is to force LayoutCombo to update the current label
				redefineLayout.remote = true;
				_globalDispatcher.dispatchEvent(redefineLayout);
		}
		
		public function setCanvas(canvas:MDICanvas):void {
			_canvas = canvas;

			// this is to detect changes on the container
			_canvas.windowManager.container.addEventListener(ResizeEvent.RESIZE, onContainerResized);
//	        _canvas.windowManager.container.addEventListener(Event.ACTIVATE, onContainerActivated);
//	        _canvas.windowManager.container.addEventListener(Event.DEACTIVATE, onContainerDeactivated);

			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_RESIZE_END, onActionOverWindowFinished);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_DRAG_END, onActionOverWindowFinished);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_MINIMIZE, onActionOverWindowFinished);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_MAXIMIZE, onActionOverWindowFinished);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_RESTORE, onActionOverWindowFinished);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_ADD, function(e:MDIManagerEvent):void {
				checkPermissionsOverWindow(e.window);
        //trace(LOG + " setCanvas layout [" + _currentLayout.name +  "]");
				applyLayout(_currentLayout);
			});
			
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_FOCUS_START, function(e:MDIManagerEvent):void {
				OrderManager.getInstance().bringToFront(e.window);
			});
			for each (var window:MDIWindow in _canvas.windowManager.windowList.reverse()) {
				OrderManager.getInstance().bringToFront(window);
			}
		}

    public function switchToLayout(name:String):void {
      //trace(LOG + " switching to layout [" + name + "] ");
      var newLayout:LayoutDefinition = _layoutModel.getLayout(name);
      if (newLayout == null) return;

      //trace(LOG + " applying layout [" + newLayout.name + "] to windows.");
      applyLayout(newLayout);     
    }
    
		public function applyDefaultLayout():void {         
      var layoutOptions:LayoutOptions = new LayoutOptions();
      layoutOptions.parseOptions();
      var defaultLayout:LayoutDefinition = _layoutModel.getLayout(layoutOptions.defaultLayout);
           
      var sessionDefaulLayout:String = UserManager.getInstance().getConference().getDefaultLayout();
            
      if (sessionDefaulLayout != "NOLAYOUT") {
        var sesLayout:LayoutDefinition = _layoutModel.getLayout(sessionDefaulLayout);
        if (sesLayout != null) {
          defaultLayout = sesLayout;
        }
      }
      
      if (defaultLayout == null) {
        defaultLayout = _layoutModel.getDefaultLayout();
      }
      
      //trace(LOG + " Using [" + defaultLayout.name + "] as default LAYOUT.");
			applyLayout(defaultLayout);
		}
		
    private function dispatchSwitchedLayoutEvent(layoutID:String):void {
      if (_currentLayout != null && _currentLayout.name == layoutID) return;
      
      //trace(LOG + " Dispatch [" + layoutID + "] as new LAYOUT");
      var layoutEvent:SwitchedLayoutEvent = new SwitchedLayoutEvent();
      layoutEvent.layoutID = layoutID;
      _globalDispatcher.dispatchEvent(layoutEvent);      
    }
      
		public function lockLayout():void {
			_locked = true;
			//trace(LOG + " layout locked by myself");
			sendLayoutUpdate(_currentLayout);
		}
		
		public function broadcastLayout():void {
			//trace(LOG + " layout changed by me. Sync others to this new layout.");
			var e:SyncLayoutEvent = new SyncLayoutEvent(_currentLayout);
			_globalDispatcher.dispatchEvent(e);
		}
		
		private function sendLayoutUpdate(layout:LayoutDefinition):void {
			if (UsersUtil.amIModerator() || UsersUtil.amIPresenter()) {
				//trace("LayoutManager: synching layout to remote users");
				var e:SyncLayoutEvent = new SyncLayoutEvent(layout);
				_globalDispatcher.dispatchEvent(e);
			}
		}
		
		private function applyLayout(layout:LayoutDefinition):void {
			_detectContainerChange = false;
			if (layout != null) {
        layout.applyToCanvas(_canvas);
        dispatchSwitchedLayoutEvent(layout.name);
      }
      //trace(LOG + " applyLayout layout [" + layout.name +  "]");	
			updateCurrentLayout(layout);
			_detectContainerChange = true;
		}

    public function handleLockLayoutEvent(e: LockLayoutEvent):void {
      
    }
    
    
    public function handleLayoutLockedEvent(e: LayoutLockedEvent):void {
      _locked = e.locked;
      checkPermissionsOverWindow();
    }

    public function lockSettingsChanged():void {
      var myUser:BBBUser = UserManager.getInstance().getConference().getMyUser();
      _locked = myUser.lockedLayout;
      checkPermissionsOverWindow();
    }
    
		public function applyRemoteLayout(e:LayoutFromRemoteEvent):void {
			var layout:LayoutDefinition = e.layout;
      //trace(LOG + " applyRemoteLayout layout [" + layout.name +  "]");
			applyLayout(layout);
		}
		
		public function remoteLockLayout():void {
			//trace(LOG + " remote lock received");
			_locked = true;
			checkPermissionsOverWindow();
		}
		
    public function remoteSyncLayout(event:RemoteSyncLayoutEvent):void {
      //trace(LOG + " remote lock received");
      
      checkPermissionsOverWindow();
    }
    
		public function remoteUnlockLayout():void {
			//trace(LOG + " remote unlock received");
			_locked = false;
			checkPermissionsOverWindow();
		}
		
		private function checkPermissionsOverWindow(window:MDIWindow=null):void {
			if (UsersUtil.amIModerator()) return;
			if (window != null && !LayoutDefinition.ignoreWindow(window)) {
				(window as CustomMdiWindow).unlocked = !_locked;
			} else {
				for each (window in _canvas.windowManager.windowList) {
					checkPermissionsOverWindow(window);
				}
			}
		}
		
		private function onContainerResized(e:ResizeEvent):void {
      //trace(LOG + "Canvas is changing as user is resizing browser");
      /*
      *	the main canvas has been resized
      *	while the user is resizing the window, this event is dispatched 
      *	multiple times, so we use a timer to re-apply the current layout
      *	only once, when the user finished his action
      */
      _applyCurrentLayoutTimer.reset();
      _applyCurrentLayoutTimer.start();
		}
			
    private function onActionOverWindowFinished(e:MDIManagerEvent):void {
      if (LayoutDefinition.ignoreWindow(e.window))
        return;
      
      checkPermissionsOverWindow(e.window);
      //trace(LOG + "Window is being resized. Event=[" + e.type + "]");
      //updateCurrentLayout(null);
      /*
       * 	All events must be delayed because the window doesn't actually 
	   *    change size until after the animation has finished.
       */
      _sendCurrentLayoutUpdateTimer.reset();
      _sendCurrentLayoutUpdateTimer.start();
    }
		
		private function updateCurrentLayout(layout:LayoutDefinition):LayoutDefinition {
      //trace(LOG + "updateCurrentLayout");
      if (layout != null) {
        if (_currentLayout) _currentLayout.currentLayout = false;
        _currentLayout = layout;
        //trace(LOG + "updateCurrentLayout - currentLayout = [" + layout.name + "]");
        layout.currentLayout = true;
      } else {
        _currentLayout = LayoutDefinition.getLayout(_canvas, ResourceUtil.getInstance().getString('bbb.layout.combo.customName'));
        //trace(LOG + "updateCurrentLayout - layout is NULL! Setting currentLayout = [" + _currentLayout.name + "]");
      }

			return _currentLayout;
		}
	}
}