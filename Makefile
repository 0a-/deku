#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}
BIN := ./node_modules/.bin

#
# Wildcards.
#

src = $(shell find lib/*.js)
tests = $(shell find test/**/*.js)

#
# Targets.
#

$(src): node_modules
$(tests): node_modules

standalone: $(src)
	@mkdir -p build
	@browserify \
		--standalone deku \
		-t [ envify --NODE_ENV production ] \
		-e lib/index.js | bfc > build/deku.js

build: $(tests) $(src)
	@browserify \
		--debug \
		-e test/index.js \
		-t [ envify --NODE_ENV development ] \
		-t [ babelify --optional es7.asyncFunctions --sourceMapRelative . ] > build.js

test: lint build
	@duo-test browser --commands 'make build'

test-cloud: build
	@TRAVIS_BUILD_NUMBER=$(CIRCLE_BUILD_NUM) zuul -- build.js

node_modules: package.json
	@npm install

clean:
	@-rm -rf build build.js node_modules

lint: $(src)
	standard lib/**/*.js

size: standalone
	@minify build/deku.js | gzip -9 | wc -c

#
# Releases.
#

release: standalone
	bump $$VERSION && \
	git changelog --tag $$VERSION && \
	git commit --all -m "Release $$VERSION" && \
	git tag $$VERSION && \
	git push origin master --tags && \
	npm publish

#
# These tasks will be run every time regardless of dependencies.
#

.PHONY: standalone
.PHONY: clean
.PHONY: lint
.PHONY: size
.PHONY: release
