package org.bigbluebutton.api2.meeting

import java.util.Map

/**
  * Created by ralam on 2017-05-17.
  *
  * private var internalUserId: String = null
  * private var externalUserId: String = null
  * private var fullname: String = null
  * private var role: String = null
  * private var avatarURL: String = null
  * private var status: Map[String, String] = null
  * private var guest: Boolean = false
  * private var waitingForAcceptance: Boolean = false
  * private var listeningOnly: Boolean = false
  * private var voiceJoined: Boolean = false
  * private var streams: List[String] = null
  */
case class User(internalUserId: String, externalUserId: String, fullname: String, role: String, avatarURL: String,
                guest: Boolean, waitingForAcceptance: Boolean, status: collection.immutable.Map[String, String],
               streams: Set[String])
