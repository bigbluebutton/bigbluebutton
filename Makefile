
# Makefile to build a Debian repository in a directory named
# $(DISTRO)-$(COMMIT), where $(DISTRO) is either focal or bionic and
# $(COMMIT) is the first six characters of the current git commit.
#
# All package builds are done using docker.  This Makefile expects the
# build scripts to leave the .deb packages in the "artifacts"
# directory.
#
# The repository is signed with the current user's GPG key.
#
# Requirements: docker and reprepro
#
# sudo access is required to run docker

# These are the list of packages that we'll build, pulled from the CI configuration
TARGETS := $(shell grep build/setup .github/workflows/automated-tests.yml  | sed 's|^.*./build/setup.sh ||')

# The current commit's hash (used for the name of the repository) and date (used for the package names)
COMMIT := $(shell git rev-parse HEAD | cut -c 1-6)
COMMIT_DATE := $(shell git log -n1 --pretty='format:%cd' --date=format:'%Y%m%dT%H%M%S')

# The BigBlueButton release, only used to determine the Ubuntu distribution
RELEASE := $(shell cut -d = -f 2 bigbluebutton-config/bigbluebutton-release | sed 's/-/~/')

# Ubuntu distribution, currently bionic for BigBlueButton 2.4 and focal for BigBlueButton 2.5 and 2.6
DISTRO := $(shell if echo $(RELEASE) | grep -q 2\\.4; then echo bionic; else echo focal; fi)

# Package repository codename
CODENAME := bigbluebutton-$(DISTRO)

# The directory in which we'll build the Debian package repository
REPOSITORY := $(DISTRO)-$(COMMIT)

$(REPOSITORY)::

# PACKAGE_$(pkg) contains the package filename with wildcards NOT expanded
#
# The point is to trigger a build when the file doesn't exist, even
# though all we know is its wildcard pattern

define makerule =
  PACKAGE_$1 = artifacts/$1_*$(COMMIT_DATE)*.deb
  $$(PACKAGE_$1):
	./build/setup.sh $1
endef

$(foreach pkg,${TARGETS},$(eval $(call makerule,$(pkg))))

# PACKAGES is the list of package with wildcards NOT expanded

PACKAGES=$(foreach pkg,${TARGETS},$(PACKAGE_$(pkg)))

$(REPOSITORY)/conf/distributions:
	mkdir -p $(REPOSITORY)/conf/
	echo Codename: $(CODENAME)  > $(REPOSITORY)/conf/distributions
	echo Architectures: amd64  >> $(REPOSITORY)/conf/distributions
	echo Components: main      >> $(REPOSITORY)/conf/distributions
	echo SignWith: yes         >> $(REPOSITORY)/conf/distributions

$(REPOSITORY):: $(REPOSITORY)/conf/distributions

$(REPOSITORY):: $(PACKAGES)
	@if ! which reprepro >/dev/null; then echo apt install reprepro is required; exit 1; fi
	reprepro -b $(REPOSITORY) includedeb $(CODENAME) $(PACKAGES)

# double-colon rules always get run, even if the target already exists
# wget --timestamping only downloads the file if it's newer

EXTRA_PACKAGES_TAR := cache-3rd-part-packages.tar

$(EXTRA_PACKAGES_TAR)::
	wget --timestamping http://ci.bbbvm.imdt.com.br/cache-3rd-part-packages.tar

# The cleanest way to include the 3rd-part-packages would be to extract the tar file
# to a temporary directory, then call "reprepro includedeb" on all of the package
# files therein.  I've found that I can extract the tar file directly into the
# repository directory and call "reprepro includedeb" on the packages there.

$(REPOSITORY):: $(EXTRA_PACKAGES_TAR)
	@if ! which reprepro >/dev/null; then echo apt install reprepro is required; exit 1; fi
	mkdir -p $(REPOSITORY)/pool/main
	tar -f $(EXTRA_PACKAGES_TAR) -C $(REPOSITORY)/pool/main -x
	reprepro -b $(REPOSITORY) includedeb $(CODENAME) $(shell tar -f $(EXTRA_PACKAGES_TAR) -t --wildcards '*.deb' | sed s:^:$(REPOSITORY)/pool/main/:)
