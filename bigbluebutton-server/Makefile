
PREFIX=/usr
DESTINATION=$(PREFIX)/lib/red5

all: red5

.PHONY: all install clean

red5:
	ant dist

install:
	mkdir -p $(DESTINATION)
	install dist/red5.jar $(DESTINATION)
	install -m 755 dist/red5.sh $(DESTINATION)
	cp -r dist/conf $(DESTINATION)
	cp -r dist/lib $(DESTINATION)
	cp -r dist/webapps $(DESTINATION)

installerdist:
	ant dist-installer

clean:
	rm -rf dist
