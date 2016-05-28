package org.bigbluebutton.core.api;

import org.bigbluebutton.common.messages.*;

public interface IBigBlueButtonInGW {

    void handleJsonMessage(String json);

    void handleBigBlueButtonMessage(IBigBlueButtonMessage message);

}
