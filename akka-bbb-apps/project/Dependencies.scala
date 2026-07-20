package org.bigbluebutton.build

import sbt._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.9"
    val junit = "4.12"
    val junitInterface = "0.11"
    val scalactic = "3.0.8"

    // Libraries
    val pekkoVersion = "1.0.1"
    val pekkoHttpVersion = "1.0.0"
    val gson = "2.8.9"
    val jackson = "2.18.9"
    val netty = "4.1.135.Final"
    val logback = "1.5.38"
    val slf4j = "2.0.17"
    val quicklens = "1.7.5"
    val spray = "1.3.6"
    val semver = "0.10.2"
    val commonmark = "0.27.0"

    // Apache Commons
    val lang = "3.18.0"
    val codec = "1.15"
    val httpcomponents = "4.5.14"

    // BigBlueButton
    val bbbCommons = "0.0.22-SNAPSHOT"

    // Database
    val slick = "3.4.1"
    val postgresql = "42.7.13"
    val slickPg = "0.21.1"

    // Test
    val scalaTest = "3.2.11"
    val mockito = "2.23.0"
    val akkaTestKit = "2.6.0"
    val jacksonDataFormat = "2.18.9"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val pekkoActor = "org.apache.pekko" %% "pekko-actor" % Versions.pekkoVersion
    val pekkoSlf4j = "org.apache.pekko" %% "pekko-slf4j" % Versions.pekkoVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val quicklens = "com.softwaremill.quicklens" %% "quicklens" % Versions.quicklens
    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback
    val commonsCodec = "commons-codec" % "commons-codec" % Versions.codec
    val sprayJson = "io.spray" % "spray-json_2.13" % Versions.spray
    val semver = "com.github.zafarkhaja" % "java-semver" % Versions.semver
    val commonmark = "org.commonmark" % "commonmark" % Versions.commonmark


    val pekkoStream = "org.apache.pekko" %% "pekko-stream" % Versions.pekkoVersion
    val pekkoHttp = "org.apache.pekko" %% "pekko-http" % Versions.pekkoHttpVersion
    val pekkoHttpSprayJson = "org.apache.pekko" %% "pekko-http-spray-json" % Versions.pekkoHttpVersion

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang
    val apacheHttpComponents = "org.apache.httpcomponents" % "httpclient" % Versions.httpcomponents

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.13" % Versions.bbbCommons

    val slick = "com.typesafe.slick" %% "slick" % Versions.slick
    val slickHikaricp = "com.typesafe.slick" %% "slick-hikaricp" % Versions.slick
    val slickPg = "com.github.tminglei" %% "slick-pg" % Versions.slickPg
    val slickPgSprayJson = "com.github.tminglei" %% "slick-pg_spray-json" % Versions.slickPg

    val postgresql = "org.postgresql" % "postgresql" % Versions.postgresql
    val jacksonDataFormat = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-yaml" % Versions.jacksonDataFormat
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
    Compile.pekkoActor,
    Compile.pekkoSlf4j,
    Compile.pekkoStream,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.quicklens,
    Compile.logback,
    Compile.commonsCodec,
    Compile.sprayJson,
    Compile.semver,
    Compile.commonmark,
    Compile.apacheLang,
    Compile.apacheHttpComponents,
    Compile.pekkoHttp,
    Compile.pekkoHttpSprayJson,
    Compile.bbbCommons,
    Compile.slick,
    Compile.slickHikaricp,
    Compile.slickPg,
    Compile.slickPgSprayJson,
    Compile.postgresql,
    Compile.jacksonDataFormat) ++ testing

  // Force security-patched versions on transitively-pulled artifacts so the
  // whole jackson suite stays aligned and netty is at a fixed release.
  val overrides = Seq(
    "com.fasterxml.jackson.core" % "jackson-databind" % Versions.jackson,
    "com.fasterxml.jackson.core" % "jackson-core" % Versions.jackson,
    "com.fasterxml.jackson.core" % "jackson-annotations" % Versions.jackson,
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
