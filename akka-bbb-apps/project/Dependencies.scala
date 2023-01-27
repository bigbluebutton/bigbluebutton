package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.9"
    val junit = "4.12"
    val junitInterface = "0.11"
    val scalactic = "3.0.8"

    // Libraries
    val akkaVersion = "2.6.17"
    val akkaHttpVersion = "10.2.7"
    val gson = "2.8.9"
    val jackson = "2.13.5"
    val logback = "1.2.11"
    val quicklens = "1.7.5"
    val spray = "1.3.6"

    // Apache Commons
    val lang = "3.12.0"
    val codec = "1.15"

    // BigBlueButton
    val bbbCommons = "0.0.22-SNAPSHOT"

    // Test
    val scalaTest = "3.2.11"
    val mockito = "2.23.0"
    val akkaTestKit = "2.6.0"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.13" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.13" % Versions.akkaVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val quicklens = "com.softwaremill.quicklens" %% "quicklens" % Versions.quicklens
    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback
    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec
    val sprayJson = "io.spray" % "spray-json_2.13" % Versions.spray

    val akkaStream = "com.typesafe.akka" %% "akka-stream" % Versions.akkaVersion
    val akkaHttp = "com.typesafe.akka" %% "akka-http" % Versions.akkaHttpVersion
    val akkaHttpSprayJson = "com.typesafe.akka" %% "akka-http-spray-json" % Versions.akkaHttpVersion

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.13" % Versions.bbbCommons
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
//    val junit = "junit" % "junit" % Versions.junit % "test"
    val mockitoCore = "org.mockito" % "mockito-core" % Versions.mockito % "test"
    val scalactic = "org.scalactic" % "scalactic_2.13" % Versions.scalactic % "test"
    val akkaTestKit = "com.typesafe.akka" %% "akka-testkit" % Versions.akkaTestKit % "test"
  }

  val testing = Seq(
    Test.scalaTest,
//    Test.junit,
    Test.mockitoCore,
    Test.scalactic,
    Test.akkaTestKit)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.akkaStream,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.quicklens,
    Compile.logback,
    Compile.commonsCodec,
    Compile.sprayJson,
    Compile.apacheLang,
    Compile.akkaHttp,
    Compile.akkaHttpSprayJson,
    Compile.bbbCommons) ++ testing
}
