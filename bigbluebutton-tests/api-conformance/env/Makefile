# The Tier 1 stack: make -C env <target>. See the README, "Tier 1".
SHELL := /bin/sh
TIER1 := $(CURDIR)/tier1
STATE := $(CURDIR)/.state
export DEBS_DIR ?= $(STATE)/debs
COMPOSE := docker compose -f $(CURDIR)/compose.yaml
# The LibreOffice image the packages convert with.
export LIBREOFFICE_IMAGE := $(shell sed -n 's/^FROM //p' $(CURDIR)/../../../bbb-libreoffice/docker/Dockerfile)
# The long-running services; up waits for them to be healthy. CLAMAV=1 adds
# the ClamAV daemon.
SERVICES := redis postgres hasura akka-apps bbb-web middleware actions nginx tap sink
ifeq ($(CLAMAV),1)
COMPOSE += --profile clamav
SERVICES += clamav
endif

# COVERAGE=1 starts bbb-web with JaCoCo's agent (up, reset), which adds what
# it runs to the coverage data at every stop; make coverage writes the report.
# A later up without it recreates bbb-web without the agent.
ifeq ($(COVERAGE),1)
export JAVA_TOOL_OPTIONS := -javaagent:/opt/jacoco/jacocoagent.jar=destfile=/var/bigbluebutton/coverage/bbb-web.exec,append=true,includes=org.bigbluebutton.*
endif
# Where make coverage writes the report.
COVERAGE_OUT ?= $(abspath $(CURDIR)/../out/coverage)

.PHONY: debs images render up down reset logs ps env profile check-copies coverage coverage-clean

# Build the five debs the stack runs, from a snapshot of the tree.
# PKGS=bbb-web rebuilds just that one.
debs:
	$(TIER1)/build-debs.sh $(PKGS)

# Build the images from the debs.
images:
	$(COMPOSE) build

# Write the configuration and certificates the services mount, under the
# profile switcher's lock.
render:
	mkdir -p $(STATE) && flock $(STATE)/profile.lock $(TIER1)/render.sh

# Start the stack and wait until it answers, rebuilding what changed.
up: render
	$(COMPOSE) up -d --build --wait --wait-timeout 900 $(SERVICES)
	@echo "Tier 1 is up. For the runner: eval \"\$$(make -s -C $(CURDIR) env)\""

# Every service, the optional ones included.
down:
	$(COMPOSE) --profile clamav down

# Start again from nothing: no meetings, an empty data directory, no
# profile in force.
# A profile switch waits for the whole reset: it holds the switcher's lock.
reset:
	mkdir -p $(STATE) && flock $(STATE)/profile.lock sh -c '\
		rm -f $(STATE)/profile $(STATE)/akka-restart-pending && $(TIER1)/render.sh && \
		$(COMPOSE) --profile clamav down --volumes && \
		$(COMPOSE) up -d --build --wait --wait-timeout 900 $(SERVICES)'


# The services' last lines (TAIL=200, or TAIL=all), or just SERVICE's;
# like ps, ClamAV's too when it runs.
TAIL := 200
logs:
	$(COMPOSE) --profile clamav logs --tail=$(TAIL) $(SERVICE)

ps:
	$(COMPOSE) --profile clamav ps --all

# Switch bbb-web to a profile in bbb-web/profiles/ (or default), or print
# the one in force: make profile NAME=reveal-version, make profile.
profile:
	@$(TIER1)/profile.sh $(or $(NAME),status)

# Warn about the package files the stack mirrors by hand that changed
# since it last followed them.
check-copies:
	@$(TIER1)/check-copies.sh

# Write bbb-web's coverage report (XML, CSV, HTML) to COVERAGE_OUT: stop
# bbb-web so the agent writes what it has, report on the classes that ran,
# and start bbb-web again. Under the profile switcher's lock.
coverage:
	mkdir -p $(STATE) && flock $(STATE)/profile.lock $(TIER1)/coverage.sh report $(COVERAGE_OUT)

# Forget the coverage data, to measure from here on.
coverage-clean:
	mkdir -p $(STATE) && flock $(STATE)/profile.lock $(TIER1)/coverage.sh clean

# The variables the runner reads, for eval. BBB_CLAMAV, which gives the
# target the clamav capability, only while the ClamAV daemon runs: it is
# unset otherwise, in case an earlier eval set it.
env:
	@cat $(STATE)/conform/conform.env
	@if docker compose -f $(CURDIR)/compose.yaml --profile clamav ps -q --status running clamav 2>/dev/null | grep -q .; then \
		echo 'export BBB_CLAMAV=1'; \
	else \
		echo 'unset BBB_CLAMAV'; \
	fi
