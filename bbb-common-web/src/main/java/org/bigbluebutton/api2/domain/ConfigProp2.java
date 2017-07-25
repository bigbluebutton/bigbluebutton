package org.bigbluebutton.api2.domain;


import org.bigbluebutton.api.domain.Config;

import java.util.Map;

public class ConfigProp2 {
    public final String defaultConfigToken;
    public final Map<String, Config> configs;

    public ConfigProp2(String defaultConfigToken,
                       Map<String, Config> configs) {
        this.defaultConfigToken = defaultConfigToken;
        this.configs = configs;
    }
}
