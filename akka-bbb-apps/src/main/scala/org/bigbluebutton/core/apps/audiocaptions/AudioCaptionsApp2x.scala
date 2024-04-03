package org.bigbluebutton.core.apps.audiocaptions

import org.apache.pekko.actor.ActorContext

class AudioCaptionsApp2x(implicit val context: ActorContext)
  extends UpdateTranscriptPubMsgHdlr
  with TranscriptionProviderErrorMsgHdlr
  with AudioFloorChangedVoiceConfEvtMsgHdlr {

}
