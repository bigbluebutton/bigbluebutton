package org.bigbluebutton.core.services
{
    import flash.utils.Dictionary;
    
    import mx.collections.ArrayCollection;
    
    import org.bigbluebutton.main.model.modules.ModuleDescriptor;
    
    public class ModuleDependencyResolver
    {
        
        /**
         * Creates a dependency tree for modules using a topological sort algorithm 
         * (Khan, 1962, http://portal.acm.org/beta/citation.cfm?doid=368996.369025)
         */
        public function buildDependencyTree(modules:Dictionary):ArrayCollection {
            var sortedDependencies:ArrayCollection = new ArrayCollection();
            var independent:ArrayCollection = getModulesWithNoDependencies(modules);
            
            for (var i:int = 0; i < independent.length; i++) {
                (independent.getItemAt(i) as ModuleDescriptor).resolved = true;
            }
            
            while (independent.length > 0){
                var n:ModuleDescriptor = independent.removeItemAt(0) as ModuleDescriptor;
                sortedDependencies.addItem(n);
                
                for (var key:Object in modules){
                    var m:ModuleDescriptor = modules[key] as ModuleDescriptor;
                    m.removeDependency(n.name);
                    if ((m.unresolvedDependencies.length == 0) && (!m.resolved)){
                        independent.addItem(m);
                        m.resolved = true;
                    }
                }
            }
/*            
            //Debug Information
            for (var key2:Object in modules) {
                var m2:ModuleDescriptor = modules[key2] as ModuleDescriptor;
                if (m2.unresolvedDependencies.length != 0){
                    throw new Error("Modules have circular dependancies, please check your config file. Unresolved: " + 
                        m2.name + " depends on " + m2.unresolvedDependencies.toString());
                }
            }
            LogUtil.debug("Dependency Order: ");
            for (var u:int = 0; u<sorted.length; u++) {
                LogUtil.debug(((sorted.getItemAt(u) as ModuleDescriptor).getName()));
                //Alert.show((sorted.getItemAt(u) as ModuleDescriptor).getAttribute("name") as String);
            }
*/            
            return sortedDependencies;
        }
        
        private function getModulesWithNoDependencies(modules:Dictionary):ArrayCollection{
            var returnArray:ArrayCollection = new ArrayCollection();
            for (var key:Object in modules) {
                var m:ModuleDescriptor = modules[key] as ModuleDescriptor;
                if (m.unresolvedDependencies.length == 0) {
                    returnArray.addItem(m);
                }
            }
            return returnArray;
        }
    }
}