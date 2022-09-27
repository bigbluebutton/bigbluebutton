
# Makefile to build a Debian repository in a directory named $(COMMIT),
# which is the first six characters of our current git commit.

# These are the list of packages that we'll build

TARGETS := $(shell grep build/setup .github/workflows/automated-tests.yml  | sed 's|^.*./build/setup.sh ||')

COMMIT := $(shell git rev-parse HEAD | cut -c 1-6)
COMMIT_DATE := $(shell git log -n1 --pretty='format:%cd' --date=format:'%Y%m%dT%H%M%S')

RELEASE := $(shell cut -d = -f 2 bigbluebutton-config/bigbluebutton-release | sed 's/-/~/')

$(COMMIT):

define makerule =
  EPOCH_$1 = $(shell if echo $1 | grep -q -e bbb-apps-akka -e bbb-fsesl-akka; then echo 2\\:; fi)
  ARCH_$1 = $(shell if echo $1 | grep -q -e bbb-apps-akka -e bbb-fsesl-akka; then echo all; else echo amd64; fi)
  PACKAGE_$1 = $1_$$(EPOCH_$1)$(RELEASE)+$(COMMIT_DATE)-git._$$(ARCH_$1).deb
  packages: artifacts/$$(PACKAGE_$1)
  artifacts/$$(PACKAGE_$1):
	./build/setup.sh $1
endef

$(foreach _,${TARGETS},$(eval $(call makerule,$_)))

PACKAGES=$(foreach pkg,${TARGETS},artifacts/$(PACKAGE_$(pkg)))
DOTDOT_ARTIFACTS_PACKAGES=$(foreach pkg,${TARGETS},../artifacts/$(PACKAGE_$(pkg)))


$(COMMIT)/conf/distributions:
	mkdir -p $(COMMIT)/conf/
	sed 's/bigbluebutton-bionic/bigbluebutton-focal/' distributions > $(COMMIT)/conf/distributions

$(COMMIT): $(COMMIT)/conf/distributions packages cache-3rd-part-packages
	cd $(COMMIT); reprepro includedeb bigbluebutton-focal $(shell find cache-3rd-part-packages -name '*.deb' -exec echo ../{} \;)
	cd $(COMMIT); reprepro includedeb bigbluebutton-focal $(DOTDOT_ARTIFACTS_PACKAGES)

cache-3rd-part-packages: cache-3rd-part-packages.tar
	mkdir cache-3rd-part-packages
	cd cache-3rd-part-packages; tar xf ../cache-3rd-part-packages.tar

cache-3rd-part-packages.tar:
	wget http://ci.bbbvm.imdt.com.br/cache-3rd-part-packages.tar
