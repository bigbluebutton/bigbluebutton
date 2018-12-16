package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.12.8"

    // Libraries
    val akkaVersion = "2.5.19"
    val gson = "2.8.5"
    val sl4j = "1.7.25"
    val quicklens = "1.4.11"

    // Apache Commons
    val lang = "3.8.1"
    val io = "2.6"
    val pool = "2.6.0"

    // BigBlueButton
    val bbbCommons = "0.0.20-SNAPSHOT"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.12" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.12" % Versions.akkaVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val quicklens = "com.softwaremill.quicklens" %% "quicklens" % Versions.quicklens
    val sl4jApi = "org.slf4j" % "slf4j-api" % Versions.sl4j % "provided"

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang
    val apacheIo = "commons-io" % "commons-io" % Versions.io
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.12" % Versions.bbbCommons
  }

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.googleGson,
    Compile.quicklens,
    Compile.sl4jApi,
    Compile.apacheLang,
    Compile.apacheIo,
    Compile.apachePool2,
    Compile.bbbCommons)
}
