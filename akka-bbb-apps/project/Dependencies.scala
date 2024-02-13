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
    val jackson = "2.13.5"
    val logback = "1.2.11"
    val quicklens = "1.7.5"
    val spray = "1.3.6"

    // Apache Commons
    val lang = "3.12.0"
    val codec = "1.15"

    // BigBlueButton
    val bbbCommons = "0.0.30-SNAPSHOT"

    // Database
    val slick = "3.4.1"
    val postgresql = "42.5.0"
    val slickPg = "0.21.1"

    // Test
    val scalaTest = "3.2.11"
    val mockito = "2.23.0"
    val akkaTestKit = "2.6.0"
    val jacksonDataFormat = "2.13.5"
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

    val pekkoStream = "org.apache.pekko" %% "pekko-stream" % Versions.pekkoVersion
    val pekkoHttp = "org.apache.pekko" %% "pekko-http" % Versions.pekkoHttpVersion
    val pekkoHttpSprayJson = "org.apache.pekko" %% "pekko-http-spray-json" % Versions.pekkoHttpVersion

    val apacheLang = "org.apache.commons" % "commons-lang3" % Versions.lang

    val bbbCommons = "org.bigbluebutton" % "bbb-common-message_2.13" % Versions.bbbCommons

    val slick = "com.typesafe.slick" %% "slick" % Versions.slick
    val slickHikaricp = "com.typesafe.slick" %% "slick-hikaricp" % Versions.slick
    val slickPg = "com.github.tminglei" %% "slick-pg" % Versions.slickPg
    val slickPgSprayJson = "com.github.tminglei" %% "slick-pg_spray-json" % Versions.slickPg

    val postgresql = "org.postgresql" % "postgresql" % Versions.postgresql
    val jacksonDataFormat = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-yaml" % Versions.jacksonDataFormat
    val snakeYaml = "org.yaml" % "snakeyaml"
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
    Compile.apacheLang,
    Compile.pekkoHttp,
    Compile.pekkoHttpSprayJson,
    Compile.bbbCommons,
    Compile.slick,
    Compile.slickHikaricp,
    Compile.slickPg,
    Compile.slickPgSprayJson,
    Compile.postgresql,
    Compile.jacksonDataFormat) ++ testing
}
