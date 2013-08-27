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
  import flash.net.URLLoader;
  import flash.net.URLRequest;
  import flash.utils.Dictionary;
  import flash.utils.Timer;
  
  import flexlib.mdi.containers.MDICanvas;
  import flexlib.mdi.containers.MDIWindow;
  import flexlib.mdi.events.MDIManagerEvent;
  
  import mx.controls.Alert;
  import mx.events.ResizeEvent;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.EventBroadcaster;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.SwitchedLayoutEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.model.Config;
  import org.bigbluebutton.main.events.ModuleLoadEvent;
  import org.bigbluebutton.main.model.LayoutOptions;
  import org.bigbluebutton.modules.layout.events.LayoutEvent;
  import org.bigbluebutton.modules.layout.events.LayoutsLoadedEvent;
  import org.bigbluebutton.modules.layout.events.RedefineLayoutEvent;
  import org.bigbluebutton.modules.layout.events.UpdateLayoutEvent;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  import org.bigbluebutton.modules.layout.model.LayoutDefinitionFile;
  import org.bigbluebutton.modules.layout.model.LayoutLoader;
  import org.bigbluebutton.modules.layout.model.WindowLayout;
  import org.bigbluebutton.util.i18n.ResourceUtil;

	public class LayoutManager extends EventDispatcher {
		private var _layouts:LayoutDefinitionFile = null;
		private var _canvas:MDICanvas = null;
		private var _globalDispatcher:Dispatcher = new Dispatcher();
		private var _locked:Boolean = false;
		private var _currentLayout:LayoutDefinition = null;
		private var _detectContainerChange:Boolean = true;
		private var _containerDeactivated:Boolean = false;
		private var _sendCurrentLayoutUpdateTimer:Timer = new Timer(500,1);
		private var _applyCurrentLayoutTimer:Timer = new Timer(150,1);
		private var _customLayoutsCount:int = 0;
		private var _serverLayoutsLoaded:Boolean = false;
        private var _comboLayoutCreated:Boolean = false;
		private var _eventsToDelay:Array = new Array(MDIManagerEvent.WINDOW_RESTORE,
				MDIManagerEvent.WINDOW_MINIMIZE,
				MDIManagerEvent.WINDOW_MAXIMIZE);
		
		
		public function LayoutManager() {
			_applyCurrentLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
				applyLayout(_currentLayout);
			});
			_sendCurrentLayoutUpdateTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
				sendLayoutUpdate(updateCurrentLayout());
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
			LogUtil.debug("LayoutManager: loading server layouts from " + layoutUrl);
			var loader:LayoutLoader = new LayoutLoader();
			loader.addEventListener(LayoutsLoadedEvent.LAYOUTS_LOADED_EVENT, function(e:LayoutsLoadedEvent):void {
				if (e.success) {
					_layouts = e.layouts;

                    if (_comboLayoutCreated) {
                        broadcastLayouts();
                    }
					_serverLayoutsLoaded = true;

					LogUtil.debug("LayoutManager: layouts loaded successfully");
				} else {
					LogUtil.error("LayoutManager: layouts not loaded (" + e.error.message + ")");
				}
			});
			loader.loadFromUrl(layoutUrl);
		}

		public function onComboLayoutCreated():void {
			if (_serverLayoutsLoaded) {
                broadcastLayouts();
			}
            _comboLayoutCreated = true;
		}

        private function broadcastLayouts():void {
            var layoutsLoaded:LayoutsLoadedEvent = new LayoutsLoadedEvent();
            layoutsLoaded.layouts = _layouts;
            _globalDispatcher.dispatchEvent(layoutsLoaded);
        }
		
		public function saveLayoutsToFile():void {
			var _fileRef:FileReference = new FileReference();
			_fileRef.addEventListener(Event.COMPLETE, function(e:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.layout.save.complete'), "", Alert.OK, _canvas);
			});
			_fileRef.save(_layouts.toXml().toXMLString(), "layouts.xml");
		}
		
		public function loadLayoutsFromFile():void {
			var loader:LayoutLoader = new LayoutLoader();
			loader.addEventListener(LayoutsLoadedEvent.LAYOUTS_LOADED_EVENT, function(e:LayoutsLoadedEvent):void {
				if (e.success) {
					_layouts = e.layouts;

                    broadcastLayouts();
					
					/*
					 *	it will update the ComboBox label, and will go back to this class
					 * 	to apply the default layout
					 */
					_globalDispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.APPLY_DEFAULT_LAYOUT_EVENT));
					
					Alert.show(ResourceUtil.getInstance().getString('bbb.layout.load.complete'), "", Alert.OK, _canvas);
				} else
					Alert.show(ResourceUtil.getInstance().getString('bbb.layout.load.failed'), "", Alert.OK, _canvas);
			});
			loader.loadFromLocalFile();
		}
		
		public function addCurrentLayoutToList():void {
			var remotePrefix:String = "[" + ResourceUtil.getInstance().getString('bbb.layout.combo.remote') + "] ";
			// starts with
			var isRemoteLayout:Boolean = (_currentLayout.name.indexOf(remotePrefix) == 0);
			if (isRemoteLayout) {
				// remove the remote prefix
				_currentLayout.name = _currentLayout.name.substring(remotePrefix.length);
				// if it's a remote custom layout, just remove the counter
				if (_currentLayout.name.indexOf(ResourceUtil.getInstance().getString('bbb.layout.combo.customName')) == 0)
					_currentLayout.name = ResourceUtil.getInstance().getString('bbb.layout.combo.customName');
			}
			
			// only add a layout to the list if it's a custom layout
			if (_currentLayout.name == ResourceUtil.getInstance().getString('bbb.layout.combo.customName')) {
				_currentLayout.name += " " + (++_customLayoutsCount); 
				_layouts.push(_currentLayout);
				var layoutsLoaded:LayoutsLoadedEvent = new LayoutsLoadedEvent();
				layoutsLoaded.layouts = _layouts;
				_globalDispatcher.dispatchEvent(layoutsLoaded);
				
				var redefineLayout:RedefineLayoutEvent = new RedefineLayoutEvent();
				redefineLayout.layout = _currentLayout;
				// this is to force LayoutCombo to update the current label
				redefineLayout.remote = true;
				_globalDispatcher.dispatchEvent(redefineLayout);
			}
		}
		
		public function setCanvas(canvas:MDICanvas):void {
			_canvas = canvas;
			/*
			 * it should be dispatched when the layouts get loaded, but
			 * the view is not ready at that point to receive the layouts
			 * and populate the ComboBox
			 */
			if (_layouts != null) {
				var e:LayoutsLoadedEvent = new LayoutsLoadedEvent();
				e.layouts = _layouts;
				_globalDispatcher.dispatchEvent(e);
			}

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
      var newLayout:LayoutDefinition = _layouts.getLayout(name);
      if (newLayout == null) return;

      trace("************** USING [" + newLayout.name + "] as new LAYOUT ***************************");
      applyLayout(newLayout);
      sendLayoutUpdate(_currentLayout);     
      
    }
    
		public function applyDefaultLayout():void {   
      
      var layoutOptions:LayoutOptions = new LayoutOptions();
      layoutOptions.parseOptions();
      var defaultLayout:LayoutDefinition = _layouts.getLayout(layoutOptions.defaultLayout);
           
      var sessionDefaulLayout:String = UserManager.getInstance().getConference().getDefaultLayout();
            
      if (sessionDefaulLayout != "NOLAYOUT") {
        var sesLayout:LayoutDefinition = _layouts.getLayout(sessionDefaulLayout);
        if (sesLayout != null) {
          defaultLayout = sesLayout;
        }
      }
      
      if (defaultLayout == null) {
        defaultLayout = _layouts.getDefault();
      }
      
      trace("************** USING [" + defaultLayout.name + "] as default LAYOUT ***************************");
			applyLayout(defaultLayout);
			sendLayoutUpdate(_currentLayout);

		}
		
    private function dispatchSwitchedLayoutEvent(layoutID:String):void {
      if (_currentLayout != null && _currentLayout.name == layoutID) return;
      
      trace("************** DISPATCHING [" + layoutID + "] as new LAYOUT ***************************");
      var layoutEvent:SwitchedLayoutEvent = new SwitchedLayoutEvent();
      layoutEvent.layoutID = layoutID;
      _globalDispatcher.dispatchEvent(layoutEvent);      
    }
    
		public function lockLayout():void {
			_locked = true;
			LogUtil.debug("LayoutManager: layout locked by myself");
			sendLayoutUpdate(_currentLayout);
		}
		
		private function sendLayoutUpdate(layout:LayoutDefinition):void {
			if (_locked && (UsersUtil.amIModerator() || UsersUtil.amIPresenter())) {
				LogUtil.debug("LayoutManager: sending layout to remotes");
				var e:UpdateLayoutEvent = new UpdateLayoutEvent();
				e.layout = layout;
				_globalDispatcher.dispatchEvent(e);
			}
		}
		
		private function applyLayout(layout:LayoutDefinition):void {
			_detectContainerChange = false;
			if (layout != null) {
        layout.applyToCanvas(_canvas);
        dispatchSwitchedLayoutEvent(layout.name);
      }
				
			updateCurrentLayout(layout);
			_detectContainerChange = true;
		}

		public function redefineLayout(e:RedefineLayoutEvent):void {
			var layout:LayoutDefinition = e.layout;
			applyLayout(layout);
			if (!e.remote) {
        sendLayoutUpdate(layout);        
      }
		}
		
		public function remoteLockLayout():void {
			LogUtil.debug("LayoutManager: remote lock received");
			_locked = true;
			checkPermissionsOverWindow();
		}
		
		public function remoteUnlockLayout():void {
			LogUtil.debug("LayoutManager: remote unlock received");
			_locked = false;
			checkPermissionsOverWindow();
		}
		
		private function checkPermissionsOverWindow(window:MDIWindow=null):void {
			if (window != null) {
				if (!UserManager.getInstance().getConference().amIModerator()
						&& !LayoutDefinition.ignoreWindow(window)) {
					window.draggable 
							= window.resizable
							= window.showControls
							= !_locked;
				}
			} else {
				for each (window in _canvas.windowManager.windowList) {
					checkPermissionsOverWindow(window);
				}
			}
		}
		
		private function onContainerResized(e:ResizeEvent):void {
			/*
			 *	the main canvas has been resized
			 *	while the user is resizing the window, this event is dispatched 
			 *	multiple times, so we use a timer to re-apply the current layout
			 *	only once, when the user finished his action
			 */
			_applyCurrentLayoutTimer.reset();
			_applyCurrentLayoutTimer.start();
		}
		
//		private function onContainerActivated(e:Event):void {
//			printSomething("onContainerActivated");
//		}
//
//		private function onContainerDeactivated(e:Event = null):void {
//			printSomething("onContainerDeactivated");
//		}
		
		private function onActionOverWindowFinished(e:MDIManagerEvent):void {
			if (LayoutDefinition.ignoreWindow(e.window))
				return;
				
			checkPermissionsOverWindow(e.window);
			if (_detectContainerChange) {
				_globalDispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.INVALIDATE_LAYOUT_EVENT));
				/*
				 * 	some events related to animated actions must be delayed because if it's not the 
				 * 	current layout doesn't get properly updated
				 */
				if (_eventsToDelay.indexOf(e.type) != -1) {
					LogUtil.debug("LayoutManager: waiting the end of the animation to update the current layout");
					_sendCurrentLayoutUpdateTimer.reset();
					_sendCurrentLayoutUpdateTimer.start();
				} else {
					sendLayoutUpdate(updateCurrentLayout());
				}
			}
		}
		
		private function updateCurrentLayout(layout:LayoutDefinition=null):LayoutDefinition {
			_currentLayout = (layout != null? layout: LayoutDefinition.getLayout(_canvas, ResourceUtil.getInstance().getString('bbb.layout.combo.customName')));
			return _currentLayout;
		}
		
		/*
		 * this is because a unique layout may have multiple definitions depending
		 * on the role of the participant
		 */ 
		public function presenterChanged():void {
			if (_canvas != null)
				applyLayout(_currentLayout);
		}
	}
}