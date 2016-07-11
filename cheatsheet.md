# Cheatsheet

## (for when I return to this project and don't have a clue what's what)

(tree cmd)
http://unix.stackexchange.com/questions/291282/have-tree-hide-gitignored-files
https://www.npmjs.com/package/tree-fiddy

(srv/cli org)

Procfile
'No ENV file found'
fvc
--trace-sync-io
ftp

envcf/
  index.js
  development.js
  staging.js
  production.js

```javascript
// development.js
(function() {
    'use strict';
    module.exports = {
        SECRET_API: 'foo',
        logLevel: 'debug'
    };
}());
```

```javascript
(function() {
    'use strict';
    module.exports = require('./' + process.env.NODE_ENV + '.js');
    /* or
    *  console.error('Unrecognized NODE_ENV: ' + process.env.NODE_ENV);
    *  process.exit(1);
    */
}());
```
lowercase fn

f = ('x' => {'x: ' + x})

coord filters

random docs

app-version

foreman
https://devcenter.heroku.com/articles/node-best-practices

node repl

(mongod repair)

(tab by mime)

(404)

rm $ vend

gulp srv js?

gulp ln

remove '/;;*$/'

something like `sed /err*[0-9]x/err/`

npm for catching '(!!)', ';;*$', &c., <name> -n --no-gitignore

sayson

cidr syntax parser

gitignore '*.gi'
