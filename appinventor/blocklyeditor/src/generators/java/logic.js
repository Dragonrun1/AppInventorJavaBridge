Blockly.Java.parseJBridgeLogicBlocks = function (logicBlock) {
  var code = "";
  var componentType = logicBlock.type;
  if (componentType == "logic_boolean" || componentType == "logic_false") {
    code = Blockly.Java.parseJBridgeBooleanBlock(logicBlock);
  } else if (componentType == "logic_operation") {
    code = Blockly.Java.parseJBridgeLogicOperationBlock(logicBlock);
  } else if (componentType == "logic_compare") {
    code = Blockly.Java.parseJBridgeLogicCompareBlocks(logicBlock);
  } else if (componentType == "logic_negate") {
    code = Blockly.Java.parseJBridgeLogicNegateBlocks(logicBlock);
  } else if (componentType == "logic_or") {
    code = Blockly.Java.parseJBridgeLogicOrBlocks(logicBlock);
  }
  return code;
};

Blockly.Java.parseJBridgeBooleanBlock = function (logicBlock) {
  var value = logicBlock.getFieldValue("BOOL");
  return Blockly.Java.genJBridgeBooleanBlock(value);
};

/**
 *  Parses math logic block and conducts an evaluation using left
 *
 * @params {String} logicBlock from blocks
 * @returns {String} code generated if no errors, called from .genJBridgeLogicOperationBlock
 */
Blockly.Java.parseJBridgeLogicOperationBlock = function (logicBlock) {
  var operator = logicBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(logicBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(logicBlock.childBlocks_[1]);

  return Blockly.Java.genJBridgeLogicOperationBlock(leftValue, rightValue, Blockly.Java.getJBridgeOperator(operator));
};

Blockly.Java.parseJBridgeLogicCompareBlocks = function (logicBlock) {
  var leftBlock = logicBlock.childBlocks_[0];
  var rightBlock = logicBlock.childBlocks_[1];
  var operator = logicBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);

  var stringCompare = false;

  //cast to string comparison for different types
  if (Blockly.Java.isStringBlock(leftBlock) && rightBlock.category == "Math") {
    if (!rightValue.startsWith("String.valueOf(")) {
      rightValue = "String.valueOf(" + rightValue + ")";
    }
    stringCompare = true;
  } else if (Blockly.Java.isStringBlock(rightBlock) && leftBlock.category == "Math") {
    if (!leftValue.startsWith("String.valueOf(")) {
      leftValue = "String.valueOf(" + rightValue + ")";
    }
    stringCompare = true;
  } else if (Blockly.Java.isStringBlock(rightBlock) && Blockly.Java.isStringBlock(rightBlock)) {
    stringCompare = true;
  }

  var code = "";
  if (stringCompare == true) {
    code += leftValue + ".equals(" + rightValue + ")";
    if (operator == "NEQ") {
      code = "!" + code;
    }
  } else {
    code += Blockly.Java.genJBridgeLogicCompareBlock(leftValue, rightValue, Blockly.Java.getJBridgeOperator(operator));
  }
  return code;
};

Blockly.Java.parseJBridgeLogicNegateBlocks = function (logicBlock) {
  var value = Blockly.Java.parseBlock(logicBlock.childBlocks_[0]);
  return Blockly.Java.genJBridgeLogicNegateBlock(value);
};

Blockly.Java.parseJBridgeLogicOrBlocks = function (logicBlock) {
  var code = "";
  var value = "";
  for (var x = 0, childBlock; childBlock = logicBlock.childBlocks_[x]; x++) {
    if (logicBlock.childBlocks_[x + 1] != undefined) {
      value = Blockly.Java.parseBlock(childBlock);
      code = code + value + " || ";
    } else {
      value = Blockly.Java.parseBlock(childBlock);
      code = code + value;
    }
  }
  return code;
};

Blockly.Java.genJBridgeBooleanBlock = function (value) {
  return value.toLowerCase();
};

/**
 * Applies appropriate operator (i.e. addition, subtraction, etc.) to two values in java
 *
 * @params{String} leftValue
 * @params{String} rightValue
 * @params{String} operator
 * @return{String} code that is generated
 */
Blockly.Java.genJBridgeLogicOperationBlock = function (leftValue, rightValue, operator) {

  var code = leftValue
    + " "
    + operator
    + " "
    + rightValue;
  return code;
};

Blockly.Java.genJBridgeLogicCompareBlock = function (leftValue, rightValue, operator) {

  var code = leftValue
    + " "
    + operator
    + " "
    + rightValue;
  return code;
};

Blockly.Java.genJBridgeLogicNegateBlock = function (value) {
  var code = "!("
    + value
    + ")";
  return code;
};