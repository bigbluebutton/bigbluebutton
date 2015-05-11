package org.bigbluebutton.apps.utils

/**
 * Utility to generate random strings.
 * 
 * From: http://www.bindschaedler.com/2012/04/07/elegant-random-string-generation-in-scala/
 * 
 */
object RandomStringGenerator {
  	
	val random = new scala.util.Random
	
	/**
	 * Generate a random string of length n from the given alphabet 
	 */ 
	def randomString(alphabet: String)(n: Int): String = 
	  Stream.continually(random.nextInt(alphabet.size)).map(alphabet).take(n).mkString
	
	/**
	 * Generate a random alphanumeric string of length n
	 */
	def randomAlphanumericString(n: Int) = 
	  randomString("abcdefghijklmnopqrstuvwxyz0123456789")(n)
}