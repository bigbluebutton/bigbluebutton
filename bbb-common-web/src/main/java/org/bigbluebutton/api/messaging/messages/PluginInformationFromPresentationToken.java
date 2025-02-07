package org.bigbluebutton.api.messaging.messages;

public class PluginInformationFromPresentationToken {
    public final Boolean isFromPlugin;
    public final String pluginName;
    public final Integer pluginAssetPersistenceMaxFileSize;

    public PluginInformationFromPresentationToken (Boolean isFromPlugin,
                                                   Integer pluginAssetPersistenceMaxFileSize,
                                                   String pluginName
    ) {
        this.isFromPlugin = isFromPlugin;
        this.pluginAssetPersistenceMaxFileSize = pluginAssetPersistenceMaxFileSize;
        this.pluginName = pluginName;
    }
}
