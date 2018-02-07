Blockly.Java.parseJBridgeMathBlocks = function (mathBlock) {
  var code = "";
  var type = mathBlock.type;
  if (type == "math_number") {
    code = Blockly.Java.parseJBridgeMathNumberBlock(mathBlock);
  } else if (type == "math_random_int") {
    code = Blockly.Java.parseJBridgeMathRandomInt(mathBlock);
  } else if (type == "math_random_float") {
    code = Blockly.Java.parseJBridgeMathRandomFloatBlock(mathBlock);
  } else if (Blockly.Java.isMathOperationBlock(mathBlock)) {
    code = Blockly.Java.parseMathOperationBlock(mathBlock);
  } else if (Blockly.Java.isSingleMathBlock(mathBlock)) {
    code = Blockly.Java.parseJBridgeMathSingleBlock(mathBlock);
  } else if (type == "math_convert_angles") {
    code = Blockly.Java.parseJBridgeMathConvertAngleBlock(mathBlock);
  } else if (type == "math_convert_number") {
    code = Blockly.Java.parseJBridgeMathConvertNumberBlock(mathBlock);
  } else if (type == "math_is_a_number") {
    code = Blockly.Java.parseJBridgeMathIsNumberBlock(mathBlock);
  }
  return code;
};

Blockly.Java.isMathOperationBlock = function (mathBlock) {
  return mathOperationBlocks.indexOf(mathBlock.type) >= 0;
};

Blockly.Java.isSingleMathBlock = function (mathBlock) {
  return singleMathTypes.indexOf(mathBlock.type) > -1;
};

Blockly.Java.parseJBridgeMathNumberBlock = function (mathBlock) {
  var numberValue;
  //Assuming numver value always in the fieldRow[0] in inputlist[0].
  numberValue = mathBlock.getFieldValue('NUM');
  return Blockly.Java.genJBridgeMathNumberBlock(numberValue);
};

Blockly.Java.parseJBridgeMathRandomInt = function (mathBlock) {
  var name = "random";
  if (!jBridgeVariableDefinitionMap[name]) {
    jBridgeVariableDefinitionMap[name] = "Random";
    jBridgeInitializationList.push("random = new Random();");
    jBridgeImportsMap[name] = "import java.util.Random;";
  }
  var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
  return Blockly.Java.genJBridgeMathRandomInt(leftValue, rightValue);
};

/**
 *  Parses math random block and checks for correct imports. If none
 *  exist, they are added
 *
 * @params {String} mathBlock to parse
 * @returns {String} code generated if no errors
 */
Blockly.Java.parseJBridgeMathRandomFloatBlock = function (mathBlock) {
  var name = "random";
  if (!jBridgeVariableDefinitionMap[name]) {
    jBridgeVariableDefinitionMap[name] = "Random";
    jBridgeInitializationList.push("random = new Random();");
    jBridgeImportsMap[name] = "import java.util.Random;";
  }
  return Blockly.Java.genJBridgeMathRandomFloatBlock();
};

Blockly.Java.parseMathOperationBlock = function (mathBlock) {
  var code = "";
  var type = mathBlock.type;
  if (type == "math_add") {
    code = Blockly.Java.parseJBridgeMathAdd(mathBlock);
  } else if (type == "math_subtract") {
    code = Blockly.Java.parseJBridgeMathSubtract(mathBlock);
  } else if (type == "math_multiply") {
    code = Blockly.Java.parseJBridgeMathMultiply(mathBlock);
  } else if (type == "math_division") {
    code = Blockly.Java.parseJBridgeMathDivision(mathBlock);
  } else if (type == "math_compare") {
    code = Blockly.Java.parseJBridgeMathCompare(mathBlock);
  } else if (type == "math_atan2") {
    code = Blockly.Java.parseJBridgeMathAtan2(mathBlock);
  } else if (type == "math_power") {
    code = Blockly.Java.parseJBridgeMathPowerBlock(mathBlock);
  }
  return code;
};

Blockly.Java.parseJBridgeMathAdd = function (mathBlock) {
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);
  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);
  return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "+");
};

Blockly.Java.parseJBridgeMathSubtract = function (mathBlock) {
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);
  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);
  return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "-");
};

Blockly.Java.parseJBridgeMathMultiply = function (mathBlock) {
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);
  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);
  return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "*");
};

Blockly.Java.parseJBridgeMathDivision = function (mathBlock) {
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);
  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);
  return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "/");
};

/**
 *  Parses math blocks and determines string or number comparison
 *
 * @params {String} mathBlock
 * @returns {String} code generated if no errors, as a reult of .genJBridgeMathCompare
 */
Blockly.Java.parseJBridgeMathCompare = function (mathBlock) {
  var operator = mathBlock.getFieldValue("OP");
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);

  if (mathBlock.childBlocks_[0].category == "Component" && mathBlock.childBlocks_[0].methodName == "GetValue") {
    leftValue = Blockly.Java.castObjectChildToInteger(mathBlock, 1, leftValue);
  } else if (!mathBlock.childBlocks_[0].category == "Logic") {
    leftValue = Blockly.Java.castValueToInteger(mathBlock.childBlocks_[0], leftValue);
  }

  if (mathBlock.childBlocks_[1].category == "Component" && mathBlock.childBlocks_[1].methodName == "GetValue") {
    rightValue = Blockly.Java.castObjectChildToInteger(mathBlock, 2, rightValue);
  } else if (!mathBlock.childBlocks_[1].category == "Logic") {
    rightValue = Blockly.Java.castValueToInteger(mathBlock.childBlocks_[1], rightValue);
  }

  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);

  var op = Blockly.Java.getJBridgeOperator(operator);
  if (op == "==" && (leftValue.indexOf("String.valueOf(") == 0)) {
    return Blockly.Java.genJBridgeStringEqualsCompare(leftValue, rightValue, op);
  }
  return Blockly.Java.genJBridgeMathCompare(leftValue, rightValue, op);
};

/**
 *  Parses math blocks for genJBridgeMathAtan2 function
 *
 * @params {String} mathBlock
 * @returns {String} code generated if no errors, as a reult of .genJBridgeMathAtan2
 */
Blockly.Java.parseJBridgeMathAtan2 = function (mathBlock) {
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);
  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);
  return Blockly.Java.genJBridgeMathAtan2(leftValue, rightValue);
};

/**
 * Parses an App Inventor Block that:
 * gives the power of the given number raised to the second given number
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathPowerBlock = function (mathBlock) {
  var leftBlock = mathBlock.childBlocks_[0];
  var rightBlock = mathBlock.childBlocks_[1];
  var leftValue = Blockly.Java.parseBlock(leftBlock);
  var rightValue = Blockly.Java.parseBlock(rightBlock);
  leftValue = Blockly.Java.castValueToInteger(leftBlock, leftValue);
  rightValue = Blockly.Java.castValueToInteger(rightBlock, rightValue);
  return "Math.pow(" + leftValue + ", " + rightValue + ")";
};

/**
 * Parses an App Inventor Block that:
 * performs different math operations
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathSingleBlock = function (mathBlock) {
  var code = "";
  var operand = mathBlock.getFieldValue('OP');
  var value = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  if (value.slice(-7) == ".Text()") {
    value = "Integer.parseInt(" + value + ")";
  }
  //Theres no java method for negate
  if (operand == "NEG") {
    code = "Math.abs(" + value + ") * -1";
  }
  else {
    var javaMethodName = singleMathJavaNames.get(operand);
    if (javaMethodName == "sqrt") {
      code = "Math." + javaMethodName + "((float)" + value + ")";
    } else {
      code = "Math." + javaMethodName + "(" + value + ")";
    }

  }
  return code;
};

/**
 * Parses an App Inventor Block that:
 * Converts a number from radians to degrees or from degrees to radians
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathConvertAngleBlock = function (mathBlock) {
  var code = "";
  var operand = mathBlock.getFieldValue('OP');
  var value = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  if (value.slice(-7) == ".Text()") {
    value = "Integer.parseInt(" + value + ")";
  }

  if (operand == "RADIANS_TO_DEGREES") {
    code += "Math.toDegrees(" + value + ")";
  } else if (operand == "DEGREES_TO_RADIANS") {
    code += "Math.toRadians(" + value + ")";
  }
  return code;
};

/**
 * Parses an App Inventor Block that:
 * Converts a number to the given type
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathConvertNumberBlock = function (mathBlock) {
  var code = "";
  var operand = mathBlock.getFieldValue('OP');
  var value = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  if (value.slice(-7) == ".Text()") {
    value = "Integer.parseInt(" + value + ")";
  }

  if (operand == "DEC_TO_HEX") {
    code += "Integer.valueOf(String.valueOf(" + value + "), 16)";
  } else if (operand == "HEX_TO_DEC") {
    code += "Integer.parseInt(String.valueOf(" + value + "), 16)";
  } else if (operand == "DEC_TO_BIN") {
    code += "Integer.toBinaryString((int)" + value + ")";
  } else if (operand == "BIN_TO_DEC") {
    code += "Integer.parseInt(String.valueOf(" + value + "), 2)";
  }
  return code;
};

/**
 * Parses an App Inventor Block that:
 * Returns true if the given object is a number of the given base, and false otherwise.
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathIsNumberBlock = function (mathBlock) {
  var code = "";
  var operand = mathBlock.getFieldValue('OP');
  var value = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);

  if (operand == "NUMBER") {
    code += "String.valueOf(" + value + ")" + ".matches(\"[0-9]+.?[0-9]+\")";
  } else if (operand == "BASE10") {
    //TODO NOT IMPLEMENTED IN LIBRARY YET
  } else if (operand == "HEXADECIMAL") {
    //TODO NOT IMPLEMENTED IN LIBRARY YET
  } else if (operand == "BINARY") {
    code += "String.valueOf(" + value + ")" + ".matches(\"[01]+\")";
  }
  return code;
};

Blockly.Java.genJBridgeMathNumberBlock = function (numberValue) {
  var code = "";
  code = numberValue;
  return code;
};

//TODO try other alternatives for Random integer like "Random.randInt(min, max)"
Blockly.Java.genJBridgeMathRandomInt = function (leftValue, rightValue) {
  var code = "(random.nextInt("
    + rightValue
    + " - "
    + leftValue
    + " + "
    + " 1 "
    + ")"
    + " + "
    + leftValue
    + ")";
  return code;
};

/**
 *  Generates the random.nextFloat components in JBridge format
 *
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeMathRandomFloatBlock = function () {
  var code = "(random.nextFloat())";
  return code;
};

Blockly.Java.genJBridgeMathOperation = function (leftValue, rightValue, operand) {
  var code = "("
    + leftValue
    + " "
    + operand
    + " "
    + rightValue
    + ")";
  return code;
};

/**
 *  Generates java code for comparing 2 strings' values
 *
 * @params {String} leftValue
 * @params {String} rightValue
 * @params {String} operator
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeStringEqualsCompare = function (leftValue, rightValue, operator) {
  var code = "("
    + leftValue
    + ").equals("
    + rightValue
    + ")";
  return code;
};

/**
 *  Generates java code for comparing 2 number values
 *
 * @params {String} leftValue
 * @params {String} rightValue
 * @params {String} operator
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeMathCompare = function (leftValue, rightValue, operator) {
  var code = leftValue
    + operator
    + rightValue;
  return code;
};

/**
 *  Generates java code for tan function
 *
 * @params {String} leftValue
 * @params {String} rightValue
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeMathAtan2 = function (leftValue, rightValue) {
  var code = "Math.toDegrees(Math.atan2("
    + leftValue
    + ", "
    + rightValue
    + "))";
  return code;
};