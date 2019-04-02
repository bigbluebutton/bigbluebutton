import org.bigbluebutton.build._

description := "BigBlueButton custom FS-ESL client built on top of FS-ESL Java library."

version := "0.0.7-SNAPSHOT"

val compileSettings = Seq(
  organization := "org.bigbluebutton",

  scalacOptions ++= List(
    "-unchecked",
    "-deprecation",
    "-Xlint",
    "-Ywarn-dead-code",
    "-language:_",
    "-target:jvm-1.8",
    "-encoding", "UTF-8"
  ),
  javacOptions ++= List(
    "-Xlint:unchecked",
    "-Xlint:deprecation"
  )
)

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

Seq(Revolver.settings: _*)
lazy val bbbFSESLClient = (project in file(".")).settings(name := "bbb-fsesl-client", libraryDependencies ++= Dependencies.runtime).settings(compileSettings)

//-----------
// Packaging
//
// Reference:
// http://xerial.org/blog/2014/03/24/sbt/
// http://www.scala-sbt.org/sbt-pgp/usage.html
// http://www.scala-sbt.org/0.13/docs/Using-Sonatype.html
// http://central.sonatype.org/pages/requirements.html
// http://central.sonatype.org/pages/releasing-the-deployment.html
//-----------

// Build pure Java lib (i.e. without scala)
// Do not append Scala versions to the generated artifacts
crossPaths := false

// This forbids including Scala related libraries into the dependency
autoScalaLibrary := false

publishTo := Some(Resolver.file("file", new File(Path.userHome.absolutePath + "/.m2/repository")))

//publishTo := {
//  val nexus = "https://oss.sonatype.org/"
//  if (isSnapshot.value)
//    Some("snapshots" at nexus + "content/repositories/snapshots")
//  else
//    Some("releases"  at nexus + "service/local/staging/deploy/maven2")
//}


// Enables publishing to maven repo
publishMavenStyle := true

publishArtifact in Test := false

// http://www.scala-sbt.org/release/docs/Artifacts.html
// disable publishing the main API jar
publishArtifact in(Compile, packageDoc) := false

// disable publishing the main sources jar
publishArtifact in(Compile, packageSrc) := false

pomIncludeRepository := { _ => false }

pomExtra := (
  <scm>
    <url>git@github.com:bigbluebutton/bigbluebutton.git</url>
    <connection>scm:git:git@github.com:bigbluebutton/bigbluebutton.git</connection>
  </scm>
    <developers>
      <developer>
        <id>ritzalam</id>
        <name>Richard Alam</name>
        <url>http://www.bigbluebutton.org</url>
      </developer>
    </developers>)

licenses := Seq("Apache License, Version 2.0" -> url("http://opensource.org/licenses/Apache-2.0"))

homepage := Some(url("http://www.bigbluebutton.org"))
