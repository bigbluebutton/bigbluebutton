import scala.collection.immutable.StringOps
import org.bigbluebutton.core.apps.Answer
import org.bigbluebutton.core.apps.Question

object TestWorksheet {
  println("Welcome to the Scala worksheet")


  val YesNoPollType = "YN"
  val TrueFalsePollType = "TF"
  val LetterPollType = "A-"
  val NumberPollType = "1-"
  
  val LetterArray = Array("A", "B", "C", "D", "E", "F")
  val NumberArray = Array("1", "2", "3", "4", "5", "6")

  def processYesNoPollType(qType: String):Question = {
    val answers = new Array[Answer](2)
    answers(0) = new Answer(0, "N", Some("No"))
    answers(1) = new Answer(1, "Y", Some("Yes"))
    
    new Question(0, YesNoPollType, false, None, answers)
  }
  
  def processTrueFalsePollType(qType: String):Question = {
    val answers = new Array[Answer](2)
    
    answers(0) = new Answer(0, "F", Some("False"))
    answers(1) = new Answer(1, "T", Some("True"))
    
    new Question(0, TrueFalsePollType, false, None, answers)
  }
  
    
  def processLetterPollType(qType: String, multiResponse: Boolean):Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt
    
    var questionOption: Option[Question] = None
    
    if (numQs > 0 && numQs <= 7) {
      val answers = new Array[Answer](numQs)
      var i = 0
      for ( i <- 0 until numQs ) {
        answers(i) = new Answer(i, LetterArray(i), Some(LetterArray(i)))
        val question = new Question(0, LetterPollType, multiResponse, None, answers)
        questionOption = Some(question)
      }
    }
    
    questionOption
  }

  def processNumberPollType(qType: String, multiResponse: Boolean):Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt
    
    var questionOption: Option[Question] = None
       
    if (numQs > 0 && numQs <= 7) {
      val answers = new Array[Answer](numQs)
      var i = 0
      for ( i <- 0 until numQs ) {
        answers(i) = new Answer(i, NumberArray(i), Some(NumberArray(i)))
        val question = new Question(0, NumberPollType, multiResponse, None, answers)
        questionOption = Some(question)
      }
    }
    questionOption
  }

  def createQuestion(qType: String):Option[Question] = {
    val qt = qType.toUpperCase()
    var questionOption: Option[Question] = None
    if (qt.matches(YesNoPollType)) {
      questionOption = Some(processYesNoPollType(qt))
    } else if (qt.matches(TrueFalsePollType)) {
      questionOption = Some(processTrueFalsePollType(qt))
    } else if (qt.startsWith(LetterPollType)) {
      questionOption = processLetterPollType(qt, false)
    } else if (qt.startsWith(NumberPollType)) {
      processNumberPollType(qt, false)
    } else {
      questionOption = None
    }
    
    questionOption
  }

  def determineQType3(qType: String) {
    val qt = qType.toUpperCase()
    
    if (qt.matches(YesNoPollType)) {
      println("YN")
    } else if (qt.matches("TF")) {
      println(TrueFalsePollType)
    } else if (qt.startsWith(LetterPollType)) {
      println("A5")
      processLetterPollType(qt, false)
    } else if (qt.startsWith(NumberPollType)) {
      println("1")
      processNumberPollType(qt, false)
    } else {
      println("No Match for [" + qType + "]")
    }
  }
  
  determineQType3("YN")
  determineQType3("YF")
  determineQType3("TF")
  determineQType3("A-5")
  determineQType3("1-5")

  val list = new java.util.ArrayList[String]()
  list.add("Red")
  list.add("Green")
  list.add("Blue")
  

}