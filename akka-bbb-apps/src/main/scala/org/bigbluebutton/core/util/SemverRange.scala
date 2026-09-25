package org.bigbluebutton.core.util

import com.github.zafarkhaja.semver.Version

/**
 * Evaluates npm-style semver ranges. java-semver's own expression parser
 * rejects pre-release identifiers (e.g. `^1.0.0-beta.2`), so it is only used
 * here to parse and compare versions.
 */
object SemverRange {

  private val PartialVersionPattern =
    """^v?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$""".r
  private val ComparatorPattern = """^(>=|<=|>|<|=|\^|~>|~)?(.+)$""".r
  private val HyphenRangePattern = """^(\S+)\s+-\s+(\S+)$""".r
  private val SpaceAfterOperatorPattern = """(>=|<=|>|<|=|\^|~>|~)\s+""".r

  private case class Comparator(operator: String, version: Version) {
    def matches(v: Version): Boolean = operator match {
      case ">=" => v.isHigherThanOrEquivalentTo(version)
      case "<=" => v.isLowerThanOrEquivalentTo(version)
      case ">"  => v.isHigherThan(version)
      case "<"  => v.isLowerThan(version)
      case "="  => v.isEquivalentTo(version)
    }
  }

  private case class PartialVersion(major: Option[Long], minor: Option[Long], patch: Option[Long], preRelease: Option[String]) {
    def isWildcard: Boolean = major.isEmpty
    def isComplete: Boolean = patch.isDefined

    def lowerBound: Version = {
      val base = Version.of(major.getOrElse(0L), minor.getOrElse(0L), patch.getOrElse(0L))
      preRelease.fold(base)(pre => Version.of(base.majorVersion(), base.minorVersion(), base.patchVersion(), pre))
    }

    def nextAfterMissingPart: Version = (major, minor) match {
      case (Some(ma), None)     => Version.of(ma + 1, 0, 0)
      case (Some(ma), Some(mi)) => Version.of(ma, mi + 1, 0)
      case _                    => throw new IllegalStateException("Wildcard versions have no upper bound")
    }
  }

  private val MatchNothing = List(Comparator("<", Version.of(0, 0, 0)))

  def satisfies(version: String, range: String): Boolean = {
    val v = Version.parse(version)
    range.split("""\|\|?""").exists(comparatorSet => satisfiesComparatorSet(v, parseComparatorSet(comparatorSet)))
  }

  private def satisfiesComparatorSet(v: Version, comparators: List[Comparator]): Boolean =
    comparators.forall(_.matches(v))

  private def parseComparatorSet(comparatorSet: String): List[Comparator] = comparatorSet.trim match {
    case HyphenRangePattern(from, to) => hyphenRange(parsePartialVersion(from), parsePartialVersion(to))
    case trimmed =>
      SpaceAfterOperatorPattern.replaceAllIn(trimmed, "$1")
        .split("""[\s&]+""").filter(_.nonEmpty).toList
        .flatMap(parseComparator)
  }

  private def parseComparator(token: String): List[Comparator] = token match {
    case ComparatorPattern(operator, rawVersion) =>
      val p = parsePartialVersion(rawVersion)
      Option(operator).getOrElse("=") match {
        case "="        => if (p.isWildcard) Nil else if (p.isComplete) List(Comparator("=", p.lowerBound)) else partialRange(p)
        case ">="       => if (p.isWildcard) Nil else List(Comparator(">=", p.lowerBound))
        case ">"        => if (p.isWildcard) MatchNothing else if (p.isComplete) List(Comparator(">", p.lowerBound)) else List(Comparator(">=", p.nextAfterMissingPart))
        case "<"        => if (p.isWildcard) MatchNothing else List(Comparator("<", p.lowerBound))
        case "<="       => if (p.isWildcard) Nil else if (p.isComplete) List(Comparator("<=", p.lowerBound)) else List(Comparator("<", p.nextAfterMissingPart))
        case "~" | "~>" => if (p.isWildcard) Nil else List(Comparator(">=", p.lowerBound), Comparator("<", tildeUpperBound(p)))
        case "^"        => if (p.isWildcard) Nil else List(Comparator(">=", p.lowerBound), Comparator("<", caretUpperBound(p)))
      }
    case _ => throw new IllegalArgumentException(s"Invalid comparator [$token]")
  }

  private def parsePartialVersion(raw: String): PartialVersion = raw match {
    case PartialVersionPattern(major, minor, patch, preRelease) =>
      def number(part: String): Option[Long] = Option(part).filterNot(Set("x", "X", "*")).map(_.toLong)
      val ma = number(major)
      val mi = ma.flatMap(_ => number(minor))
      val pa = mi.flatMap(_ => number(patch))
      PartialVersion(ma, mi, pa, pa.flatMap(_ => Option(preRelease)))
    case _ => throw new IllegalArgumentException(s"Invalid version [$raw]")
  }

  private def partialRange(p: PartialVersion): List[Comparator] =
    List(Comparator(">=", p.lowerBound), Comparator("<", p.nextAfterMissingPart))

  private def hyphenRange(from: PartialVersion, to: PartialVersion): List[Comparator] = {
    val lower = if (from.isWildcard) Nil else List(Comparator(">=", from.lowerBound))
    val upper =
      if (to.isWildcard) Nil
      else if (to.isComplete) List(Comparator("<=", to.lowerBound))
      else List(Comparator("<", to.nextAfterMissingPart))
    lower ++ upper
  }

  private def tildeUpperBound(p: PartialVersion): Version = p.minor match {
    case Some(mi) => Version.of(p.major.get, mi + 1, 0)
    case None     => Version.of(p.major.get + 1, 0, 0)
  }

  private def caretUpperBound(p: PartialVersion): Version = (p.major.get, p.minor, p.patch) match {
    case (ma, _, _) if ma > 0       => Version.of(ma + 1, 0, 0)
    case (_, None, _)               => Version.of(1, 0, 0)
    case (_, Some(mi), _) if mi > 0 => Version.of(0, mi + 1, 0)
    case (_, Some(_), None)         => Version.of(0, 1, 0)
    case (_, _, Some(pa))           => Version.of(0, 0, pa + 1)
  }
}
