package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.12.7"
    val junit = "4.12"
    val junitInterface = "0.11"
    val scalactic = "3.0.3"
    val pegdown = "1.6.0"

    // Libraries
    val gson = "2.8.5"
    val jackson = "2.9.7"
    val sl4j = "1.7.25"
    val lettuce = "5.1.2.RELEASE"

    // Test
    val scalaTest = "3.0.5"
  }

  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val googleGson = "com.google.code.gson" % "gson" % Versions.gson
    val jacksonModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.jackson
    val sl4jApi = "org.slf4j" % "slf4j-api" % Versions.sl4j
    val lettuceCore = "io.lettuce" % "lettuce-core" % Versions.lettuce
  }

  object Test {
    val scalaTest = "org.scalatest" %% "scalatest" % Versions.scalaTest % "test"
    val junit = "junit" % "junit" % Versions.junit % "test"
    val junitInteface = "com.novocode" % "junit-interface" % Versions.junitInterface % "test"
    val scalactic = "org.scalactic" % "scalactic_2.12" % Versions.scalactic % "test"
    val pegdown = "org.pegdown" % "pegdown" % Versions.pegdown % "test"
  }

  val testing = Seq(
    Test.scalaTest,
    Test.junit,
    Test.junitInteface,
    Test.scalactic,
    Test.pegdown)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.googleGson,
    Compile.jacksonModule,
    Compile.sl4jApi,
    Compile.lettuceCore) ++ testing
}
