import scala.collection.immutable.StringOps
import java.net.URLEncoder
import scala.collection._

object Test2 {
  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet
   
  val userId = new StringOps("abc_12")            //> userId  : scala.collection.immutable.StringOps = abc_12
  val s2 = userId.split('_')                      //> s2  : Array[String] = Array(abc, 12)
  val s1 = if (s2.length == 2) s2(0) else userId  //> s1  : Comparable[String] = abc

  def sortParam(params: mutable.Map[String, String]):SortedSet[String] = {
    collection.immutable.SortedSet[String]() ++ params.keySet
  }                                               //> sortParam: (params: scala.collection.mutable.Map[String,String])scala.collec
                                                  //| tion.SortedSet[String]
  
  def createBaseString(params: mutable.Map[String, String]): String = {
    val csbuf = new StringBuffer()
    var keys = sortParam(params)

    var first = true;
    for (key <- keys) {
      for (value <- params.get(key)) {
        if (first) {
          first = false;
        } else {
          csbuf.append("&");
        }

        csbuf.append(key);
        csbuf.append("=");
        csbuf.append(value);
      }
    }

    return csbuf.toString();
  }                                               //> createBaseString: (params: scala.collection.mutable.Map[String,String])Strin
                                                  //| g
    
  def urlEncode(s: String): String = {
    URLEncoder.encode(s, "UTF-8");
  }                                               //> urlEncode: (s: String)String
  
  val baseString = "fullName=User+4621018&isBreakout=true&meetingID=random-1853792&password=mp&redirect=true"
                                                  //> baseString  : String = fullName=User+4621018&isBreakout=true&meetingID=rand
                                                  //| om-1853792&password=mp&redirect=true
  
  val params = new collection.mutable.HashMap[String, String]
                                                  //> params  : scala.collection.mutable.HashMap[String,String] = Map()
  params += "fullName" -> urlEncode("User 4621018")
                                                  //> res0: Test2.params.type = Map(fullName -> User+4621018)
  params += "isBreakout" -> urlEncode("true")     //> res1: Test2.params.type = Map(fullName -> User+4621018, isBreakout -> true)
                                                  //| 
  params += "meetingID" -> urlEncode("random-1853792")
                                                  //> res2: Test2.params.type = Map(fullName -> User+4621018, isBreakout -> true,
                                                  //|  meetingID -> random-1853792)
  params += "password" -> urlEncode("mp")         //> res3: Test2.params.type = Map(fullName -> User+4621018, isBreakout -> true,
                                                  //|  meetingID -> random-1853792, password -> mp)
  params += "redirect" -> urlEncode("true")       //> res4: Test2.params.type = Map(fullName -> User+4621018, isBreakout -> true,
                                                  //|  meetingID -> random-1853792, redirect -> true, password -> mp)
  val keys = sortParam(params)                    //> keys  : scala.collection.SortedSet[String] = TreeSet(fullName, isBreakout, 
                                                  //| meetingID, password, redirect)

  val result = createBaseString(params)           //> result  : String = fullName=User+4621018&isBreakout=true&meetingID=random-1
                                                  //| 853792&password=mp&redirect=true

  val between = Set("xab", "bc")
  val u2 = Set("bc", "xab")
  val u3 = u2 + "zxc"
  val foo = between subsetOf(u2)

  val id = between.toSeq.sorted.mkString("-")




}