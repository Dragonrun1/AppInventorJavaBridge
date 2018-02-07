/**
 *  Calls parsing for Lists according to corresponding method (e.g. add, is in, select)
 *
 * @params {String} listBlock
 * @return {String} code if there are no errors
 */
Blockly.Java.parseJBridgeListBlocks = function (listBlock) {
  var code = "";
  var type = listBlock.type;
  var name = "ArrayList";
  jBridgeImportsMap[name] = "import java.util.ArrayList;";
  if (type == "lists_create_with") {
    code = Blockly.Java.parseJBridgeListsCreateWithBlock(listBlock);
  } else if (type == "lists_select_item") {
    code = Blockly.Java.parseJBridgeListSelectItemBlock(listBlock);
  } else if (type == "lists_length") {
    code = Blockly.Java.parseJBridgeListLengthBlock(listBlock);
  } else if (type == "lists_is_list") {
    code = Blockly.Java.parseJBridgeListIsListBlock(listBlock);
  } else if (type == "lists_add_items") {
    code = Blockly.Java.parseJBridgeListAddItemBlock(listBlock);
  } else if (type == "lists_is_in") {
    code = Blockly.Java.parseJBridgeListContainsBlock(listBlock);
  } else if (type == "lists_pick_random_item") {
    code = Blockly.Java.parseJBridgeListPickRandomItem(listBlock);
  } else if (type == "lists_is_empty") {
    code = Blockly.Java.parseJBridgeListIsEmpty(listBlock);
  } else if (type == "lists_position_in") {
    code = Blockly.Java.parseJBridgeListPositionIn(listBlock);
  } else if (type == "lists_insert_item") {
    code = Blockly.Java.parseJBridgeListInsertItem(listBlock);
  } else if (type == "lists_replace_item") {
    code = Blockly.Java.parseJBridgeListReplaceItem(listBlock);
  } else if (type == "lists_remove_item") {
    code = Blockly.Java.parseJBridgeListRemoveItem(listBlock);
  } else if (type == "lists_append_list") {
    code = Blockly.Java.parseJBridgeListAppendList(listBlock);
  } else if (type == "lists_copy") {
    code = Blockly.Java.parseJBridgeListCopyList(listBlock);
  } else if (type == "lists_to_csv_row") {
    code = Blockly.Java.parseJBridgeListToCSVRow(listBlock);
  } else if (type == "lists_to_csv_table") {
    code = Blockly.Java.parseJBridgeListToCSVTable(listBlock);
  }
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Creates a list from the given blocks.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListsCreateWithBlock = function (listBlock) {
  var code = "";
  var childType = "String";
  var listName = "[Unknown]";
  var isChildList = false;
  if (listBlock.parentBlock_.getFieldValue('NAME') != undefined) {
    listName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "");
  } else if (listBlock.parentBlock_.getFieldValue('VAR') != undefined) {
    listName = listBlock.parentBlock_.getFieldValue('VAR').replace("global ", "");
  } else {
    isChildList = true;
    listName = Blockly.Java.createListName(listBlock);
  }
  //set list name as comment for next recursive block to use
  listBlock.setCommentText(listName);
  for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
    var addItemData = Blockly.Java.parseBlock(childBlock);
    childType = Blockly.Java.getValueType(childBlock.type, addItemData, childBlock);
    if (childType == "int") {
      childType = "Integer";
    } else if (childType == "float") {
      childType = "Float";
    }
    //if child block for list is another list, adds nested list contents outside of parent list ".add()"
    if (childBlock.type == "lists_create_with") {
      code += addItemData;
      //list.add(childListName). childListName is stored in the block's "comment text"
      code += Blockly.Java.genJBridgeListsAddItemBlock(listName, childBlock.getCommentText());
    } else {
      code = code + Blockly.Java.genJBridgeListsAddItemBlock(listName, addItemData);
    }
  }
  if (listBlock.parentBlock_.type == "component_method") {
    var newList = Blockly.Java.genJBridgeNewList(childType);
    newList = newList.slice(0, -2);
    code = newList + code;
  } else if (isChildList) {
    //create nested list seperately
    jBridgeVariableDefinitionMap[listName] = TYPE_JAVA_ARRAYLIST;
    jBridgeInitializationList.push(listName + " = new " + TYPE_JAVA_ARRAYLIST + "();");
  } else {
    code = Blockly.Java.genJBridgeNewList(childType)
      + "\n"
      + code;
  }
  return code;
};

/**
 * Parses blocks to retrieve items from list
 * in .genJBridgeListSelectItemBlock
 *
 * @params {String} listBlock
 * @returns {String} code generated if no errors from .genJBridgeListSelectItemBlock
 */
Blockly.Java.parseJBridgeListSelectItemBlock = function (listBlock) {
  var listName = "";
  if (listBlock.childBlocks_[0].type == "lists_create_with") {
    var listCode = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
    listName = listBlock.childBlocks_[0].comment.text_;
    if (jBridgeParsingEventMethod == true) {
      jBridgeEventMethodSetupCode += listCode;
    } else {
      jBridgeInitializationList.push(listCode);
    }
  } else {
    listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
    listName = Blockly.Java.assertType(JAVA_ARRAY_LIST, listName, listBlock.childBlocks_[0]);
    if (Blockly.Java.hasTypeCastKey(listName, listTypeCastMap)) {
      listName = Blockly.Java.TypeCastOneValue(listName, listName, listTypeCastMap);
    }
  }
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Java.genJBridgeListSelectItemBlock(listName, index);

};

/**
 *  Parses the List Length Block later generate listName.size()
 *
 * @params {String} listName
 * @returns {String} code generated if no errors, as a result of .genJBridgeListLengthBlock
 */
Blockly.Java.parseJBridgeListLengthBlock = function (listBlock) {
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  return Blockly.Java.genJBridgeListLengthBlock(listName);
};

/**
 *  Adds the permissions and intents to the AndroidManifest.xml file
 *
 * @param {String} formJson JSON string describing the contents of the form. This is the JSON
 *    content from the ".scm" file for this form.
 * @params{String} packageName the name of the package (to put in the define-form call)
 * @params{String} forRepl  true if the code is being generated for the REPL, false if for an apk
 * @return{String} code generated if no errors
 */
Blockly.Java.parseJBridgeListIsListBlock = function (listBlock) {
  var genCode = "";
  for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
    genCode = genCode + Blockly.Java.parseBlock(childBlock);
  }
  return Blockly.Java.genJBridgeListIsListBlock(genCode);
};

/**
 * Parses an App Inventor List block that:
 * Adds the given items to the end of the list.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListAddItemBlock = function (listBlock) {
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var item = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  if (item.slice(-2) == ";\n") {
    item = item.slice(0, -2);
  }
  code = Blockly.Java.genJBridgeListsAddItemBlock(listName, item);
  if (listBlock.childBlocks_.length > 2) {
    for (var x = 2, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
      code = code + Blockly.Java.parseBlock(childBlock);
    }
  }
  return code;
};

/**
 * Parses blocks to then generate java code list.contains(object)
 * in .getJBridgeListContainsBlock
 *
 * @params {String} listBlock
 * @returns {String} code generated if no errors from .getJBridgeListContainsBlock
 */
Blockly.Java.parseJBridgeListContainsBlock = function (listBlock) {
  var object = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Java.getJBridgeListContainsBlock(object, listName);
};

/**
 * Parses an App Inventor List block that:
 * Picks an item at random from the list.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListPickRandomItem = function (listBlock) {
  var randomObjName = "random";
  if (!jBridgeVariableDefinitionMap[randomObjName]) {
    jBridgeVariableDefinitionMap[randomObjName] = "Random";
    jBridgeInitializationList.push(randomObjName + " = new Random();");
    jBridgeImportsMap[randomObjName] = "import java.util.Random;";
  }
  var code = "";
  if (listBlock.childBlocks_[0].category == "Lists") {
    var listCode = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
    var listName = "";
    if (listBlock.childBlocks_[0].comment != undefined && listBlock.childBlocks_[0].comment.text_ != undefined) {
      listName = listBlock.childBlocks_[0].comment.text_;
    } else {
      listName = Blockly.Java.createListName(listBlock);
    }

    if (jBridgeParsingEventMethod == true) {
      //setting up a new list will happen before picking an item
      jBridgeEventMethodSetupCode += listCode;
    } else {
      jBridgeInitializationList += listCode
    }
    code += listName + ".get(" + randomObjName + ".nextInt(" + listName + ".size())" + ")";
  } else {
    var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
    code += listName + ".get(" + randomObjName + ".nextInt(" + listName + ".size())" + ")";
  }
  return code;
};

/**
 * Parses an App Inventor List block that:
 * If list has no items, returns true; otherwise, returns false.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListIsEmpty = function (listBlock) {
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += listName + ".isEmpty()";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Returns the position of the thing in the list.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListPositionIn = function (listBlock) {
  var code = "";
  var thing = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  code += listName + ".indexOf(" + thing + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Inserts an item into the list at the given position
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListInsertItem = function (listBlock) {
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  var item = Blockly.Java.parseBlock(listBlock.childBlocks_[2]);
  code += listName + ".add(" + index + " - 1, " + item + ");";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Inserts replacement into the given list at position index.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListReplaceItem = function (listBlock) {
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  var replacement = Blockly.Java.parseBlock(listBlock.childBlocks_[2]);
  code += listName + ".set(" + index + " - 1, " + replacement + ");";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Removes the item at the given position.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListRemoveItem = function (listBlock) {
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  code += listName + ".remove(" + index + " - 1);";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Removes the item at the given position.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListAppendList = function (listBlock) {
  var code = "";
  var list1 = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var list2 = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  //if appending an empty list
  if (listBlock.childBlocks_[1].type == "lists_create_with") {
    code += list2;
    code += list1 + ".add(" + listBlock.childBlocks_[1].getCommentText() + ");";
  } else {
    code += list1 + ".addAll(" + list2 + ");";
  }
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Makes a copy of a list
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListCopyList = function (listBlock) {
  var code = "";

  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  if (listBlock.childBlocks_[0].type == "lists_create_with") {
    var listcode = listName;
    //the comment.text_ will be set when parsing a create block
    listName = listBlock.childBlocks_[0].comment.text_;
    jBridgeInitializationList.push(listcode);
  }
  code += "new ArrayList<Object>(" + listName + ");";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Interprets the list as a row of a table and returns a CSV (comma-separated value) text representing the row.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListToCSVRow = function (listBlock) {
  //defines the toCSV() method in the class
  jBridgeEventMethodsList.push(toCSVMethod);
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += "toCSV(" + listName + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Interprets the list as a table in row-major format and returns a CSV (comma-separated value) text representing the table.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListToCSVTable = function (listBlock) {
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += "toCSVTable(" + listName + ")";
  return code;
};

/**
 *  Generates java code list.add(object) from parsed blocks
 *
 * @params {String} listName
 * @params {String} addItem
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeListsAddItemBlock = function (listName, addItem) {
  addItem = Blockly.Java.removeColonsAndNewlines(addItem);
  var code = listName
    + ".add("
    + addItem
    + "); \n";
  return code;
};

/**
 * Generates java code for a new ArrayList of type Object
 * The List is of type "Object" because App Inventor lists take many types
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeNewList = function (type) {
  var code = "new " + TYPE_JAVA_ARRAYLIST + "();\n";
  return code;
};

/**
 * Generates java code list.get(index-1) from parsed blocks
 *
 * @params {String} listName
 * @params {String} index
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeListSelectItemBlock = function (listName, index) {
  var code = listName + ".get(" + index + " - 1)";
  return code;
};

/**
 *  Generates code list.size()
 *
 * @params {String} listName
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeListLengthBlock = function (listName) {
  var code = listName + ".size()";
  return code;
};

Blockly.Java.genJBridgeListIsListBlock = function (genCode) {
  var code = "(("
    + genCode
    + ")"
    + " instanceof ArrayList<?>"
    + ")";
  return code;
};

/**
 *  Generates java code list.contains(object) from parsed blocks
 *
 * @params {String} object
 * @params {String} listName
 * @returns {String} code generated if no errors
 */
Blockly.Java.getJBridgeListContainsBlock = function (object, listName) {
  var code = listName
    + ".contains("
    + object
    + ")";
  return code;
};

/**
 *  Creates a unique list name
 */
Blockly.Java.createListName = function (listBlock) {
  var parentName = Blockly.Java.findParentListName(listBlock);
  var listName = parentName + "SubList";

  //append a number at the end of a list whose name is already used
  if (jBridgeListNames.indexOf(listName) >= 0) {
    var count = 0;
    for (var nameIndex in jBridgeListNames) {
      if (jBridgeListNames[nameIndex] == listName) {
        count++;
      }
    }
    listName = listName + count;
  }

  jBridgeListNames.push(listName);
  return listName;
};

/**
 * Will find the name of the parent of the given block.
 * Looks at:
 * listBlock.parentBlock_.getFieldValue('NAME').
 * listBlock.parentBlock_.getCommentText()
 *
 * Used when naming a new list
 * @param listBlock The block to find the parent name of
 * @return the parent Name of the given listBlock
 */
Blockly.Java.findParentListName = function (listBlock) {
  var parentName = "";
  while (listBlock.parentBlock_ != undefined) {
    if (listBlock.parentBlock_.getFieldValue('NAME') != undefined) {
      parentName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "");
      break;
    } else if (listBlock.parentBlock_.getFieldValue('VAR') != undefined) {
      parentName = listBlock.parentBlock_.getFieldValue('VAR').replace("global ", "");
      break;
    } else if (listBlock.parentBlock_.getCommentText() != '') {
      parentName = listBlock.parentBlock_.getCommentText();
      break;
    }
    listBlock = listBlock.parentBlock_;
  }
  return parentName;
};