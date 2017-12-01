# Changelog

## v1.0.0 - December 1, 2017

* (runtime) Compiles to ES2017 (native async/await and modules) bumping required vscode version to `1.1.8`
* (partial) Find workspace/vscode typescript install location - soft rollout (just reads setting for now)
* (code) Simplified string escaping logic
* (performance) No longer attempt parsing non-TS files when run from command pallette
* (docs) Easier to understand readme and purpose of extension
* (docs) New logo!
* (license) 100% MIT codebase (thanks to custom logo)

## v0.0.2 - November 28, 2017

* (bug) Fixes for extension when not running under the extension host
* (bug) Minor fix to register extension command regularly due to not using the provided edit
* (bug) Corrected vsix packaging of files

## v0.0.1 - November 28, 2017

* Inception