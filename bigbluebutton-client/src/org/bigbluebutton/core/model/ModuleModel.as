package org.bigbluebutton.core.model
{
    import flash.events.IEventDispatcher;
    import flash.utils.Dictionary;
    
    import mx.collections.ArrayCollection;
    
    import org.bigbluebutton.common.LogUtil;

    public class ModuleModel
    {
        private var dispatcher:IEventDispatcher;       
        private var _modules:Dictionary;
        private var _sortedDependecies:ArrayCollection;
                
        public function ModuleModel(dispatcher:IEventDispatcher)
        {
            this.dispatcher = dispatcher;
        }
        
        public function setModulesAndDependencies(m:Dictionary, dependencies:ArrayCollection):void {
            _modules = m;	
            _sortedDependecies = dependencies;
            LogUtil.debug("Got config and dependencies");
        }
                
        public function get sortedDependencies():ArrayCollection {
            return _sortedDependecies;
        }
    }
}