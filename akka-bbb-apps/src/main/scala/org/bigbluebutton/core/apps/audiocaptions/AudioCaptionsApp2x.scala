package org.bigbluebutton.core.apps.audiocaptions

import akka.actor.ActorContext

class AudioCaptionsApp2x(implicit val context: ActorContext)
  extends UpdateTranscriptPubMsgHdlr
  with AudioFloorChangedVoiceConfEvtMsgHdlr {

}
