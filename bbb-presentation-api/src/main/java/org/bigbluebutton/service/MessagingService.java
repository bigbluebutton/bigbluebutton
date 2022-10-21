package org.bigbluebutton.service;

import org.bigbluebutton.presentation.messages.IDocConversionMsg;

public interface MessagingService {

    void sendDocConversionMsg(IDocConversionMsg msg);
}
