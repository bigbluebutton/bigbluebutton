
name := "apps"

organization := "org.bigbluebutton"

version := "0.1-SNAPSHOT"

scalaVersion  := "2.11.6"

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.7",
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

testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")

testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

libraryDependencies ++= {
  val akkaVersion  = "2.3.10"
  val sprayVersion = "1.3.2"
  Seq(
	  "io.spray"                 %%  "spray-json"        % sprayVersion,
	  "io.spray"                 %%  "spray-routing"     % sprayVersion,
	  "com.typesafe.akka"        %%  "akka-actor"        % akkaVersion,
	  "com.typesafe.akka"        %%  "akka-testkit"      % akkaVersion    % "test",
	  "com.typesafe.akka" 	     %%  "akka-slf4j"        % akkaVersion,
	  "ch.qos.logback"    	      %  "logback-classic"   % "1.0.3",
	  "org.pegdown" 		      %  "pegdown"           % "1.4.0",
	  "junit" 				      %  "junit"             % "4.11",
	  "com.etaty.rediscala"      %%  "rediscala"         % "1.4.0",
	  "commons-codec"             %  "commons-codec"     % "1.8",
	  "joda-time"                 %  "joda-time"         % "2.3",
	  "net.virtual-void"         %%  "json-lenses"       % "0.5.4",
	  "com.google.code.gson"      %  "gson"              % "1.7.1",
	  "redis.clients"             %  "jedis"             % "2.1.0",
	  "org.jboss.netty"           %  "netty"             % "3.2.1.Final",
      "org.apache.commons"        %  "commons-lang3"     % "3.2"
	)}

libraryDependencies += "org.freeswitch"   %  "fs-esl-client" % "0.8.2" from "http://blindside.googlecode.com/svn/repository/org/freeswitch/fs-esl-client/0.8.2/fs-esl-client-0.8.2.jar"

seq(Revolver.settings: _*)

scalariformSettings
