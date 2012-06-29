package org.bigbluebutton.core.model
{
    import org.bigbluebutton.common.LogUtil;

    public class ConfigModel
    {
        private var _config:XML = null;
        
        public function setConfig(config:XML):void {
            this._config = config;
        }
        
        public function get help():Object {
            var help:Object = new Object();
            help.url = _config.help.@url;
            return help;
        }
        
        public function get localeVersion():String {
            return _config.localeversion;
        }
        
        public function get version():String {
            return _config.version;
        }
        
        public function get porttest():Object {
            var p:Object = new Object();
            p.host = _config.porttest.@host;
            p.application = _config.porttest.@application;
            return p;
        }
        
        public function get applicationServer():String {
            return _config.application.@server;
        }

        public function get applicationApp():String {
            return _config.application.@app;
        }
        
        public function get applicationForceTunnel():Boolean {
            if (_config.application.@forceTunnel != undefined) {
                return (_config.application.@forceTunnel.toString().toUpperCase() == "TRUE") ? true : false;
            }
            
            return false;
        }
        
        public function get enterApiURI():Object {
            return _config.application.@host;
        }
        
        public function get language():Object {
            var a:Object = new Object();
            a.userSelectionEnabled = ((_config.language.@userSelectionEnabled).toUpperCase() == "TRUE") ? true : false;
            return a
        }
        
        public function get skinning():Object {
            var a:Object = new Object();
            a.enabled = ((_config.skinning.@enabled).toUpperCase() == "TRUE") ? true : false;
            a.url = _config.skinning.@url;
            return a
        }
        
        public function get layout():XML {
            return new XML(_config.layout.toXMLString());
        }
        
        public function isModulePresent(name:String):Boolean {
            var mn:XMLList = _config.modules..@name;
            var found:Boolean = false;
            
            for each (var n:XML in mn) {
                if (n.toString().toUpperCase() == name.toUpperCase()) {
                    found = true;
                    break;
                }
            }	
            return found;
        }
        
        public function getConfigFor(moduleName:String):XML {
            if (isModulePresent(moduleName)) {
                return new XML(_config.modules.module.(@name.toUpperCase() == moduleName.toUpperCase()).toXMLString());
            }
            LogUtil.debug("Cannot find module " + moduleName);
            return null;
        }
    }
}