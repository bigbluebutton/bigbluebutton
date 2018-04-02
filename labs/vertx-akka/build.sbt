enablePlugins(JavaServerAppPackaging)

name := "vertx-akka"

organization := "org.bigbluebutton"

version := "0.0.2"

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

resolvers ++= Seq(
  "spray repo" at "http://repo.spray.io/",
  "rediscala" at "http://dl.bintray.com/etaty/maven",
  "blindside-repos" at "http://blindside.googlecode.com/svn/repository/"
)

publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/dev/repo/maven-repo/releases" )) )

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

unmanagedResourceDirectories in Compile += { baseDirectory.value / "src/main/webapp" }

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

libraryDependencies ++= {
	val scalaV = "2.12.2"
	val akkaVersion  = "2.5.1"
	val scalaTestV  = "2.2.6"
	val vertxV = "3.5.1"

  Seq(
	  "com.typesafe.akka"        %%  "akka-actor"        % akkaVersion,
	  "com.typesafe.akka"        %%  "akka-testkit"      % akkaVersion    % "test",
	  "com.typesafe.akka" 	     %%  "akka-slf4j"        % akkaVersion,
	  "ch.qos.logback"    	      %  "logback-classic"   % "1.0.13" % "runtime",
	  "org.pegdown" 		      %  "pegdown"           % "1.4.0",
	  "junit" 				      %  "junit"             % "4.11",
	  "commons-codec"             %  "commons-codec"     % "1.8",
	  "joda-time"                 %  "joda-time"         % "2.3",
		"com.google.code.gson" % "gson" % "2.8.0",
	  "io.vertx"                  %  "vertx-web"         % vertxV,
	  "io.vertx"                  %  "vertx-auth-common" % vertxV,
	  "io.vertx"                  %  "vertx-auth-shiro" % vertxV,
    "io.vertx" %% "vertx-web-scala" % vertxV,
		"io.vertx" %% "vertx-lang-scala" % vertxV,
		"com.github.etaty" % "rediscala_2.12" % "1.8.0",
		"com.softwaremill.quicklens" %% "quicklens" % "1.4.8",
		"org.bigbluebutton" % "bbb-common-message_2.12" % "0.0.19-SNAPSHOT",
		"redis.clients" % "jedis" % "2.9.0"
	)}

seq(Revolver.settings: _*)

scalariformSettings


//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
mainClass := Some("org.bigbluebutton.Boot")

maintainer in Linux := "Richard Alam <ritzalam@gmail.com>"

packageSummary in Linux := "vertx akka example"

packageDescription := """Vertx Akka Example."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user        

// group which will execute the application
daemonGroup in Linux := group 

mappings in Universal <+= (packageBin in Compile, sourceDirectory ) map { (_, src) =>
    // Move the application.conf so the user can override settings here
    val appConf = src / "main" / "resources" / "application.conf"
    appConf -> "conf/application.conf"
}

mappings in Universal <+= (packageBin in Compile, sourceDirectory ) map { (_, src) =>
    // Move logback.xml so the user can override settings here    
    val logConf = src / "main" / "resources" / "logback.xml"
    logConf -> "conf/logback.xml"
}

debianPackageDependencies in Debian ++= Seq("java8-runtime-headless", "bash")
