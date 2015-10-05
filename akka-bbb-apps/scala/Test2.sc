import scala.collection.immutable.StringOps

object Test2 {
  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet
  
  val userId = new StringOps("abc_12")            //> userId  : scala.collection.immutable.StringOps = abc_12
  val s2 = userId.split('_')                      //> s2  : Array[String] = Array(abc, 12)
  val s1 = if (s2.length == 2) s2(0) else userId  //> s1  : Comparable[String] = abc
}