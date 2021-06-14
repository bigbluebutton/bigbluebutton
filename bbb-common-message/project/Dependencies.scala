package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.4"
    val junit = "5.7.0"
    val scalactic = "3.2.3"

    // Libraries
    val akkaVersion = "2.6.10"
    val gson = "2.8.6"
    val jackson = "2.12.1"
    val sl4j = "1.7.30"
    val pool = "2.9.0"
    val codec = "1.15"

    // Redis
    val lettuce = "6.1.2.RELEASE"

    // Test
    val scalaTest = "3.2.3"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.13" % Versions.akkaVersion
    val akkaSl4fj = "com.typesafe.akka" % "akka-slf4j_2.13" % Versions.akkaVersion % "runtime"

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val sl4jSimple = "org.slf4j" % "slf4j-simple" % Versions.sl4j
    val sl4jApi = "org.slf4j" % "slf4j-api" % Versions.sl4j
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool
    val commonCodec = "commons-codec" % "commons-codec" % Versions.codec
    val lettuceCore = "io.lettuce" % "lettuce-core" % Versions.lettuce
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "org.junit.jupiter" % "junit-jupiter-api" % Versions.junit % "test"
    val scalactic = "org.scalactic" %% "scalactic" % Versions.scalactic % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.junit,
    Test.scalactic)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.akkaSl4fj,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.sl4jSimple,
    Compile.sl4jApi,
    Compile.apachePool2,
    Compile.commonCodec,
    Compile.lettuceCore) ++ testing
}
