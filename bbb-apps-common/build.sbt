
name := "bbb-apps-common"

organization := "org.bigbluebutton"

version := "0.0.3-SNAPSHOT"

scalaVersion  := "2.12.2"

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.8",
  "-encoding", "UTF-8"
)

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

val scalaV = "2.12.2"
val akkaVersion  = "2.5.1"
val scalaTestV  = "2.2.6"

// https://mvnrepository.com/artifact/org.scala-lang/scala-library
libraryDependencies += "org.scala-lang" % "scala-library" % "2.12.2"
// https://mvnrepository.com/artifact/org.scala-lang/scala-compiler
libraryDependencies += "org.scala-lang" % "scala-compiler" % "2.12.2"

// https://mvnrepository.com/artifact/com.typesafe.akka/akka-actor_2.12
libraryDependencies += "com.typesafe.akka" % "akka-actor_2.12" % "2.5.1"
// https://mvnrepository.com/artifact/com.typesafe.akka/akka-slf4j_2.12
libraryDependencies += "com.typesafe.akka" % "akka-slf4j_2.12" % "2.5.1"

// https://mvnrepository.com/artifact/com.github.etaty/rediscala_2.12
libraryDependencies += "com.github.etaty" % "rediscala_2.12" % "1.8.0"

libraryDependencies += "com.softwaremill.quicklens" %% "quicklens" % "1.4.8"

libraryDependencies += "org.bigbluebutton" % "bbb-common-message_2.12" % "0.0.19-SNAPSHOT"

libraryDependencies += "com.google.code.gson" % "gson" % "2.8.0"
libraryDependencies += "redis.clients" % "jedis" % "2.9.0"

// https://mvnrepository.com/artifact/org.apache.commons/commons-lang3
libraryDependencies += "org.apache.commons" % "commons-lang3" % "3.5"
libraryDependencies += "commons-io" % "commons-io" % "2.4"
libraryDependencies += "org.apache.commons" % "commons-pool2" % "2.3"
libraryDependencies += "commons-io" % "commons-io" % "2.4"
libraryDependencies += "org.slf4j" % "slf4j-api" % "1.7.23" % "provided"


libraryDependencies += "junit" % "junit" % "4.12" % "test"
libraryDependencies += "com.novocode" % "junit-interface" % "0.11" % "test"

// For generating test reports
libraryDependencies += "org.pegdown" % "pegdown" % "1.6.0" % "test"
// https://mvnrepository.com/artifact/com.typesafe.akka/akka-testkit_2.12
libraryDependencies += "com.typesafe.akka" % "akka-testkit_2.12" % "2.5.1" % "test"

// https://mvnrepository.com/artifact/org.scalactic/scalactic_2.12
libraryDependencies += "org.scalactic" % "scalactic_2.12" % "3.0.3" % "test"

// https://mvnrepository.com/artifact/org.scalatest/scalatest_2.12
libraryDependencies += "org.scalatest" % "scalatest_2.12" % "3.0.3" % "test"

libraryDependencies += "org.mockito" % "mockito-core" % "2.7.22" % "test"

seq(Revolver.settings: _*)

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
//crossPaths := false

// This forbids including Scala related libraries into the dependency
//autoScalaLibrary := false

/***************************
* When developing, change the version above to x.x.x-SNAPSHOT then use the file resolver to
* publish to the local maven repo using "sbt publish"
*/
// Uncomment this to publish to local maven repo while commenting out the nexus repo
publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/.m2/repository")))


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
  

