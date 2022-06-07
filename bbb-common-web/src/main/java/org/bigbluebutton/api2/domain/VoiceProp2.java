package org.bigbluebutton.api2.domain;


public class VoiceProp2 {
    public final String telVoice;
    public final String webVoice;
    public final String dialNumber;

    public VoiceProp2(String telVoice,
                      String webVoice,
                      String dialNumber) {
        this.telVoice = telVoice;
        this.webVoice = webVoice;
        this.dialNumber = dialNumber;
    }
}
