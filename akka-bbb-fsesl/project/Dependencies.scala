package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.9"
    val junitInterface = "0.11"
    val scalactic = "3.0.8"

    // Libraries
    val pekkoVersion = "1.0.1"
    val pekkoHttpVersion = "1.0.0"
    val logback = "1.2.13"

    // Apache Commons
    val lang = "3.12.0"
    val codec = "1.15"

    // BigBlueButton
    val bbbCommons = "0.0.22-SNAPSHOT"
    val bbbFsesl = "0.0.9-SNAPSHOT"

    // Test
    val scalaTest = "3.2.11"
    val pekkoTestKit = "1.0.1"
    val junit = "4.12"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val pekkoActor = "org.apache.pekko" %% "pekko-actor" % Versions.pekkoVersion
    val pekkoSlf4j = "org.apache.pekko" %% "pekko-slf4j" % Versions.pekkoVersion
    val pekkoStream = "org.apache.pekko" %% "pekko-stream" % Versions.pekkoVersion

    val pekkoHttp = "org.apache.pekko" %% "pekko-http" % Versions.pekkoHttpVersion
    val pekkoHttpSprayJson = "org.apache.pekko" %% "pekko-http-spray-json" % Versions.pekkoHttpVersion

    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback
    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.13" % Versions.bbbCommons

    val bbbFseslClient = "org.bigbluebutton" % "bbb-fsesl-client" % Versions.bbbFsesl
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val scalactic = "org.scalactic" % "scalactic_2.13" % Versions.scalactic % "test"
    val pekkoTestKit = "org.apache.pekko" %% "pekko-testkit" % Versions.pekkoTestKit % "test"

    // https://mvnrepository.com/artifact/com.typesafe.akka/akka-http-testkit
    val pekkoHttpTestKit = "org.apache.pekko" %% "pekko-http-testkit" % "1.0.0" % "test"
  }


  val testing = Seq(
    Test.scalaTest,
  //   Test.junit,
    Test.scalactic,
    Test.pekkoTestKit,
    Test.pekkoHttpTestKit
    )


  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.pekkoActor,
    Compile.pekkoSlf4j,
    Compile.pekkoStream,
    Compile.logback,
    Compile.commonsCodec,
    Compile.apacheLang,
    Compile.bbbCommons,
    Compile.bbbFseslClient,
    Compile.pekkoHttp,
    Compile.pekkoHttpSprayJson) ++ testing
}
