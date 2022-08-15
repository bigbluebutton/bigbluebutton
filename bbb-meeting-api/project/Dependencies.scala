import sbt._

object Dependencies {
  lazy val scalaTest = "org.scalatest" %% "scalatest" % "3.2.13"

  lazy val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.13" % "0.0.21-SNAPSHOT"

  val akkaHttpSessionCore = "com.softwaremill.akka-http-session" %% "core" % "0.7.0"
  val akkaHttpSessionJwt = "com.softwaremill.akka-http-session" %% "jwt" % "0.7.0"

  val apacheLang = "org.apache.commons" % "commons-lang3" % "3.12.0"

}
