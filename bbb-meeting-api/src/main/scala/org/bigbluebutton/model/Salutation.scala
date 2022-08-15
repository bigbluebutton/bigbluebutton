package org.bigbluebutton.model

sealed trait Salutation {
  def toString: String
  def lang: Lang
}

case object Hello extends Salutation {
  val lang: Lang = En
  override def toString: String = "Hello World!"
}

case object Hola extends Salutation {
  val lang: Lang = Es
  override def toString: String = "¡Hola mundo!"
}

case object Bonjour extends Salutation {
  val lang: Lang = Fr
  override def toString: String = "Bonjour monde!"
}
