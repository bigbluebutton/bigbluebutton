package org.bigbluebutton.core.apps.audiocaptions

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class AudioCaptionsApp2x(implicit val context: ActorContext)
  extends UpdateTranscriptPubMsgHdlr
  with TranscriptionProviderErrorMsgHdlr {

  val log = Logging(context.system, getClass)
}
