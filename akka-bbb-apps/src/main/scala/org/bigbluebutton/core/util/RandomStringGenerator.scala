package org.bigbluebutton.core.util

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

  def randomColor = {
    val colorOptions = List("#7b1fa2", "#6a1b9a", "#4a148c", "#5e35b1", "#512da8", "#4527a0", "#311b92",
      "#3949ab", "#303f9f", "#283593", "#1a237e", "#1976d2", "#1565c0", "#0d47a1", "#0277bd", "#01579b")
    colorOptions(random.nextInt(colorOptions.length))
  }

}

