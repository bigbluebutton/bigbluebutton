addSbtPlugin("io.spray" % "sbt-revolver" % "0.9.1")

addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "5.2.4")

addSbtPlugin("org.scalariform" % "sbt-scalariform" % "1.8.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.3.15")

addSbtPlugin("net.vonbuchholtz" % "sbt-dependency-check" % "0.2.9")

addSbtPlugin("org.scalastyle" %% "scalastyle-sbt-plugin" % "1.0.0")

addSbtPlugin("org.apache.pekko" % "pekko-grpc-sbt-plugin" % "1.0.1")

ThisBuild / libraryDependencySchemes += "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always