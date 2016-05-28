package org.bigbluebutton.core.domain

sealed trait Abilities2x

case object CanRaiseHand extends Abilities2x
case object CanEjectUser extends Abilities2x
case object CanLockLayout extends Abilities2x
case object CanSetRecordingStatus extends Abilities2x
case object CanAssignPresenter extends Abilities2x
case object CanSharePresentation extends Abilities2x
case object CanShareCamera extends Abilities2x
case object CanUseMicrophone extends Abilities2x
case object CanPrivateChat extends Abilities2x
case object CanPublicChat extends Abilities2x
case object CanChangeLayout extends Abilities2x
case object CanDrawWhiteboard extends Abilities2x
case object CanShareDesktop extends Abilities2x
case object CanUploadPresentation extends Abilities2x
case object HasLayoutSupport extends Abilities2x
case object HasWebRtcSupport extends Abilities2x

