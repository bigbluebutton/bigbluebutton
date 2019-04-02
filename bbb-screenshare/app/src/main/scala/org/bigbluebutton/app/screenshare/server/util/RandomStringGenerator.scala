package org.bigbluebutton.app.screenshare.server.util

object RandomStringGenerator {
  // From: http://www.bindschaedler.com/2012/04/07/elegant-random-string-generation-in-scala/

  // Random generator
  val random = new scala.util.Random

  // Generate a random string of length n from the given alphabet
  def randomString(alphabet: String)(n: Int): String =
    Stream.continually(random.nextInt(alphabet.size)).map(alphabet).take(n).mkString

  // Generate a random alphabnumeric string of length n
  def randomAlphanumericString(n: Int) =
    randomString("abcdefghijklmnopqrstuvwxyz0123456789")(n)
}

