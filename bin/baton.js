#!/usr/bin/env node

var program = require('commander')
  , baton = require('../')

program.command('apply <plan>')
  .description('-> apply plan')
  .option('-e, --env [environment]', 'run in specified environment (default: development)')
  .action(function(file, options) {
    options.env = options.env || process.env.NODE_ENV || 'development';
  
    baton.cli.apply(file, options.env);
  });

program.command('install')
  .description('-> install a component')
  .action(function() {
    baton.cli.install();
  });

program.parse(process.argv);
