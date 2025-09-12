package org.bigbluebutton.core2.testdata

import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.RandomStringGenerator

import scala.util.Random

/**
 * Create fake names.
 */
object FakeUserGenerator {
  private val random = new Random

  // From Fake Name Generator (http://homepage.net/name_generator/)
  private val firstNames = Seq("Abigail", "Alexandra", "Alison", "Amanda", "Amelia", "Amy", "Andrea", "Angela", "Anna", "Anne",
    "Audrey", "Ava", "Bella", "Bernadette", "Carol", "Caroline", "Carolyn", "Chloe", "Claire", "Deirdre", "Diana",
    "Diane", "Donna", "Dorothy", "Elizabeth", "Ella", "Emily", "Emma", "Faith", "Felicity", "Fiona", "Gabrielle",
    "Grace", "Hannah", "Heather", "Irene", "Jan", "Jane", "Jasmine", "Jennifer", "Jessica", "Joan", "Joanne", "Julia",
    "Karen", "Katherine", "Kimberly", "Kylie", "Lauren", "Leah", "Lillian", "Lily", "Lisa", "Madeleine", "Maria",
    "Mary", "Megan", "Melanie", "Michelle", "Molly", "Natalie", "Nicola", "Olivia", "Penelope", "Pippa", "Rachel",
    "Rebecca", "Rose", "Ruth", "Sally", "Samantha", "Sarah", "Sonia", "Sophie", "Stephanie", "Sue", "Theresa",
    "Tracey", "Una", "Vanessa", "Victoria", "Virginia", "Wanda", "Wendy", "Yvonne", "Zoe", "Adam", "Adrian",
    "Alan", "Alexander", "Andrew", "Anthony", "Austin", "Benjamin", "Blake", "Boris", "Brandon", "Brian",
    "Cameron", "Carl", "Charles", "Christian", "Christopher", "Colin", "Connor", "Dan", "David", "Dominic",
    "Dylan", "Edward", "Eric", "Evan", "Frank", "Gavin", "Gordon", "Harry", "Ian", "Isaac", "Jack", "Jacob",
    "Jake", "James", "Jason", "Joe", "John", "Jonathan", "Joseph", "Joshua", "Julian", "Justin", "Keith", "Kevin",
    "Leonard", "Liam", "Lucas", "Luke", "Matt", "Max", "Michael", "Nathan", "Neil", "Nicholas", "Oliver", "Owen",
    "Paul", "Peter", "Phil", "Piers", "Richard", "Robert", "Ryan", "Sam", "Sean", "Sebastian", "Simon", "Stephen",
    "Steven", "Stewart", "Thomas", "Tim", "Trevor", "Victor", "Warren", "William")

  private val lastNames = Seq("Abraham", "Allan", "Alsop", "Anderson", "Arnold", "Avery", "Bailey", "Baker", "Ball", "Bell",
    "Berry", "Black", "Blake", "Bond", "Bower", "Brown", "Buckland", "Burgess", "Butler", "Cameron", "Campbell",
    "Carr", "Chapman", "Churchill", "Clark", "Clarkson", "Coleman", "Cornish", "Davidson", "Davies", "Dickens",
    "Dowd", "Duncan", "Dyer", "Edmunds", "Ellison", "Ferguson", "Fisher", "Forsyth", "Fraser", "Gibson", "Gill",
    "Glover", "Graham", "Grant", "Gray", "Greene", "Hamilton", "Hardacre", "Harris", "Hart", "Hemmings", "Henderson",
    "Hill", "Hodges", "Howard", "Hudson", "Hughes", "Hunter", "Ince", "Jackson", "James", "Johnston", "Jones",
    "Kelly", "Kerr", "King", "Knox", "Lambert", "Langdon", "Lawrence", "Lee", "Lewis", "Lyman", "MacDonald",
    "Mackay", "Mackenzie", "MacLeod", "Manning", "Marshall", "Martin", "Mathis", "May", "McDonald", "McLean",
    "McGrath", "Metcalfe", "Miller", "Mills", "Mitchell", "Morgan", "Morrison", "Murray", "Nash", "Newman",
    "Nolan", "North", "Ogden", "Oliver", "Paige", "Parr", "Parsons", "Paterson", "Payne", "Peake", "Peters",
    "Piper", "Poole", "Powell", "Pullman", "Quinn", "Rampling", "Randall", "Rees", "Reid", "Roberts", "Robertson",
    "Ross", "Russell", "Rutherford", "Sanderson", "Scott", "Sharp", "Short", "Simpson", "Skinner", "Slater", "Smith",
    "Springer", "Stewart", "Sutherland", "Taylor", "Terry", "Thomson", "Tucker", "Turner", "Underwood", "Vance",
    "Vaughan", "Walker", "Wallace", "Walsh", "Watson", "Welch", "White", "Wilkins", "Wilson", "Wright", "Young")

  private def getRandomElement(list: Seq[String], random: Random): String = list(random.nextInt(list.length))

  def createFakeRegisteredUser(users: RegisteredUsers, role: String, bot: Boolean, guest: Boolean, authed: Boolean, meetingId: String): RegisteredUser = {
    val name = getRandomElement(firstNames, random) + " " + getRandomElement(lastNames, random)
    val id = "w_" + RandomStringGenerator.randomAlphanumericString(16)
    val extId = RandomStringGenerator.randomAlphanumericString(16)
    val authToken = RandomStringGenerator.randomAlphanumericString(16)
    val sessionToken = RandomStringGenerator.randomAlphanumericString(16)
    val avatarURL = "https://www." + RandomStringGenerator.randomAlphanumericString(32) + ".com/" +
      RandomStringGenerator.randomAlphanumericString(10) + ".png"
    val webcamBackgroundURL = "https://www." + RandomStringGenerator.randomAlphanumericString(32) + ".com/" +
      RandomStringGenerator.randomAlphanumericString(10) + ".jpg"
    val color = "#ff6242"
    val logoutUrlFormats = Seq(
      s"https://www.${RandomStringGenerator.randomAlphanumericString(32)}.com/logout?user=${RandomStringGenerator.randomAlphanumericString(8)}#section",
      s"http://localhost:8080/logout/${RandomStringGenerator.randomAlphanumericString(8)}",
      s"https://example.com/logout?redirect=${java.net.URLEncoder.encode("https://another-site.com", "UTF-8")}"
    )
    val logoutUrl = logoutUrlFormats(random.nextInt(logoutUrlFormats.length))

    val ru = RegisteredUsers.create(meetingId, userId = id, extId, name, "", "", role,
      authToken, Vector(sessionToken), avatarURL, webcamBackgroundURL, color, bot,
      guest, authed, guestStatus = GuestStatus.ALLOW, false, "", logoutUrl, Map(), false)
    RegisteredUsers.add(users, ru, meetingId)
    ru
  }

  def createFakeVoiceUser(user: RegisteredUser, callingWith: String, muted: Boolean, listenOnlyInputDevice: Boolean, deafened: Boolean, talking: Boolean,
                          listenOnly: Boolean, floor: Boolean = false): VoiceUserState = {
    val voiceUserId = RandomStringGenerator.randomAlphanumericString(8)
    val lastFloorTime = System.currentTimeMillis().toString();
    VoiceUserState(
      intId = user.id,
      voiceUserId = voiceUserId,
      meetingId = user.meetingId,
      callingWith,
      callerName = user.name,
      callerNum = user.name,
      "#ff6242",
      muted,
      listenOnlyInputDevice,
      deafened,
      talking,
      listenOnly,
      "freeswitch",
      System.currentTimeMillis(),
      floor,
      lastFloorTime,
      false,
      "9b3f4504-275d-4315-9922-21174262d88c"
    )
  }

  def createFakeVoiceOnlyUser(meetingId: String, callingWith: String, muted: Boolean, listenOnlyInputDevice: Boolean, deafened: Boolean, talking: Boolean,
                              listenOnly: Boolean, floor: Boolean = false): VoiceUserState = {
    val voiceUserId = RandomStringGenerator.randomAlphanumericString(8)
    val intId = "v_" + RandomStringGenerator.randomAlphanumericString(16)
    val name = getRandomElement(firstNames, random) + " " + getRandomElement(lastNames, random)
    val lastFloorTime = System.currentTimeMillis().toString();
    VoiceUserState(
      intId,
      voiceUserId = voiceUserId,
      meetingId = "",
      callingWith,
      callerName = name,
      callerNum = name,
      "#ff6242",
      muted,
      listenOnlyInputDevice,
      deafened,
      talking,
      listenOnly,
      "freeswitch",
      System.currentTimeMillis(),
      floor,
      lastFloorTime,
      hold = false,
      "9b3f4504-275d-4315-9922-21174262d88c"
    )
  }

  def createFakeWebcamStreamFor(userId: String, subscribers: Set[String]): WebcamStream = {
    val streamId = RandomStringGenerator.randomAlphanumericString(10)
    WebcamStream(streamId, userId, "camera", hasAudio = false, showAsContent = false, subscribers)
  }

}
