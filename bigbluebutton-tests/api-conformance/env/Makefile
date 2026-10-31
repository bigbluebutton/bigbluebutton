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

.PHONY: debs images render up down reset logs ps env profile

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
	$(COMPOSE) up -d --build --wait $(SERVICES)
	@echo "Tier 1 is up. For the runner: eval \"\$$(make -s -C $(CURDIR) env)\""

# Every service, the optional ones included.
down:
	$(COMPOSE) --profile clamav down

# Start again from nothing: no meetings, an empty data directory, no
# profile in force.
reset:
	mkdir -p $(STATE) && flock $(STATE)/profile.lock sh -c 'rm -f $(STATE)/profile && $(TIER1)/render.sh'
	$(COMPOSE) --profile clamav down --volumes
	$(COMPOSE) up -d --build --wait $(SERVICES)

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

# The variables the runner reads, for eval.
env:
	@cat $(STATE)/conform/conform.env
