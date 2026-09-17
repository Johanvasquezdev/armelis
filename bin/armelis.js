#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { main } = require(path.join(__dirname, '..', 'packages', 'cli', 'bin', 'armelis.js'));

main().then((code) => {
  if (code) process.exit(code);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
