#!/usr/bin/env node
require('shelljs/global');

var chalk = require('chalk'),
    async = require('async'),
    Mocha = require('mocha'),
    recursive = require('recursive-readdir'),

    /**
     * The source directory for system test specs.
     *
     * @type {String}
     */
    SPEC_SOURCE_DIR = './test/system';

module.exports = function (exit) {
    // banner line
    console.info(chalk.yellow.bold('\nRunning system tests...\n'));

    async.series([

        /**
         * Enforces sanity checks on installed packages via dependency-check.
         *
         * @param {Function} next - The callback function invoked when the package sanity check has concluded.
         * @returns {*}
         */
        function (next) {
            console.log(chalk.yellow('checking package dependencies...\n'));

            exec('dependency-check ./package.json --extra --no-dev --missing', next);
        },

        /**
         * Runs system tests on SPEC_SOURCE_DIR using Mocha.
         *
         * @param {Function} next - The callback invoked to mark the completion of the test run.
         * @returns {*}
         */
        function (next) {
            console.info('\nrunning system specs using mocha...');

            var mocha = new Mocha();

            recursive(SPEC_SOURCE_DIR, function (err, files) {
                if (err) {
                    console.error(err);
                    return exit(1);
                }

                files.filter(function (file) {
                    return (file.substr(-8) === '.test.js');
                }).forEach(function (file) {
                    mocha.addFile(file);
                });

                // start the mocha run
                mocha.run(next);
                mocha = null; // cleanup
            });
        }

    ], exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
