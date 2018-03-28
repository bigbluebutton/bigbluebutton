enablePlugins(JavaServerAppPackaging)

name := "vertx-akka"

organization := "org.bigbluebutton"

version := "0.0.2"

scalaVersion  := "2.11.6"

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
  val akkaVersion  = "2.4.0"
  Seq(
	  "com.typesafe.akka"        %%  "akka-actor"        % akkaVersion,
	  "com.typesafe.akka"        %%  "akka-testkit"      % akkaVersion    % "test",
	  "com.typesafe.akka" 	     %%  "akka-slf4j"        % akkaVersion,
	  "ch.qos.logback"    	      %  "logback-classic"   % "1.0.13" % "runtime",
	  "org.pegdown" 		      %  "pegdown"           % "1.4.0",
	  "junit" 				      %  "junit"             % "4.11",
	  "commons-codec"             %  "commons-codec"     % "1.8",
	  "joda-time"                 %  "joda-time"         % "2.3",
	  "com.google.code.gson"      %  "gson"              % "1.7.1",
	  "io.vertx"                  %  "vertx-web"         % "3.1.0",
	  "io.vertx"                  %  "vertx-auth-common" % "3.1.0",
	  "io.vertx"                  %  "vertx-auth-shiro" % "3.1.0"
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
