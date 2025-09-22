package org.bigbluebutton.core.models

case class PresentationConversions(conversions: Map[String, PresentationConversion]) {
  def find(presId: String): Option[PresentationConversion] = conversions.get(presId)
  def add(conversion: PresentationConversion): PresentationConversions = copy(conversions = conversions + (conversion.presId -> conversion))
  def remove(presId: String): PresentationConversions = copy(conversions = conversions - presId)

  def filter(predicate: ((String, PresentationConversion)) => Boolean): PresentationConversions = {
    val filteredConversions = conversions.filter(predicate)
    copy(conversions = filteredConversions)
  }
}

case class PresentationConversion(presId: String, startTime: Long, maxDuration: Long)
