package org.bigbluebutton.modules.present.models
{
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.ConfigModel;

    public class PresentationConfigModel
    {
        public var configModel:ConfigModel;
                
        public function get showWindowControls():Boolean {
            var vxml:XML = getConfig();
            if (vxml != null) {
                if (vxml.@showWindowControls != undefined) {
                    return (vxml.@showWindowControls.toString().toUpperCase() == "TRUE") ? true : false;
                }
            }
            return true;
        }
        
        public function get showPresentWindow():Boolean {
            var vxml:XML = getConfig();
            if (vxml != null) {
                if (vxml.@showPresentWindow != undefined) {
                    return (vxml.@showPresentWindow.toString().toUpperCase() == "TRUE") ? true : false;
                }
            }
            return true;
        }        

        public function get presentationService():String {
            var vxml:XML = getConfig();
            if (vxml != null) {
                if (vxml.@presentationService != undefined) {
                    return vxml.@presentationService.toString();
                }
            }
            LogUtil.debug("*** No presentationService option.");
            return null;
        } 
        
        private function getConfig():XML {
            return configModel.getConfigFor("PresentModule");
        }            
    }
}