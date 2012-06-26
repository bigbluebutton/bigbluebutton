package org.bigbluebutton.core.services
{
    import flash.utils.Dictionary;
    
    import mx.collections.ArrayCollection;
    import mx.utils.StringUtil;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.ModuleDescriptor;
    import org.bigbluebutton.core.model.ModuleModel;

    public class ConfigToModuleDataParser
    {        
        public function parseConfig(xml:XML, moduleModel:ModuleModel):void {
            var dependencyResolver:ModuleDependencyResolver = new ModuleDependencyResolver();
            var modules:Dictionary = new Dictionary();
            var list:XMLList = xml.modules.module;
            var item:XML;
            
            for each(item in list){
                var mod:ModuleDescriptor = new ModuleDescriptor();
                mod.attributes = parseAttributes(item);
                mod.unresolvedDependencies = parseDependencies(mod.attributes);
                modules[item.@name] = mod;
                LogUtil.debug("*** " + item.@name);
            }
             
            moduleModel.setModulesAndDependencies(modules, dependencyResolver.buildDependencyTree(modules));        
        }
        
        private function parseAttributes(item:XML):Object {
            var attNamesList:XMLList = item.@*;
            var attributes:Object = new Object();
            
            for (var i:int = 0; i < attNamesList.length(); i++)
            { 
                var attName:String = attNamesList[i].name();
                var attValue:String = item.attribute(attName);
                attributes[attName] = attValue;
            }   
            
            return attributes;
        }
        
        private function parseDependencies(attributes:Object):ArrayCollection {
            var dependString:String = attributes["dependsOn"] as String;
            if (dependString == null) return new ArrayCollection();
            
            var trimmedString:String = StringUtil.trimArrayElements(dependString, ",");
            var dependencies:Array = trimmedString.split(",");
            var unresolvedDependancies:ArrayCollection = new ArrayCollection();
            
            for (var i:int = 0; i < dependencies.length; i++){
                unresolvedDependancies.addItem(dependencies[i]);
            }		
            
            return unresolvedDependancies;
        }
    }
}