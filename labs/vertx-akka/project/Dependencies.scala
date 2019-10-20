package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.12.8"
    val junit = "4.12"
    val junitInterface = "0.11"
    val scalactic = "3.0.3"

    // Libraries
    val akkaVersion = "2.5.19"
    val gson = "2.8.5"
    val jackson = "2.9.7"
    val logback = "1.2.3"
    val quicklens = "1.4.11"
    val spray = "1.3.4"
    val vertxV = "3.5.1"

    // Apache Commons
    val lang = "3.8.1"
    val codec = "1.11"

    // BigBlueButton
    val bbbCommons = "0.0.20-SNAPSHOT"

    // Test
    val scalaTest = "3.0.5"
    val mockito = "2.23.0"
    val akkaTestKit = "2.5.18"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.12" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.12" % Versions.akkaVersion

    val vertxWeb = "io.vertx" %  "vertx-web" % Versions.vertxV
    val vertxAuthCommon = "io.vertx" % "vertx-auth-common" % Versions.vertxV
    val vertxAuthShiro = "io.vertx" %  "vertx-auth-shiro" % Versions.vertxV
    val vertxWebScala = "io.vertx" %% "vertx-web-scala" % Versions.vertxV
    val vertxLangScala = "io.vertx" %% "vertx-lang-scala" % Versions.vertxV

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val quicklens = "com.softwaremill.quicklens" %% "quicklens" % Versions.quicklens
    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback
    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec
    val sprayJson = "io.spray" % "spray-json_2.12" % Versions.spray

    val redisEtaty = "com.github.etaty" % "rediscala_2.12" % "1.8.0"

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.12" % Versions.bbbCommons excludeAll (
      ExclusionRule(organization = "org.red5"))
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "junit" % "junit" % Versions.junit % "test"
    val mockitoCore = "org.mockito" % "mockito-core" % Versions.mockito % "test"
    val scalactic = "org.scalactic" % "scalactic_2.12" % Versions.scalactic % "test"
    val akkaTestKit = "com.typesafe.akka" %% "akka-testkit" % Versions.akkaTestKit % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.junit,
    Test.mockitoCore,
    Test.scalactic,
    Test.akkaTestKit)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.vertxWeb,
    Compile.vertxAuthCommon,
    Compile.vertxAuthShiro,
    Compile.vertxWebScala,
    Compile.vertxWebScala,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.quicklens,
    Compile.logback,
    Compile.commonsCodec,
    Compile.sprayJson,
    Compile.apacheLang,
    Compile.redisEtaty,
    Compile.bbbCommons) ++ testing
}
