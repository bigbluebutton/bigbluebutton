package org.bigbluebutton.core.apps.audiocaptions

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.SystemConfiguration

class AudioCaptionsApp2x(implicit val context: ActorContext)
  extends UpdateTranscriptPubMsgHdlr
  with TranscriptionProviderErrorMsgHdlr
  with SystemConfiguration {

  val log = Logging(context.system, getClass)
}
