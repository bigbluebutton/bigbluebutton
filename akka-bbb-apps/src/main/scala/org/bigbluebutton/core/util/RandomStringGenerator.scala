package org.bigbluebutton.core.util

import java.security.SecureRandom

object RandomStringGenerator {
  // From: http://www.bindschaedler.com/2012/04/07/elegant-random-string-generation-in-scala/

  // Random generator
  val random = new SecureRandom()

  // Generate a random string of length n from the given alphabet
  def randomString(alphabet: String)(n: Int): String =
    LazyList.continually(random.nextInt(alphabet.length)).map(alphabet).take(n).mkString

  // Generate a random alphabnumeric string of length n
  def randomAlphanumericString(n: Int): String =
    randomString("abcdefghijklmnopqrstuvwxyz0123456789")(n)

}

