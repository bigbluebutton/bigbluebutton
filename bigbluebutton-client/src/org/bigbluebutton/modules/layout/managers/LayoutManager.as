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
  
  import flash.display.DisplayObject;
  import flash.events.Event;
  import flash.events.EventDispatcher;
  import flash.events.IOErrorEvent;
  import flash.events.TimerEvent;
  import flash.net.FileReference;
  import flash.utils.Timer;
  
  import mx.controls.Alert;
  import mx.core.FlexGlobals;
  import mx.events.CloseEvent;
  import mx.events.EffectEvent;
  import mx.events.ResizeEvent;
  
  import flexlib.mdi.containers.MDICanvas;
  import flexlib.mdi.containers.MDIWindow;
  import flexlib.mdi.events.MDIManagerEvent;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.CustomMdiWindow;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.PopUpUtil;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.SwitchedLayoutEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.main.model.options.LayoutOptions;
  import org.bigbluebutton.modules.layout.events.LayoutEvent;
  import org.bigbluebutton.modules.layout.events.LayoutFromRemoteEvent;
  import org.bigbluebutton.modules.layout.events.LayoutNameInUseEvent;
  import org.bigbluebutton.modules.layout.events.LayoutsLoadedEvent;
  import org.bigbluebutton.modules.layout.events.LayoutsReadyEvent;
  import org.bigbluebutton.modules.layout.events.RemoteSyncLayoutEvent;
  import org.bigbluebutton.modules.layout.events.SyncLayoutEvent;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
  import org.bigbluebutton.modules.layout.model.LayoutLoader;
  import org.bigbluebutton.modules.layout.model.LayoutModel;
  import org.bigbluebutton.modules.layout.views.CustomLayoutNameWindow;
  import org.bigbluebutton.util.i18n.ResourceUtil;

	public class LayoutManager extends EventDispatcher {
		private static const LOGGER:ILogger = getClassLogger(LayoutManager);      
    
		private var _canvas:MDICanvas = null;
		private var _globalDispatcher:Dispatcher = new Dispatcher();
		private var _locked:Boolean = false;
		private var _currentLayout:LayoutDefinition = null;
		private var _customLayoutsCount:int = 0;
		private var _serverLayoutsLoaded:Boolean = false;
		private var _applyCurrentLayoutTimer:Timer = new Timer(150,1);
		private var _applyingLayoutCounter:int = 0;
		private var _temporaryLayoutName:String = "";
    
    private var _layoutModel:LayoutModel = LayoutModel.getInstance();
    
    /**
    * If we sync automatically with other users while the action (move, resize) is done on the
    * window.
    */
    private var _autoSync:Boolean = false;

    public function LayoutManager() {
      _applyCurrentLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
        applyLayout(currentLayout);
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
			if (!_currentLayout.currentLayout) {
				var alertSaveCurrentLayToFile:Alert = Alert.show(ResourceUtil.getInstance().getString('bbb.layout.addCurrentToFileWindow.text'),
					ResourceUtil.getInstance().getString('bbb.layout.addCurrentToFileWindow.title'),
					Alert.YES | Alert.NO, _canvas, alertSaveCurrentLayoutFile, null, Alert.YES);
			} else {
				saveLayoutsWindow();
			}
		}

		public function alertSaveCurrentLayoutFile(e:CloseEvent):void {
				// Check to see if the YES button was pressed.
				if (e.detail==Alert.YES) {
					var layoutNameWindow:CustomLayoutNameWindow = PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, CustomLayoutNameWindow, true) as CustomLayoutNameWindow;
					layoutNameWindow.savingForFileDownload = true;
				} else if (e.detail==Alert.NO){
					saveLayoutsWindow();
				}
			}

		public function saveLayoutsWindow():void{
			var _fileRef:FileReference = new FileReference();
			_fileRef.addEventListener(Event.COMPLETE, function(e:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.layout.save.complete'), "", Alert.OK, _canvas);
			});
			_fileRef.addEventListener(IOErrorEvent.IO_ERROR, function(e:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.layout.save.ioerror'), "", Alert.OK, _canvas);
			});
			_fileRef.save(_layoutModel.toString(), "layouts.xml");
		}

		public function loadLayoutsFromFile():void {
			var loader:LayoutLoader = new LayoutLoader();
			loader.addEventListener(LayoutsLoadedEvent.LAYOUTS_LOADED_EVENT, function(e:LayoutsLoadedEvent):void {
				if (e.success) {
					_layoutModel.addLayouts(e.layouts);
					applyLayout(_layoutModel.getDefaultLayout());
					broadcastLayouts();
					Alert.show(ResourceUtil.getInstance().getString('bbb.layout.load.complete'), "", Alert.OK, _canvas);
				} else
					Alert.show(ResourceUtil.getInstance().getString('bbb.layout.load.failed'), "", Alert.OK, _canvas);
			});
			loader.loadFromLocalFile();
		}

		public function alertOverwriteLayoutName(event:CloseEvent):void {
				// Check to see if the YES button was pressed.
				if (event.detail==Alert.YES) {
					var e:LayoutEvent = new LayoutEvent(LayoutEvent.ADD_CURRENT_LAYOUT_EVENT);
					e.overwrite = true;
					e.layoutName = _temporaryLayoutName;
					addCurrentLayoutToList(e);
				} else if (event.detail==Alert.NO){
					return;
				}
			}

		public function addCurrentLayoutToList(e:LayoutEvent):void {
				// Layout Name Window Popup calls this function
				var newLayout:LayoutDefinition;
				var layoutName:LayoutNameInUseEvent = new LayoutNameInUseEvent();
				_temporaryLayoutName = e.layoutName;
				if (e.layoutName != "") {
					newLayout = LayoutDefinition.getLayout(_canvas, e.layoutName);
					// This is true when the name given is already in use
					if (_layoutModel.hasLayout(e.layoutName)) {

						if (!e.overwrite) {
							layoutName.inUse = true;
							_globalDispatcher.dispatchEvent(layoutName);

							var alertOverwriteLayName:Alert = Alert.show(ResourceUtil.getInstance().getString('bbb.layout.overwriteLayoutName.text'),
							ResourceUtil.getInstance().getString('bbb.layout.overwriteLayoutName.title'),
							Alert.YES | Alert.NO, _canvas, alertOverwriteLayoutName, null, Alert.NO);

							return; //to stop the creation of a new layout with the same name
						} else {
							_layoutModel.removeLayout(newLayout);
						}
					}
				} else {
					// if the user does not change the "Custom Layout" name that is default when the windows is shown
					// the name will be "Custom Layout #", incrementing number # to avoid overwrite
					newLayout = LayoutDefinition.getLayout(_canvas, ResourceUtil.getInstance().getString('bbb.layout.combo.customName'));
					newLayout.name += " " + (++_customLayoutsCount);
				}

				_layoutModel.addLayout(newLayout);
				updateCurrentLayout(newLayout);
				broadcastLayouts();

				var redefineLayout:LayoutFromRemoteEvent = new LayoutFromRemoteEvent();
				redefineLayout.layout = newLayout;
				// this is to force LayoutCombo to update the current label
				redefineLayout.remote = true;
				_globalDispatcher.dispatchEvent(redefineLayout);

				layoutName.inUse = false;
				_temporaryLayoutName = "";

				_globalDispatcher.dispatchEvent(layoutName);
		}
		
		public function setCanvas(canvas:MDICanvas):void {
			_canvas = canvas;

			// this is to detect changes on the container
			_canvas.windowManager.container.addEventListener(ResizeEvent.RESIZE, onContainerResized);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_RESIZE_END, onMDIManagerEvent);
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_DRAG_END, onMDIManagerEvent);
			_canvas.windowManager.addEventListener(EffectEvent.EFFECT_END, function(e:EffectEvent):void {
				var obj:Object = (e as Object);
				if (obj.mdiEventType == "windowAdd") {
					//LOGGER.debug("Ignoring windowAdd");
					return;
				}
				var windows:Array = obj.windows;
				if (windows != null) {
					for each (var window:MDIWindow in windows) {
						//LOGGER.debug(e.type + "/" + obj.mdiEventType + " on window " + WindowLayout.getType(window));
						onActionOverWindowFinished(window);
					}
				} else {
					//LOGGER.debug(e.type + "/" + obj.mdiEventType + " with no window associated");
				}
			});
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_ADD, function(e:MDIManagerEvent):void {
				checkSingleWindowPermissions(e.window);
				//LOGGER.debug("applying layout to just created window " + WindowLayout.getType(e.window));
				applyLayout(_currentLayout);
			});
			
			_canvas.windowManager.addEventListener(MDIManagerEvent.WINDOW_FOCUS_START, function(e:MDIManagerEvent):void {
				OrderManager.getInstance().bringToFront(e.window);
			});
		}

    public function switchToLayout(name:String):void {
      //trace(LOG + " switching to layout [" + name + "] ");
      var newLayout:LayoutDefinition = _layoutModel.getLayout(name);
      if (newLayout == null) return;

      var logData:Object = UsersUtil.initLogData();
      logData.reason = "Layout changed.";
      logData.tags = ["layout"];
      logData.message = "The layout was changed.";
      logData.oldLayout = _currentLayout.name;
      logData.newLayout = newLayout.name;
      LOGGER.info(JSON.stringify(logData));

      //trace(LOG + " applying layout [" + newLayout.name + "] to windows.");
      applyLayout(newLayout);     
    }
    
		public function applyDefaultLayout():void {         
      var layoutOptions:LayoutOptions = Options.getOptions(LayoutOptions) as LayoutOptions;
      var defaultLayout:LayoutDefinition = _layoutModel.getLayout(layoutOptions.defaultLayout);
           
      var sessionDefaulLayout:String = UsersUtil.getDefaultLayout();
            
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

    public function syncLayout():void {
      if (UsersUtil.amIModerator() || UsersUtil.amIPresenter()) {
        _globalDispatcher.dispatchEvent(new SyncLayoutEvent(_currentLayout));
      }
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

			Alert.show(ResourceUtil.getInstance().getString('bbb.layout.sync'), "", Alert.OK, _canvas);
		}
		
		private function sendLayoutUpdate(layout:LayoutDefinition):void {
			if (UsersUtil.amIModerator() || UsersUtil.amIPresenter()) {
				//trace("LayoutManager: synching layout to remote users");
				var e:SyncLayoutEvent = new SyncLayoutEvent(layout);
				_globalDispatcher.dispatchEvent(e);
			}
		}
		
		private function applyLayout(layout:LayoutDefinition):void {
			//LOGGER.debug("applyLayout");
			detectContainerChange = false;

			if (layout != null) {
				layout.applyToCanvas(_canvas, function():void {
					//LOGGER.debug("layout applied successfully, resetting detectContainerChange");
					detectContainerChange = true;
				});
				dispatchSwitchedLayoutEvent(layout.name);
				LiveMeeting.inst().sharedNotes.numAdditionalSharedNotes = layout.numAdditionalSharedNotes;
			} else {
				detectContainerChange = true;
			}
			updateCurrentLayout(layout);
		}

    private function set detectContainerChange(detect:Boolean):void {
      //LOGGER.debug("setting detectContainerChange to " + detect);
      if (detect) {
        _applyingLayoutCounter--;
      } else {
        _applyingLayoutCounter++;
      }
      //LOGGER.debug("current value of detectContainerChange: " + detectContainerChange);
    }

    private function get detectContainerChange():Boolean {
      return _applyingLayoutCounter == 0;
    }

    public function lockSettingsChanged():void {
      _locked = LiveMeeting.inst().me.lockedLayout;
      checkPermissionsOverAllWindows();
    }
    
		public function applyRemoteLayout(e:LayoutFromRemoteEvent):void {
			var layout:LayoutDefinition = e.layout;
      //trace(LOG + " applyRemoteLayout layout [" + layout.name +  "]");
			applyLayout(layout);
		}
		
		public function remoteLockLayout():void {
			//trace(LOG + " remote lock received");
			_locked = true;
			checkPermissionsOverAllWindows();
		}
		
    public function remoteSyncLayout(event:RemoteSyncLayoutEvent):void {
      //trace(LOG + " remote lock received");
      
      checkPermissionsOverAllWindows();
    }
    
		public function remoteUnlockLayout():void {
			//trace(LOG + " remote unlock received");
			_locked = false;
			checkPermissionsOverAllWindows();
		}
		
		private function checkPermissionsOverWindow(window:MDIWindow):void {
			if (UsersUtil.amIModerator()) return;
			if (window != null && !LayoutDefinition.ignoreWindow(window)) {
				(window as CustomMdiWindow).unlocked = !_locked;
			}
		}

		private function checkPermissionsOverAllWindows():void {
			if (UsersUtil.amIModerator()) return;
			for each (var window:MDIWindow in _canvas.windowManager.windowList) {
				checkPermissionsOverWindow(window);
			}
		}

		private function checkSingleWindowPermissions(window:MDIWindow):void {
			if (!LayoutDefinition.ignoreWindow(window)) {
				(window as CustomMdiWindow).unlocked = !_locked || UsersUtil.amIModerator() || UsersUtil.amIPresenter();
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

		private function onMDIManagerEvent(e:MDIManagerEvent):void {
			//LOGGER.debug("Window has been modified. Event=[" + e.type + "]");
			onActionOverWindowFinished(e.window);
		}

		private function onActionOverWindowFinished(window:MDIWindow):void {
			if (LayoutDefinition.ignoreWindow(window))
				return;
			
			checkSingleWindowPermissions(window);

			updateCurrentLayout();
			if (_autoSync) {
				sendLayoutUpdate(currentLayout);
			}
		}
		
    private function updateCurrentLayout(layout:LayoutDefinition=null):LayoutDefinition {
      if (layout != null) {
        if (_currentLayout) _currentLayout.currentLayout = false;
        _currentLayout = layout;
        //trace(LOG + "updateCurrentLayout - currentLayout = [" + layout.name + "]");
        layout.currentLayout = true;
      } else if (detectContainerChange) {
        //LOGGER.debug("invalidating layout event");
        _globalDispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.INVALIDATE_LAYOUT_EVENT));
        _currentLayout = LayoutDefinition.getLayout(_canvas, ResourceUtil.getInstance().getString('bbb.layout.combo.customName'));
        //trace(LOG + "updateCurrentLayout - layout is NULL! Setting currentLayout = [" + _currentLayout.name + "]");
      }

			return _currentLayout;
		}

		/*
		 * This is because a unique layout may have multiple definitions depending
		 * on the role of the participant
		 */
		public function presenterChanged():void {
			if (_canvas != null)
				applyLayout(_currentLayout);
		}

		public function set currentLayout(value:LayoutDefinition):void {
			_currentLayout = value;
		}

		public function get currentLayout():LayoutDefinition {
			return _currentLayout;
		}
	}
}
