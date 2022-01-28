module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "ignorePatterns": [
        "bin/",
        ".cache-loader/",
        ".vscode/",
        "./node_modules/"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "eslint-plugin-jsdoc",
        "eslint-plugin-no-null",
        "eslint-plugin-import",
        "eslint-plugin-prefer-arrow",
        "@typescript-eslint",
        "@typescript-eslint/tslint",
        "@typescript-eslint/eslint-plugin-tslint"
    ],
    "rules": {
        "indent": "off",
        "@typescript-eslint/dot-notation": "error",

        "@typescript-eslint/indent": [
            "off",
            4,
            [
                // { "SwitchCase": 1 },

                {
                    "FunctionDeclaration": {
                        "body": 4,
                        "parameters": 8
                    }
                }
            ]
        ],
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "comma",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "default",
                "format": [ "PascalCase", "camelCase" ],
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid"
            },
            {
                selector: "variable",
                format: [ "camelCase" ],
                leadingUnderscore: "forbid",
                trailingUnderscore: "forbid",
            },
            {
                selector: "typeLike",
                format: ["PascalCase"],
                leadingUnderscore: "forbid",
                trailingUnderscore: "forbid"
            }
        ],
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-use-before-define": "error",
        "quotes": "off",
        "@typescript-eslint/quotes": [
            "error",
            "double",
            {
                "allowTemplateLiterals": true
            }
        ],
        "@typescript-eslint/semi": [
            "error"
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "brace-style": [
            "error",
            "1tbs"
        ],
        "capitalized-comments": [
            "error",
            "never",
            {
                "ignorePattern": "TODO|TODO:|HACK|HACK:"
            }
        ],
        "curly": "error",
        "eol-last": "off",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": "off",
        "id-match": "off",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "error",
        "jsdoc/newline-after-description": "error",
        "max-len": [
            "error",
            {
                "code": 180
            }
        ],
        "no-bitwise": "error",
        "no-caller": "error",
        "no-console": [
            "error"
        ],
        "no-debugger": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "no-trailing-spaces": "error",
        "no-underscore-dangle": "off",
        "no-unreachable": "error",
        "no-invalid-this": "error",
        "no-unused-labels": "error",
        "radix": "error",
        "spaced-comment": [
            "error",
            "always",
            {
                "markers": [
                    "/"
                ]
            }
        ],
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "lintFile": "./tslint.json"
            }
        ]
    }
};
