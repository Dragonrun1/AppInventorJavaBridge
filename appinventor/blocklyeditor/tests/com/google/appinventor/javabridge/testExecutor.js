/**
 * The test executor runs the following tests in a Blockly testbed
 * */
var tests = [
    './unit/MathNumberTest.js',
    './unit/MathCompareTest.js'
];

// Index of the test to run
var testIndex = 0;

function buildPage(){
    var page = require('webpage').create();

    // page console messages come tests
    page.onConsoleMessage = function(msg) {
        console.log('\t' + msg);
    };
    return page;
}

function runTest(page, test){
    var success = page.evaluate(function() {
        var test = arguments[0];
        return test();
    }, test);
    return success;
}

function ouputResults(success, testName) {
    if (success){
        console.log("PASSED: " + testName);
    }else {
        console.log("FAILED:  " + testName);
        phantom.exit(1);
    }
}

/**
 * Recursive function for running the tests
 */
function nextTest() {
    if (testIndex >= tests.length) {
        phantom.exit(0);
    }
    var testName = tests[testIndex];

    // All tests must implement an exports.run() method
    var test = require(testName).run;

    var page = buildPage();
    page.open('blockly_testbed.html', function (status) {
        var success = false;
        if (status === "success") {
            // Test bed opened
            console.log("Running: " + testName);
            success = runTest(page, test);
        } else {
            console.log("Test bed failed to open");
        }

        ouputResults(success, testName);

        // last line of test executes next test, ensures sequential execution
        testIndex++;
        nextTest();
    });
}
nextTest();
