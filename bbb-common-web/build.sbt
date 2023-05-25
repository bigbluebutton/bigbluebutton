import org.bigbluebutton.build._

version := "0.0.3-SNAPSHOT"

val compileSettings = Seq(
  organization := "org.bigbluebutton",

  scalacOptions ++= List(
    "-unchecked",
    "-deprecation",
    "-Xlint",
    "-Ywarn-dead-code",
    "-language:_",
    "-target:11",
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

libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.8" % "test"
libraryDependencies += "org.scala-lang.modules" %% "scala-xml" % "2.0.0"

Seq(Revolver.settings: _*)

lazy val commonWeb = (project in file(".")).settings(name := "bbb-common-web", libraryDependencies ++= Dependencies.runtime).settings(compileSettings)

// See https://github.com/scala-ide/scalariform
// Config file is in ./.scalariform.conf
scalariformAutoformat := true

scalaVersion := "2.13.9"
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

/** *************************
  * When developing, change the version above to x.x.x-SNAPSHOT then use the file resolver to
  * publish to the local maven repo using "sbt publish"
  */
// Uncomment this to publish to local maven repo while commenting out the nexus repo
publishTo := Some(Resolver.file("file", new File(Path.userHome.absolutePath + "/.m2/repository")))


// Comment this out when publishing to local maven repo using SNAPSHOT version.
// To push to sonatype "sbt publishSigned"
//publishTo := {
//   val nexus = "https://oss.sonatype.org/"
//   if (isSnapshot.value)
//     Some("snapshots" at nexus + "content/repositories/snapshots")
//   else
//     Some("releases"  at nexus + "service/local/staging/deploy/maven2")
//}

// Enables publishing to maven repo
publishMavenStyle := true

publishArtifact in Test := false

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

licenses := Seq("LGPL-3.0" -> url("http://opensource.org/licenses/LGPL-3.0"))

homepage := Some(url("http://www.bigbluebutton.org"))

libraryDependencies ++= Seq(
  "javax.validation" % "validation-api" % "2.0.1.Final",
  "org.springframework.boot" % "spring-boot-starter-validation" % "2.7.12",
  "org.springframework.data" % "spring-data-commons" % "2.7.6",
  "org.apache.httpcomponents" % "httpclient" % "4.5.13",
  "org.postgresql" % "postgresql" % "42.4.3",
  "org.hibernate" % "hibernate-core" % "5.6.1.Final",
  "org.flywaydb" % "flyway-core" % "7.8.2",
  "com.zaxxer" % "HikariCP" % "4.0.3"
)
