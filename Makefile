default:
	PATH="/usr/local/opt/node@10/bin:$(PATH)" $(MAKE) build

.PHONY: build
build:
	yarn
	yarn run gulp compile vscode-darwin-min
