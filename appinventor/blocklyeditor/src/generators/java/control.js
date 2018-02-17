Blockly.Java.parseJBridgeControlBlocks = function (controlBlock) {
  var code = "";
  var controlType = controlBlock.type;
  if (controlType == "controls_if") {
    code = Blockly.Java.parseJBridgeControlIfBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  } else if (controlType == "controls_forEach") {
    code = Blockly.Java.parseJBridgeControlForEachBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  } else if (controlType == "controls_openAnotherScreen") {
    code = Blockly.Java.parseJBridgeControlOpenAnotherScreenBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  } else if (controlType == "controls_forRange") {
    code = Blockly.Java.parseJBridgeControlForRangeBlock(controlBlock);
    jBridgeIsIndividualBlock = false;
  } else if (controlType == "controls_while") {
    code = Blockly.Java.parseJBridgeControlWhileBlock(controlBlock);
    jBridgeIsIndividualBlock = false;
  } else if (controlType == "controls_choose") {
    code = Blockly.Java.parseJBridgeControlChoose(controlBlock);
    jBridgeIsIndividualBlock = false;
  } else if (controlType == "controls_eval_but_ignore") {
    code = Blockly.Java.parseJBridgeControlEvalIgnore(controlBlock);
    jBridgeIsIndividualBlock = false;
  } else if (controlType == "controls_openAnotherScreenWithStartValue") {
    code = Blockly.Java.parseJBridgeControlOpenScreenWithStartValue(controlBlock);
    jBridgeIsIndividualBlock = false;
  } else if (controlType == "controls_getStartValue") {
    code = Blockly.Java.parseJBridgeControlGetStartValue(controlBlock);
    jBridgeIsIndividualBlock = false;
  } else if (controlType == "controls_closeScreen") {
    code = Blockly.Java.parseJBridgeControlCloseScreen(controlBlock);
    jBridgeIsIndividualBlock = true;
  } else if (controlType == "controls_closeApplication") {
    code = Blockly.Java.parseJBridgeControlCloseApplication(controlBlock);
    jBridgeIsIndividualBlock = true;
  }
  return code;

};

/**
 * Parses an App Inventor block that:
 * Tests a given condition.
 * If the condition is true, performs the actions in a given sequence of blocks
 * @param controlIfBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlIfBlock = function (controlIfBlock) {
  if (controlIfBlock.childBlocks_.length < 2){
    throw "If block must contain condition and statement"
  }
  var elseCount = controlIfBlock.elseCount_;
  var elseIfCount = controlIfBlock.elseifCount_;
  var ifCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]);
  var ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
  if (controlIfBlock.childBlocks_[1].category == "Logic" || controlIfBlock.childBlocks_[1].type == "text_compare") {
    // Logic and Text Compare blocks are swapped
    var tmp = ifCondition;
    ifCondition = ifStatement;
    ifStatement = tmp;
  }

  var code = Blockly.Java.genJBridgeControlIfBlock(ifCondition, ifStatement);
  var index = 2 + (elseIfCount * 2);
  if (elseIfCount > 0) {
    for (var i = 2; i < index; i = i + 2) {
      var elseIfCondition = "";
      var elseIfStatement = "";
      if (controlIfBlock.childBlocks_[i + 1].category == "Logic" || controlIfBlock.childBlocks_[1].type == "text_compare") {
        elseIfCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i + 1]);
        elseIfStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i]);
      } else {
        elseIfCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i]);
        elseIfStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i + 1]);
      }
      code = code
        + Blockly.Java.genJBridgeControlElseIfBlock(elseIfCondition, elseIfStatement);
    }
  }
  if (elseCount == 1) {
    var elseStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[index]);
    code = code
      + Blockly.Java.genJBridgeControlElseBlock(elseStatement);
  }
  for (var x = index + elseCount; x < controlIfBlock.childBlocks_.length; x++) {
    code = code
      + Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x]);
  }

  return code;
};

/**
 * Parses an App Inventor block that:
 * Runs the blocks in the do section for each item in the list in list
 * @param controlForEachBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlForEachBlock = function (controlForEachBlock) {
  var code = "";
  var forList = Blockly.Java.parseBlock(controlForEachBlock.childBlocks_[0]);
  var forItem = controlForEachBlock.getFieldValue('VAR');
  var forStatement = Blockly.Java.parseBlock(controlForEachBlock.childBlocks_[1]);
  code = Blockly.Java.genJBridgeControlForEachBlock(forList, forItem, forStatement);
  return code;
};

/**
 * Parses an App Inventor block that:
 * Opens a new screen.
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlOpenAnotherScreenBlock = function (controlBlock) {
  var code = "";
  jBridgeImportsMap["Intent"] = "import android.content.Intent;";
  var screenName = Blockly.Java.parseBlock(controlBlock.childBlocks_[0]);
  //remove any quotes and spaces
  screenName = screenName.replace(/"+/g, "");
  code += "startActivity(new Intent().setClass(this, " + screenName + ".class));\n";
  return code;
};

/**
 * Parses an App Inventor block that:
 * Runs the block in the do section for each numeric value in the range from start to end,
 * stepping the value each time.
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlForRangeBlock = function (controlBlock) {
  var code = "";
  var from = Blockly.Java.parseBlock(controlBlock.childBlocks_[0]);
  if (controlBlock.childBlocks_[0].category != "Math") {
    from = "Integer.valueOf(" + from + ")";
  }
  var to = Blockly.Java.parseBlock(controlBlock.childBlocks_[1]);
  if (controlBlock.childBlocks_[1].category != "Math") {
    to = "Integer.valueOf(" + to + ")";
  }
  var by = Blockly.Java.parseBlock(controlBlock.childBlocks_[2]);
  if (controlBlock.childBlocks_[2].category != "Math") {
    by = "Integer.valueOf(" + by + ")";
  }
  var statement = "";
  if (controlBlock.childBlocks_[3] != undefined) {
    statement = Blockly.Java.parseBlock(controlBlock.childBlocks_[3]);
  }
  var iterator = controlBlock.getFieldValue('VAR');
  jBridgeLexicalVarTypes[iterator] = JAVA_INT;

  code += Blockly.Java.genJBridgeControlForRangeBlock(from, to, by, statement, iterator);

  if (controlBlock.childBlocks_[4] != undefined) {
    var nextBlock = Blockly.Java.parseBlock(controlBlock.childBlocks_[4]);
    code += nextBlock;
  }
  return code;
};

/**
 * Parses an App Inventor block that:
 * Tests the test condition.
 * If true, performs the action given in do, then tests again.
 * When test is false, the block ends.
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlWhileBlock = function (controlBlock) {
  var code = "";
  var condition = Blockly.Java.parseBlock(controlBlock.childBlocks_[0]);
  var body = Blockly.Java.parseBlock(controlBlock.childBlocks_[1]);
  code += Blockly.Java.genJBridgeControlWhileBlock(body, condition);

  var nextBlock = Blockly.Java.parseBlock(controlBlock.childBlocks_[2]);
  code += nextBlock;

  return code;
};

/**
 * Parses an App Inventor block that:
 * Tests a given condition.
 * If the condition is true, performs the actions in the then-do sequence of blocks and returns the then-return value
 * Otherwise, performs the actions in the else-do sequence of blocks and returns the else-return value.
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlChoose = function (controlBlock) {
  var code = "";
  var condition = Blockly.Java.parseBlock(controlBlock.childBlocks_[0]);
  var thenStatement = Blockly.Java.parseBlock(controlBlock.childBlocks_[1]);
  var elseStatement = Blockly.Java.parseBlock(controlBlock.childBlocks_[2]);
  //ternary operator
  code += "((" + condition + ") ?" + thenStatement + ": " + elseStatement + ")";
  return code;
};

/**
 * Parses an App Inventor block that:
 * Calls a statement and ignore the return value
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlEvalIgnore = function (controlBlock) {
  var code = "";
  var statement = Blockly.Java.parseBlock(controlBlock.childBlocks_[0]);
  code += statement;
  return code;
};

/**
 * Parses an App Inventor block that:
 * Opens a new screen and passes a value to it
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlOpenScreenWithStartValue = function (controlBlock) {
  jBridgeImportsMap["Intent"] = "import android.content.Intent;";
  var code = "";
  var screenName = Blockly.Java.parseBlock(controlBlock.childBlocks_[0]);
  var startValue = Blockly.Java.parseBlock(controlBlock.childBlocks_[1]);

  //remove any quotes and spaces
  screenName = screenName.replace(/"+/g, "");
  code += "startActivity(new Intent().setClass(this, "
    + screenName
    + ".class).putExtra(\"startValue\", "
    + startValue
    + "));\n";
  return code;
};

/**
 * Parses an App Inventor block that:
 * Returns the start value passed from the previous screen.
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlGetStartValue = function (controlBlock) {
  var code = "";
  code += "getIntent().getExtras().get(\"startValue\")";
  return code;
};

/**
 * Parses an App Inventor block that:
 * Closes the current screen
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlCloseScreen = function (controlBlock) {
  var code = "";
  code += "finish();";
  return code;
};

/**
 * Parses an App Inventor block that:
 * Closes the application
 * @param controlBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlCloseApplication = function (controlBlock) {
  var code = "";
  code += "System.exit(1);";
  return code;
};

/**
 * Generates the java code for an if statement
 * @param condition the if statement condition
 * @param statement the code to run within the if statement body
 * @return The Java Code
 */
Blockly.Java.genJBridgeControlIfBlock = function (condition, statement) {
  //in the case that the condition is a method
  condition = Blockly.Java.removeColonsAndNewlines(condition);
  var code = "";
  code = "if("
    + condition
    + "){ \n"
    + statement
    + "\n} \n";

  return code;
};

/**
 * Generates the java code for an "else if" statement
 * @param condition the if statement condition
 * @param statement the code to run within the "else if" body
 * @return The Java Code
 */
Blockly.Java.genJBridgeControlElseIfBlock = function (condition, statement) {
  //in the case that the condition is a method
  condition = condition.replace(/[;\n]*/g, "");
  var code = "";
  code = "else if("
    + condition
    + "){ \n"
    + statement
    + "\n} \n";
  return code;
};

/**
 * Generates the java code for an "else" statement
 * @param statement the code to run within the "else" body
 * @return The Java Code
 */
Blockly.Java.genJBridgeControlElseBlock = function (statement) {
  var code = "";
  code = "else { \n"
    + statement
    + "\n} \n";
  return code;
};

/**
 * Generates the java code for a "for each" loop
 * @param forList the list to iterate through
 * @param forItem the local iterator variable
 * @param forStatement the code to run within the body of the loop
 * @return The Java Code
 */
Blockly.Java.genJBridgeControlForEachBlock = function (forList, forItem, forStatement) {
  var code = "";
  code = "for(Object "
    + forItem
    + " : "
    + forList
    + "){ \n"
    + forStatement
    + "\n} \n";
  return code;
};

/**
 * Generates the java code for the for loop
 * @param from the start value of the iterator
 * @param to the end value of the iterator
 * @param by the stepping value
 * @param statement the code to run within the loop
 * @param iterator the iterator name
 * @return The Java Code
 */
Blockly.Java.genJBridgeControlForRangeBlock = function (from, to, by, statement, iterator) {
  var code = "";
  code = "for(int " + iterator + " = " + from + "; " + iterator + "<=" + to + ";" + iterator + "+=" + by + "){ \n"
    + statement
    + "\n} \n";
  return code;
};

/**
 * Generates the java code for the While loop
 * @param body The body of the loop
 * @param condition the boolean condition
 * @return The Java Code
 */
Blockly.Java.genJBridgeControlWhileBlock = function (body, condition) {
  var code = "";
  code = "while(" + condition + "){\n"
    + body
    + "\n} \n";
  return code;
};