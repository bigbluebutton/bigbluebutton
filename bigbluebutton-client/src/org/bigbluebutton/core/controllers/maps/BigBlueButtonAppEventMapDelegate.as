package org.bigbluebutton.core.controllers.maps
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.ConfigModel;
    import org.bigbluebutton.core.model.LocaleModel;

    public class BigBlueButtonAppEventMapDelegate
    {
        public var dispatcher:IEventDispatcher;
        
        public function BigBlueButtonAppEventMapDelegate(dispatcher:IEventDispatcher)
        {
            this.dispatcher = dispatcher;
        }
        
        public function compareLocaleVersion(config:ConfigModel, locale:LocaleModel):void {
            if (config.localeVersion == locale.localeVersion) {
            	LogUtil.debug("Locale version matches " + config.localeVersion);
            } else {
            	LogUtil.debug("Locale version does not match [config=" + config.localeVersion + ",locale=" + locale.localeVersion + "]");
            }
        }
    }
}