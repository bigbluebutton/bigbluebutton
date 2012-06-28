package org.bigbluebutton.core.model
{
    import flash.events.IEventDispatcher;
    import flash.utils.Dictionary;
    
    import mx.collections.ArrayCollection;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.ModuleLoadedEvent;

    public class ModuleModel
    {
        private var dispatcher:IEventDispatcher;       
        private var _modules:Dictionary = new Dictionary();
        private var _sortedDependecies:ArrayCollection;
                
        public function ModuleModel(dispatcher:IEventDispatcher)
        {
            this.dispatcher = dispatcher;
        }
        
        public function setModulesAndDependencies(modules:Dictionary, dependencies:ArrayCollection):void {
            _modules = modules;	
            _sortedDependecies = dependencies;
            for (var key:Object in modules) {
                var m:ModuleDescriptor = modules[key] as ModuleDescriptor;
                m.dispatcher = dispatcher;
            }
        }
                
        public function get sortedDependencies():ArrayCollection {
            return _sortedDependecies;
        }
        
        public function loadAllModules():void {
            if (!allModulesLoaded()) {
                var m:ModuleDescriptor = getNextModuleToLoad();
                if (m != null) {
                    m.load();
                }
            } else {
                LogUtil.debug("All modules have been loaded.");
                dispatcher.dispatchEvent(new ModuleLoadedEvent(ModuleLoadedEvent.ALL_MODULES_LOADED_EVENT));
            }
        }
        
        private function getNextModuleToLoad():ModuleDescriptor {
            for (var i:int = 0; i < _sortedDependecies.length; i++){
                var m:ModuleDescriptor = _sortedDependecies.getItemAt(i) as ModuleDescriptor;
                if (!m.loaded){
                    return m;
                } 
            }
            return null;
        }
        
        private function allModulesLoaded():Boolean {
            for (var i:int = 0; i < _sortedDependecies.length; i++){
                var m:ModuleDescriptor = _sortedDependecies.getItemAt(i) as ModuleDescriptor;
                if (!m.loaded){
                    return false;
                } 
            }
            return true;
        }
        
        public function startAllModules():void {
            for (var key:Object in _modules) {				
                var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
                if (m.module != null) {
                    LogUtil.debug('Starting module ' + m.name);
                } else {
                    LogUtil.debug("No modules to start");
                }
            }		            
        }
        
        private function getModule(name:String):ModuleDescriptor {
            for (var key:Object in _modules) {				
                var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
                if (m.name == name) {
                    return m;
                }
            }		
            return null;	
        }
    }
}