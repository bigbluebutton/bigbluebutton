package org.bigbluebutton.freeswitch

import org.bigbluebutton.core.api.IBigBlueButtonInGW

/**
 * Workaround to get away from circular dependency injection.
 */
class FsInGwWrapper(inGW: IBigBlueButtonInGW,
    fsConfService: FreeswitchConferenceService) {

  fsConfService.setIBigBlueButtonInGW(inGW)
}