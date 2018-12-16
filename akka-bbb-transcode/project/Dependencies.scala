package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.12.8"
    val junitInterface = "0.11"
    val scalactic = "3.0.3"

    // Libraries
    val akkaVersion = "2.5.19"
    val logback = "1.2.3"

    // Apache Commons
    val lang = "3.8.1"
    val codec = "1.11"

    // BigBlueButton
    val bbbCommons = "0.0.20-SNAPSHOT"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.12" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.12" % Versions.akkaVersion

    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback
    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.12" % Versions.bbbCommons excludeAll (
      ExclusionRule(organization = "org.red5"))
  }

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.logback,
    Compile.commonsCodec,
    Compile.apacheLang,
    Compile.bbbCommons)
}
