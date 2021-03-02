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
    val sl4j = "1.7.25"
    val red5 = "1.0.10-M9"
    val pool = "2.8.0"

    // Redis
    val lettuce = "5.1.3.RELEASE"

    // Test
    val scalaTest = "3.0.5"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val akkaActor = "com.typesafe.akka" % "akka-actor_2.12" % Versions.akkaVersion

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val sl4jApi = "org.slf4j" % "slf4j-api" % Versions.sl4j % "runtime"
    val red5 = "org.red5" % "red5-server-common" % Versions.red5
    val apachePool2 = "org.apache.commons" % "commons-pool2" % Versions.pool

    val lettuceCore = "io.lettuce" % "lettuce-core" % Versions.lettuce
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "junit" % "junit" % Versions.junit % "test"
    val junitInteface = "com.novocode" % "junit-interface" % Versions.junitInterface % "test"
    val scalactic = "org.scalactic" % "scalactic_2.12" % Versions.scalactic % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.junit,
    Test.junitInteface,
    Test.scalactic)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.akkaActor,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.sl4jApi,
    Compile.red5,
    Compile.apachePool2,
    Compile.lettuceCore) ++ testing
}
