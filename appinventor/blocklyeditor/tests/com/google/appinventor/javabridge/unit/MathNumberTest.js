/**
 * Tests the generation of a single Math block
 * @returns {boolean} Test success
 */
exports.run = function () {
    var blockName = 'math_number';
    var expected = '200';

    var testBlock = new Blockly.Block.obtain(Blockly.mainWorkspace, blockName);
    testBlock.setFieldValue(200, 'NUM');

    var actual = Blockly.Java.parseBlock(testBlock);
    var success = expected === actual;
    if (!success){
        console.log("Assertion Failed");
        console.log("Expected: " + expected);
        console.log("Actual  : " + actual);
    }
    return success;
};
