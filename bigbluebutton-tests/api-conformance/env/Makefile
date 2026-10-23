# The Tier 1 stack: make -C env <target>. See the README, "Tier 1".
SHELL := /bin/sh
TIER1 := $(CURDIR)/tier1
STATE := $(CURDIR)/.state
export DEBS_DIR ?= $(STATE)/debs
COMPOSE := docker compose -f $(CURDIR)/compose.yaml
# The LibreOffice image the packages convert with.
export LIBREOFFICE_IMAGE := $(shell sed -n 's/^FROM //p' $(CURDIR)/../../../bbb-libreoffice/docker/Dockerfile)
# The long-running services; up waits for them to be healthy.
SERVICES := redis postgres hasura akka-apps bbb-web middleware actions nginx tap

.PHONY: debs images render up down reset logs ps env

# Build the five debs the stack runs, from a snapshot of the tree.
# PKGS=bbb-web rebuilds just that one.
debs:
	$(TIER1)/build-debs.sh $(PKGS)

# Build the images from the debs.
images:
	$(COMPOSE) build

# Write the configuration and certificates the services mount.
render:
	$(TIER1)/render.sh

# Start the stack and wait until it answers, rebuilding what changed.
up: render
	$(COMPOSE) up -d --build --wait $(SERVICES)
	@echo "Tier 1 is up. For the runner: eval \"\$$(make -s -C $(CURDIR) env)\""

down:
	$(COMPOSE) down

# Start again from nothing: no meetings, an empty data directory.
reset: render
	$(COMPOSE) down --volumes
	$(COMPOSE) up -d --build --wait $(SERVICES)

logs:
	$(COMPOSE) logs --tail=200 $(SERVICE)

ps:
	$(COMPOSE) ps --all

# The variables the runner reads, for eval.
env:
	@cat $(STATE)/conform/conform.env
