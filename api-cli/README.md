# panacloud

panacloud cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/panacloud.svg)](https://npmjs.org/package/panacloud)
[![Downloads/week](https://img.shields.io/npm/dw/panacloud.svg)](https://npmjs.org/package/panacloud)
[![License](https://img.shields.io/npm/l/panacloud.svg)](https://github.com/Muh-Hasan/panacloud/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g panacloud
$ panacloud COMMAND
running command...
$ panacloud (-v|--version|version)
panacloud/0.0.2 win32-x64 node-v14.16.1
$ panacloud --help [COMMAND]
USAGE
  $ panacloud COMMAND
...
```

<!-- usagestop -->

```sh-session
$ npm install -g panacloud
$ panacloud COMMAND
running command...
$ panacloud (-v|--version|version)
panacloud/0.0.2 win32-x64 node-v14.16.1
$ panacloud --help [COMMAND]
USAGE
  $ panacloud COMMAND
...
```

<!-- usagestop -->

```sh-session
$ npm install -g panacloud
$ panacloud COMMAND
running command...
$ panacloud (-v|--version|version)
panacloud/0.0.0 win32-x64 node-v14.15.4
$ panacloud --help [COMMAND]
USAGE
  $ panacloud COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`panacloud create:api`](#panacloud-createapi)
- [`panacloud create:hello`](#panacloud-createhello)
- [`panacloud help [COMMAND]`](#panacloud-help-command)

## `panacloud create:api`

Create api

```
USAGE
  $ panacloud create:api

OPTIONS
  -T, --template=(todoApp|starter)  [default: starter] Templates
  -h, --help                        show CLI help
  -n, --name=name                   [default: panacloud] API Name
  -t, --token=token                 (required) Token
```

_See code: [src/commands/create/api.ts](https://github.com/panacloud/serverless-saas-cli/blob/v0.0.2/src/commands/create/api.ts)_

## `panacloud create:hello`

```
USAGE
  $ panacloud create:hello

OPTIONS
  -g, --graphqlSchema=graphqlSchema  (required) graphql schema path
```

_See code: [src/commands/create/hello.ts](https://github.com/panacloud/serverless-saas-cli/blob/v0.0.2/src/commands/create/hello.ts)_

## `panacloud help [COMMAND]`

display help for panacloud

```
USAGE
  $ panacloud help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

<!-- commandsstop -->

- [`panacloud create:api`](#panacloud-createapi)
- [`panacloud help [COMMAND]`](#panacloud-help-command)

## `panacloud create:api`

Create api

```
USAGE
  $ panacloud create:api

OPTIONS
  -T, --template=(todoApp|starter)  [default: starter] Templates
  -h, --help                        show CLI help
  -n, --name=name                   [default: panacloud] API Name
  -t, --token=token                 (required) Token
```

_See code: [src/commands/create/api.ts](https://github.com/panacloud/serverless-saas-cli/blob/v0.0.2/src/commands/create/api.ts)_

## `panacloud help [COMMAND]`

display help for panacloud

```
USAGE
  $ panacloud help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

<!-- commandsstop -->

- [`panacloud create:api [NOTHING]`](#panacloud-createapi-nothing)
- [`panacloud hello [FILE]`](#panacloud-hello-file)
- [`panacloud help [COMMAND]`](#panacloud-help-command)

## `panacloud create:api [NOTHING]`

Create api

```
USAGE
  $ panacloud create:api [NOTHING]

OPTIONS
  -h, --help       show CLI help
  -n, --name=name  Api name
```

_See code: [src/commands/create/api.ts](https://github.com/Muh-Hasan/panacloud/blob/v0.0.0/src/commands/create/api.ts)_

## `panacloud hello [FILE]`

describe the command here

```
USAGE
  $ panacloud hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ panacloud hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/Muh-Hasan/panacloud/blob/v0.0.0/src/commands/hello.ts)_

## `panacloud help [COMMAND]`

display help for panacloud

```
USAGE
  $ panacloud help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

<!-- commandsstop -->
