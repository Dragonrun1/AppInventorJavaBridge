Blockly.Java.parseJBridgeTextTypeBlocks = function (textBlock) {
  var code = "";
  var type = textBlock.type;
  if (type == "text") {
    code = Blockly.Java.parseJBridgeTextBlock(textBlock);
  } else if (type == "text_join") {
    code = Blockly.Java.parseJBridgeTextJoinBlock(textBlock);
  } else if (type == "text_changeCase") {
    code = Blockly.Java.parseJBridgeTextChangeCaseBlock(textBlock);
  } else if (type == "text_compare") {
    code = Blockly.Java.parseJBridgeTextCompareBlock(textBlock);
  } else if (type == "text_length") {
    code = Blockly.Java.parseJBridgeTextLengthBlock(textBlock);
  } else if (type == "text_isEmpty") {
    code = Blockly.Java.parseJBridgeTextisEmptyBlock(textBlock);
  } else if (type == "text_trim") {
    code = Blockly.Java.parseJBridgeTextTrimBlock(textBlock);
  } else if (type == "text_starts_at") {
    code = Blockly.Java.parseJBridgeTextStartsAtBlock(textBlock);
  } else if (type == "text_contains") {
    code = Blockly.Java.parseJBridgeTextContainsBlock(textBlock);
  } else if (type == "text_replace_all") {
    code = Blockly.Java.parseJBridgeTextReplaceAllBlock(textBlock);
  } else if (type == "text_split") {
    code = Blockly.Java.parseJBridgeTextSplitBlock(textBlock);
  } else if (type == "text_split_at_spaces") {
    code = Blockly.Java.parseJBridgeTextSplitAtSpacesBlock(textBlock);
  } else if (type == "text_segment") {
    code = Blockly.Java.parseJBridgeTextSegmentBlock(textBlock);
  }
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Contains a text string.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextBlock = function (textBlock) {
  var textData = textBlock.getFieldValue("TEXT");
  return Blockly.Java.genJBridgeTextBlock(textData);
};

/**
 * Parsing an App Inventor Text Block that:
 * Appends all of the inputs to make a single string. If no inputs, returns an empty string.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextJoinBlock = function (textBlock) {
  var joinList = [];
  for (var y = 0, joinBlock; joinBlock = textBlock.childBlocks_[y]; y++) {
    var genCode = Blockly.Java.parseBlock(joinBlock);
    joinList.push(genCode);
  }
  if (joinList.length == 0) {
    return "";
  }
  else {
    return Blockly.Java.genJBridgeTextJoinBlock(joinList);
  }
};

/**
 *  Parses Java Bridge Text Blocks and changes their case according to corresponding operator
 *
 * @param {String} textBlock
 * @returns {String} code generated if no errors, as a result of genJBridgeTextChangeCaseBlock
 */
Blockly.Java.parseJBridgeTextChangeCaseBlock = function (textBlock) {
  var operator = textBlock.getFieldValue("OP");
  var op = "toLowerCase()";
  if (operator == "UPCASE") {
    op = "toUpperCase()";
  }
  var genCode = "";
  for (var x = 0, childBlock; childBlock = textBlock.childBlocks_[x]; x++) {
    genCode = genCode + Blockly.Java.parseBlock(childBlock);
  }
  return Blockly.Java.genJBridgeTextChangeCaseBlock(genCode, op);
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns whether or not the first string is lexicographically <, >, or = the second string
 * depending on which dropdown is selected.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextCompareBlock = function (textBlock) {
  var operator = textBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var op = Blockly.Java.getJBridgeOperator(operator) + " 0";
  return Blockly.Java.getJBridgeTextCompareBlock(leftValue, rightValue, op);
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns the number of characters including spaces in the string. This is the length of the given text string.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextLengthBlock = function (textBlock) {
  var code = "";
  var sizeMethod = ".length()";
  var childType = textBlock.childBlocks_[0].type;
  var child = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  code = "(" + child + ")" + sizeMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns whether or not the string contains any characters (including spaces).
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextisEmptyBlock = function (textBlock) {
  var code = "";
  var emptyMethod = ".isEmpty()";
  var child = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  code += child + emptyMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Removes any spaces leading or trailing the input string and returns the result.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextTrimBlock = function (textBlock) {
  var code = "";
  var textMethod = ".trim()";
  var child = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  code += child + textMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns the character position where the first character of piece first appears in text
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextStartsAtBlock = function (textBlock) {
  var code = "";
  var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var piece = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var textMethod = ".indexOf(" + piece + ")";
  code += text + textMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns true if piece appears in text; otherwise, returns false.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextContainsBlock = function (textBlock) {
  var code = "";
  var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var piece = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var textMethod = ".contains(" + piece + ")";
  code += text + textMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns a new text string obtained by replacing all occurrences of the substring with the replacement.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextReplaceAllBlock = function (textBlock) {
  var code = "";
  var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var segment = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var replacement = Blockly.Java.parseBlock(textBlock.childBlocks_[2]);
  var textMethod = ".replaceAll(" + segment + ", " + replacement + ")";
  code += text + textMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Divides text into pieces using at as the dividing points and produces a list of the results.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextSplitBlock = function (textBlock) {
  //different Text Splits Still need to be supported
  //currently the block for text splitting does not show what type of split
  var code = "";
  var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var splitAt = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var textMethod = ".split(" + splitAt + ")";
  code += text + textMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Divides the given text at any occurrence of a space, producing a list of the pieces.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextSplitAtSpacesBlock = function (textBlock) {
  var code = "";
  var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var splitAt = '"\\\\s+"';
  var textMethod = ".split(" + splitAt + ")";
  code += text + textMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Extracts part of the text starting at start position and continuing for length characters.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextSegmentBlock = function (textBlock) {
  var code = "";
  var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var start = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var length = Blockly.Java.parseBlock(textBlock.childBlocks_[2]);
  //subtract 1 from start and length because app inventor indexes start from 1
  var textMethod = ".substring(" + start + " - 1, (" + start + " + " + length + ") -1)";
  code += text + textMethod;
  return code;
};

/**
 *  Generates string in java
 *
 * @params {String} text to be seen in java
 * @return {String} code if there are no errors
 */
Blockly.Java.genJBridgeTextBlock = function (text) {
  var code = "\"" + text.replace(/"/gi, "\'") + "\"";
  return code;
};

/**
 *  Generates text.join in java corresponding to list of text to concatenate
 *
 * @params {String} joinList
 * @return {String} code if there are no errors
 */
Blockly.Java.genJBridgeTextJoinBlock = function (joinList) {
  var code = "";

  for (var x = 0; x < joinList.length; x++) {
    //if its the last item of joinList
    if (x == (joinList.length - 1)) {
      if (typeof joinList[x] !== 'string') {
        code = code + "(String.valueOf(" + joinList[x] + "))";
      }
      else {
        code = code + joinList[x];
      }
    }
    else {
      if (typeof joinList[x] !== 'string') {
        code = code + "(String.valueOf(" + joinList[x] + "))" + "+";
      }
      else {
        code = code + joinList[x] + " + ";
      }
    }
  }
  return code;
};

/**
 *  Generates JBridgeText for changing the case of text
 *
 * @param {String} inputText
 * @params{String} changeCase
 * @return{String} code generated if no errors
 */
Blockly.Java.genJBridgeTextChangeCaseBlock = function (inputText, changeCase) {
  var code = "String.valueOf("
    + inputText
    + ")."
    + changeCase;
  return code;
};