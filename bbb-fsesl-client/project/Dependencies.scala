package org.bigbluebutton.build

import sbt._
import Keys._

object Dependencies {

  object Versions {
    // Scala
    val scala = "2.13.9"

    // Libraries
    val netty = "3.2.10.Final"
    val logback = "1.2.10"

    // Test
    val junit = "4.12"
  }
  
  object Compile {
    val scalaLibrary = "org.scala-lang" % "scala-library" % Versions.scala
    val scalaCompiler = "org.scala-lang" % "scala-compiler" % Versions.scala

    val netty = "org.jboss.netty" % "netty" % Versions.netty
    val logback = "ch.qos.logback" % "logback-classic" % Versions.logback
  }

  object Test {
    val junit = "junit" % "junit" % Versions.junit % "test"
  }

  val testing = Seq(
    Test.junit)

  val runtime = Seq(
    Compile.scalaLibrary,
    Compile.scalaCompiler,
    Compile.netty,
    Compile.logback) ++ testing
}
