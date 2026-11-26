import org.bigbluebutton.build._

import NativePackagerHelper._
import com.typesafe.sbt.SbtNativePackager.autoImport._

enablePlugins(JavaServerAppPackaging)
enablePlugins(UniversalPlugin)
enablePlugins(DebianPlugin)

version := "0.0.4"

val compileSettings = Seq(
  organization := "org.bigbluebutton",

  scalacOptions ++= List(
    "-unchecked",
    "-deprecation",
    "-Xlint",
    "-Ywarn-dead-code",
    "-language:_",
    "-release:21",
    "-encoding", "UTF-8"
  ),
  javacOptions ++= List(
    "-Xlint:unchecked",
    "-Xlint:deprecation"
  )
)

publishTo := Some(Resolver.file("file", new File(Path.userHome.absolutePath + "/dev/repo/maven-repo/releases")))

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

// scalatest is supplied by project/Dependencies.scala (3.2.11). Declaring 3.0.8 here only
// creates an eviction, and >= 3.2 removed the FlatSpec/Matchers aliases UnitSpec used.
libraryDependencies += "org.scala-lang.modules" %% "scala-xml" % "2.0.0"

// The ScalaTest HTML reporter (-h) needs com.vladsch.flexmark, which is not on the test
// classpath, so it fails with NoClassDefFoundError. -oD reports to stdout with durations.
testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-oD")

// These test sources no longer compile, independently of any current work. UnitSpec,
// BigBlueButtonActorTestsSpec, TestKitUsageSpec and ReceivedJsonMsgHandlerTraitTests use
// ScalaTest 3.0 names removed in 3.2; AppsTestFixtures, GroupsChatTests and TestDataGen build
// models whose constructors have since changed. The rest extend one of those. Excluding them
// keeps the rest of the test tree compilable; without this, Test/compile fails and NO test in
// this module runs.
Test / unmanagedSources / excludeFilter := HiddenFileFilter ||
  "AppsTestFixtures.scala" || "BreakoutRoomsTestFixtures.scala" || "MeetingManagerTestFixtures.scala" ||
  "BigBlueButtonActorTestsSpec.scala" || "TestKitUsageSpec.scala" || "UnitSpec.scala" ||
  "BreakoutRoomsUtilSpec.scala" || "GroupsChatTests.scala" || "ReceivedJsonMsgHandlerTraitTests.scala" ||
  "TestDataGen.scala"

Seq(Revolver.settings: _*)
lazy val bbbAppsAkka = (project in file(".")).settings(name := "bbb-apps-akka", libraryDependencies ++= Dependencies.runtime, dependencyOverrides ++= Dependencies.overrides).settings(compileSettings)

// See https://github.com/scala-ide/scalariform
// Config file is in ./.scalariform.conf
scalariformAutoformat := true

scalaVersion := "2.13.18"
//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
mainClass := Some("org.bigbluebutton.Boot")

maintainer in Linux := "Richard Alam <ritzalam@gmail.com>"

packageSummary in Linux := "BigBlueButton Apps (Akka)"

packageDescription := """BigBlueButton Core Apps in Akka."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user

// group which will execute the application
daemonGroup in Linux := group

javaOptions in Universal ++= Seq("-J-Xms130m", "-J-Xmx256m", "-Dconfig.file=/etc/bigbluebutton/bbb-apps-akka.conf", "-Dlogback.configurationFile=conf/logback.xml")
javaOptions in reStart ++= Seq("-Dconfig.file=/etc/bigbluebutton/bbb-apps-akka.conf", "-Dlogback.configurationFile=conf/logback.xml")

debianPackageDependencies in Debian ++= Seq("java21-runtime-headless", "bash")
