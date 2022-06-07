package org.bigbluebutton.freeswitch.voice.freeswitch;

import org.bigbluebutton.freeswitch.voice.freeswitch.actions.FreeswitchCommand;

public interface IDelayedCommandListener {
  public void runDelayedCommand(FreeswitchCommand command);
}
