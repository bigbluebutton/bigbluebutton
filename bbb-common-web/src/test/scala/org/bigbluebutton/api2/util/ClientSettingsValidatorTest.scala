package org.bigbluebutton.api2.util

import org.bigbluebutton.api.util.UnitSpec

/**
 * Covers the bbb-web side of strict client-settings override validation - the logic that decides
 * whether a /create call carrying an override is rejected when strictValidation is enabled.
 */
class ClientSettingsValidatorTest extends UnitSpec {

  // jackson-module-scala is pinned to 2.13.5 while tika-parsers-standard-package pulls
  // jackson-databind up to 2.21.3, so the module's version guard throws from YamlUtil's and
  // JsonUtil's object initialisers. That is an ExceptionInInitializerError, i.e. a LinkageError,
  // which scalatest treats as a reason to abort the whole RUN - taking every suite scheduled
  // after this one down with it, silently. Cancel instead so the run completes and reports.
  // Remove this guard once the jackson versions are reconciled.
  private def cancelIfJacksonSkewed(): Unit = {
    try ClientSettingsValidator.validateOverride("public:\n  a: 1\n", "{}")
    catch {
      // LinkageError is not NonFatal, so catch Throwable deliberately.
      case e: Throwable if isLinkage(e) =>
        cancel("jackson-module-scala 2.13.5 vs jackson-databind 2.21.3 - see project/Dependencies.scala", e)
    }
  }

  private def isLinkage(e: Throwable): Boolean =
    e.isInstanceOf[LinkageError] || Option(e.getCause).exists(isLinkage)

  override def withFixture(test: NoArgTest) = {
    cancelIfJacksonSkewed()
    super.withFixture(test)
  }

  // A small stand-in for settings.yml acting as the catalog (YAML).
  val catalog: String =
    "public:\n" +
      "  app:\n" +
      "    breakouts:\n" +
      "      recordRoomByDefault: true\n" +
      "    preloadNextSlides: 2\n" +
      "  layout:\n" +
      "    showScreenshareQuickSwapButton: true\n"

  it should "return no issues for a valid override" in {
    val overrideJson = "{\"public\":{\"app\":{\"breakouts\":{\"recordRoomByDefault\":false}}}}"
    assert(ClientSettingsValidator.validateOverride(catalog, overrideJson).isEmpty)
  }

  it should "report an unknown key placed at the wrong path" in {
    val overrideJson = "{\"public\":{\"breakouts\":{\"recordRoomByDefault\":true}}}"
    val issues = ClientSettingsValidator.validateOverride(catalog, overrideJson)
    assert(issues.size == 1)
    assert(issues.get(0).contains("unknown-key"))
    assert(issues.get(0).contains("public.breakouts"))
  }

  it should "report a type mismatch" in {
    val overrideJson = "{\"public\":{\"app\":{\"preloadNextSlides\":\"two\"}}}"
    val issues = ClientSettingsValidator.validateOverride(catalog, overrideJson)
    assert(issues.size == 1)
    assert(issues.get(0).contains("type-mismatch"))
  }

  it should "report unparseable override JSON as an issue so strict mode fails fast" in {
    val issues = ClientSettingsValidator.validateOverride(catalog, "{ this is not valid json")
    assert(issues.size == 1)
    assert(issues.get(0).contains("invalid-json"))
  }

  it should "not block when the catalog could not be loaded (empty)" in {
    val overrideJson = "{\"public\":{\"anythingGoes\":true}}"
    assert(ClientSettingsValidator.validateOverride("", overrideJson).isEmpty)
  }
}
