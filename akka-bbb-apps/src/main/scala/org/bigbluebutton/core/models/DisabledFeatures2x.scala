package org.bigbluebutton.core.models

import org.bigbluebutton.core.db.MeetingDAO

object DisabledFeatures2x {

  def findAll(disabled: DisabledFeatures2x): Vector[String] = disabled.toVector

  def add(disabled: DisabledFeatures2x, feature: String): Unit = {
    disabled.save(feature)
  }

  def remove(disabled: DisabledFeatures2x, feature: String): Unit = {
    disabled.remove(feature)
  }

  def setAll(disabled: DisabledFeatures2x, features: Vector[String]): Unit = {
    disabled.replaceAll(features)
  }

  def clear(disabled: DisabledFeatures2x): Unit = {
    disabled.clear()
  }

  def persist(meetingId: String, disabled: DisabledFeatures2x): Unit = {
    MeetingDAO.updateDisabledComponents(meetingId, disabled.toVector)
  }

  def contains(disabled: DisabledFeatures2x, feature: String): Boolean = {
    disabled.toVector.contains(feature)
  }

  def set(disabled: DisabledFeatures2x, features: Vector[String]): DisabledFeatures2x = {
    disabled.replaceAll(features)
    disabled
  }
}

class DisabledFeatures2x {
  private var disabledFeatures: collection.immutable.HashSet[String] =
    new collection.immutable.HashSet[String]()

  def toVector: Vector[String] = disabledFeatures.toVector

  private def save(feature: String): Unit = {
    disabledFeatures += feature
  }

  private def remove(feature: String): Unit = {
    disabledFeatures -= feature
  }

  private def replaceAll(features: Vector[String]): Unit = {
    disabledFeatures = collection.immutable.HashSet(features: _*)
  }

  private def clear(): Unit = {
    disabledFeatures = collection.immutable.HashSet.empty
  }
}
