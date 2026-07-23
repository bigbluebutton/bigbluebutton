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
    val logback = "1.5.38"
    val jackson = "2.18.9"
    val netty = "4.1.135.Final"
    val slf4j = "2.0.17"

    // Apache Commons
    val lang = "3.18.0"
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

  // Force security-patched versions on transitively-pulled artifacts (jackson
  // suite kept aligned; netty at a fixed release).
  val overrides = Seq(
    "com.fasterxml.jackson.core" % "jackson-databind" % Versions.jackson,
    "com.fasterxml.jackson.core" % "jackson-core" % Versions.jackson,
    "com.fasterxml.jackson.core" % "jackson-annotations" % Versions.jackson,
    "com.fasterxml.jackson.dataformat" % "jackson-dataformat-yaml" % Versions.jackson,
    "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson,
    "io.netty" % "netty-handler" % Versions.netty,
    "io.netty" % "netty-codec" % Versions.netty,
    "io.netty" % "netty-common" % Versions.netty,
    "io.netty" % "netty-buffer" % Versions.netty,
    "io.netty" % "netty-transport" % Versions.netty,
    "io.netty" % "netty-resolver" % Versions.netty,
    // logback 1.5.x is an slf4j-2.x provider; pin slf4j-api 2.x so the
    // ServiceLoader binding resolves (pekko-slf4j is runtime-compatible).
    "org.slf4j" % "slf4j-api" % Versions.slf4j)
}
