package org.bigbluebutton.main.model.modules
{
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;

	public class DependancyResolver
	{
		private var _modules:Dictionary;
		
		public function DependancyResolver()
		{
		}
		
		/**
		 * Creates a dependency tree for modules using a topological sort algorithm (Khan, 1962, http://portal.acm.org/beta/citation.cfm?doid=368996.369025)
		 */
		public function buildDependencyTree(modules:Dictionary):ArrayCollection{
			this._modules = modules;
			
			var sorted:ArrayCollection = new ArrayCollection();
			var independent:ArrayCollection = getModulesWithNoDependencies();
			
			while(independent.length > 0){
				var n:ModuleDescriptor = independent.removeItemAt(0) as ModuleDescriptor;
				sorted.addItem(n);
				n.resolved = true;
				
				for (var key:Object in _modules) {
					var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
					m.removeDependency(n.getAttribute("name") as String);
					if ((m.unresolvedDependencies.length == 0) && (!m.resolved)){
						independent.addItem(m);
						m.resolved = true;
					}
				}
			}
			
			//Debug Information
			for (var key2:Object in _modules) {
				var m2:ModuleDescriptor = _modules[key2] as ModuleDescriptor;
				if (m2.unresolvedDependencies.length != 0){
					LogUtil.error("Module " + (m2.getAttribute("name") as String) + " still has a dependency " + (m2.unresolvedDependencies.getItemAt(0) as String)); 
				}
			}
			LogUtil.debug("Dependency Order: ");
			for (var u:int = 0; u<sorted.length; u++){
				LogUtil.debug(((sorted.getItemAt(u) as ModuleDescriptor).getAttribute("name") as String));
			}
			
			return sorted;
		}
		
		private function getModulesWithNoDependencies():ArrayCollection{
			var returnArray:ArrayCollection = new ArrayCollection();
			for (var key:Object in _modules) {
				var m:ModuleDescriptor = _modules[key] as ModuleDescriptor;
				if (m.unresolvedDependencies.length == 0) {
					returnArray.addItem(m);
				}
			}
			return returnArray;
		}
	}
}