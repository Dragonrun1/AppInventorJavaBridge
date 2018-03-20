/**
 * Tests the generation of a Math compare block
 * @returns {boolean} Test success
 */
exports.run = function () {
    var blockName = 'math_compare';
    var expected = '200==400';

    var numBlock1 = new Blockly.Block.obtain(Blockly.mainWorkspace, 'math_number');
    numBlock1.setFieldValue(200, 'NUM');

    var numBlock2 = new Blockly.Block.obtain(Blockly.mainWorkspace, 'math_number');
    numBlock2.setFieldValue(400, 'NUM');

    var compareBlock = new Blockly.Block.obtain(Blockly.mainWorkspace, blockName);
    compareBlock.childBlocks_ = [numBlock1, numBlock2];

    var actual = Blockly.Java.parseBlock(compareBlock);
    var success = expected === actual;
    if (!success){
        console.log("Assertion Failed");
        console.log("Expected: " + expected);
        console.log("Actual  : " + actual);
    }
    return success;
};
