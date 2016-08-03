// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2012 Massachusetts Institute of Technology. All rights reserved.

/**
 * @fileoverview Helper functions for generating Java for blocks.
 * @author andrew.f.mckinney@gmail.com (Andrew F. McKinney)
 * @author sharon@google.com (Sharon Perl)
 */

'use strict';

goog.provide('Blockly.Java');

goog.require('Blockly.Generator');

Blockly.Java = new Blockly.Generator('Java');

/**
 * List of illegal variable names. This is not intended to be a security feature.  Blockly is 
 * 100% client-side, so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * 
 * TODO: fill this in or remove it.
 * @private
 */
Blockly.Java.RESERVED_WORDS_ = '';

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/Yail/Reference/Operators/Operator_Precedence
 */
Blockly.Java.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Java.ORDER_NONE = 99;          // (...)

Blockly.Java.YAIL_ADD_COMPONENT = "(add-component ";
Blockly.Java.YAIL_ADD_TO_LIST = "(add-to-list ";
Blockly.Java.YAIL_BEGIN = "(begin ";
Blockly.Java.YAIL_CALL_COMPONENT_METHOD = "(call-component-method ";
Blockly.Java.YAIL_CALL_COMPONENT_TYPE_METHOD = "(call-component-type-method ";
Blockly.Java.YAIL_CALL_YAIL_PRIMITIVE = "(call-yail-primitive ";
Blockly.Java.YAIL_CLEAR_FORM = "(clear-current-form)";
// The lines below are complicated because we want to support versions of the
// Companion older then 2.20ai2 which do not have set-form-name defined
Blockly.Java.YAIL_SET_FORM_NAME_BEGIN = "(try-catch (let ((attempt (delay (set-form-name \"";
Blockly.Java.YAIL_SET_FORM_NAME_END = "\")))) (force attempt)) (exception java.lang.Throwable 'notfound))";
Blockly.Java.YAIL_CLOSE_COMBINATION = ")";
Blockly.Java.YAIL_CLOSE_BLOCK = ")\n";
Blockly.Java.YAIL_COMMENT_MAJOR = ";;; ";
Blockly.Java.YAIL_COMPONENT_REMOVE = "(remove-component ";
Blockly.Java.YAIL_COMPONENT_TYPE = "component";
Blockly.Java.YAIL_DEFINE = "(def ";
Blockly.Java.YAIL_DEFINE_EVENT = "(define-event ";
Blockly.Java.YAIL_DEFINE_FORM = "(define-form ";
Blockly.Java.YAIL_DO_AFTER_FORM_CREATION = "(do-after-form-creation ";
Blockly.Java.YAIL_DOUBLE_QUOTE = "\"";
Blockly.Java.YAIL_FALSE = "#f";
Blockly.Java.YAIL_FOREACH = "(foreach ";
Blockly.Java.YAIL_FORRANGE = "(forrange ";
Blockly.Java.YAIL_GET_COMPONENT = "(get-component ";
Blockly.Java.YAIL_GET_PROPERTY = "(get-property ";
Blockly.Java.YAIL_GET_COMPONENT_TYPE_PROPERTY = "(get-property-and-check  ";
Blockly.Java.YAIL_GET_VARIABLE = "(get-var ";
Blockly.Java.YAIL_AND_DELAYED = "(and-delayed ";
Blockly.Java.YAIL_OR_DELAYED = "(or-delayed ";
Blockly.Java.YAIL_IF = "(if ";
Blockly.Java.YAIL_INIT_RUNTIME = "(init-runtime)";
Blockly.Java.YAIL_INITIALIZE_COMPONENTS = "(call-Initialize-of-components";
Blockly.Java.YAIL_LET = "(let ";
Blockly.Java.YAIL_LEXICAL_VALUE = "(lexical-value ";
Blockly.Java.YAIL_SET_LEXICAL_VALUE = "(set-lexical! ";
Blockly.Java.YAIL_LINE_FEED = "\n";
Blockly.Java.YAIL_NULL = "(get-var *the-null-value*)";
Blockly.Java.YAIL_EMPTY_LIST = "'()";
Blockly.Java.YAIL_OPEN_BLOCK = "(";
Blockly.Java.YAIL_OPEN_COMBINATION = "(";
Blockly.Java.YAIL_QUOTE = "'";
Blockly.Java.YAIL_RENAME_COMPONENT = "(rename-component ";
Blockly.Java.YAIL_SET_AND_COERCE_PROPERTY = "(set-and-coerce-property! ";
Blockly.Java.YAIL_SET_AND_COERCE_COMPONENT_TYPE_PROPERTY = "(set-and-coerce-property-and-check! ";
Blockly.Java.YAIL_SET_SUBFORM_LAYOUT_PROPERTY = "(%set-subform-layout-property! ";
Blockly.Java.YAIL_SET_VARIABLE = "(set-var! ";
Blockly.Java.YAIL_SET_THIS_FORM = "(set-this-form)\n ";
Blockly.Java.YAIL_SPACER = " ";
Blockly.Java.YAIL_TRUE = "#t";
Blockly.Java.YAIL_WHILE = "(while ";
Blockly.Java.YAIL_LIST_CONSTRUCTOR = "*list-for-runtime*";

Blockly.Java.SIMPLE_HEX_PREFIX = "&H";
Blockly.Java.YAIL_HEX_PREFIX = "#x";

// permit leading and trailing whitespace for checking that strings are numbers
Blockly.Java.INTEGER_REGEXP = "^[\\s]*[-+]?[0-9]+[\\s]*$";
Blockly.Java.FLONUM_REGEXP = "^[\\s]*[-+]?([0-9]*)((\\.[0-9]+)|[0-9]\\.)[\\s]*$";


Blockly.Java.JBRIDGE_BASE_IMPORTS = "import com.google.appinventor.components.runtime.HandlesEventDispatching; \nimport com.google.appinventor.components.runtime.EventDispatcher; \nimport com.google.appinventor.components.runtime.Form; \nimport com.google.appinventor.components.runtime.Component; \n";
Blockly.Java.JBRIDGE_PACKAGE_NAME = "\npackage org.appinventor; \n";

// Blockly.Java.JBRIDGE_DECLARE = [];
// Blockly.Java.JBRIDGE_DEFINE = [];
// Blockly.Java.JBRIDGE_IMPORTS = [];
var jBridgeTopBlockCodesList = [];
var jBridgeRegisterEventMap = new Object();
var eventMethodParamListings = new Object();
var jBridgeEventsList = [];
//mapping the variable names to their types
var jBridgeVariableDefinitionMap = new Object();
var jBridgeInitializationList = [];
var jBridgeComponentMap = new Object();
var JBRIDGE_COMPONENT_SKIP_PROPERTIES = ["Uuid", "$Version", "TextAlignment"]; //properties to skip when reading Json File
var JBRIDGE_JSON_TEXT_PROPERTIES = ["Title", "Text", "BackgroundImage", "Image", "Icon", "Source", "Picture", "Hint", "Action", "ActivityClass", "ActivityPackage", "ServiceURL", "Country", "Language"]; //Properties that should include the double qoutes "" in the output JBridge Javacode
var jBridgeImportsMap = new Object();
var jBridgeProceduresMap = new Object();
var jBridgeEventMethodsList = [];
var jBridgeIsIndividualBlock = false; // is to Identify if a block is Iduvidal root block or sub-block
var jBridgeCurrentScreen;
var JBRIDGE_COMPONENT_TEXT_PROPERTIES = ["text", "picture", "source"];

var jBridgePermissionToAdd = new Object; //this should be a set
var jBridgeIntentsToAdd = new Object; // this should be a set
var jBridgeAndroidPermisions = new Object();
var jBridgeAndroidIntents = new Object();
var jBridgeMethodAndTypeToPermisions = new Object();

//predefined helper methods to be declared if used
var toCSVMethod = "\npublic String toCSV(ArrayList<Object> originalList){\nStringBuilder stringBuilder = new StringBuilder();\nfor (int i=0;i < originalList.size(); i++){\nObject elem = originalList.get(i);\nstringBuilder.append(elem.toString());\nif (i < originalList.size()-1){\nstringBuilder.append(\", \");\n}\n}\nreturn stringBuilder.toString();\n}";

/*** Type cast Map start ***/
var paramTypeCastMap = new Map();
paramTypeCastMap.set("BackgroundColor", ["((Float)XXX).intValue()"]);
paramTypeCastMap.set("DrawLine", ["(XXX instanceof Integer)? Integer.parseInt(String.valueOf(XXX)) : ((Float)XXX).intValue()", "(XXX instanceof Integer)? Integer.parseInt(String.valueOf(XXX)) : ((Float)XXX).intValue()", "(XXX instanceof Integer)? Integer.parseInt(String.valueOf(XXX)) : ((Float)XXX).intValue()", "(XXX instanceof Integer)? Integer.parseInt(String.valueOf(XXX)) : ((Float)XXX).intValue()"]);
paramTypeCastMap.set("DrawCircle", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "XXX", "XXX"]);
paramTypeCastMap.set("PhoneNumber", ["String.valueOf(XXX)"]);
paramTypeCastMap.set("Message", ["String.valueOf(XXX)"]);
paramTypeCastMap.set("PaintColor", ["Integer.parseInt(String.valueOf(XXX))"]);
paramTypeCastMap.set("GoToUrl", ["String.valueOf(XXX)"]);
paramTypeCastMap.set("Duration", ["((Calendar)XXX)", "((Calendar)XXX)"]);
paramTypeCastMap.set("TimerInterval", ["Integer.parseInt(String.valueOf(XXX))"]);
paramTypeCastMap.set("MoveTo", ["(double) XXX", "XXX"]);
paramTypeCastMap.set("Bounce", ["(int) XXX"]);

//Map of accepted Screen Properties and castings
var screenPropertyCastMap = new Map();
screenPropertyCastMap.set("Title", ["\"XXX\""]);
screenPropertyCastMap.set("AboutScreen", ["\"XXX\""]);
screenPropertyCastMap.set("AlignHorizontal", ["XXX"]);
screenPropertyCastMap.set("AlignVertical", ["XXX"]);
screenPropertyCastMap.set("AppName", ["\"XXX\""]);
screenPropertyCastMap.set("BackgroundColor", ["Integer.parseInt(\"XXX\", 16)"]);
screenPropertyCastMap.set("BackgroundImage", ["\"XXX\""]);
screenPropertyCastMap.set("Icon", ["\"XXX\""]);
screenPropertyCastMap.set("Scrollable", ["XXX"]);

var returnTypeCastMap = new Map();
returnTypeCastMap.set("TinyDB1.GetValue,responseMessage", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("TinyDB1.GetValue,members", ["(ArrayList<?>)XXX"]);
returnTypeCastMap.set("QuestionList", ["((ArrayList<?>)XXX)"]);
returnTypeCastMap.set("AnswerList", ["((ArrayList<?>)XXX)"]);
returnTypeCastMap.set("answer", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("resultsList", ["(ArrayList<?>)XXX"]);
returnTypeCastMap.set("title", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("cost", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("isbn", ["String.valueOf(XXX)"]);

var listTypeCastMap = new Map();
listTypeCastMap.set("bookItem", ["((ArrayList<?>)XXX)"]);
/*** Type cast Map end ***/

//Java Component Types
var TYPE_JAVA_ARRAYLIST = "ArrayList<Object>";

/**
 * Generate the Yail code for this blocks workspace, given its associated form specification.
 * 
 * @param {String} formJson JSON string describing the contents of the form. This is the JSON
 *    content from the ".scm" file for this form.
 * @param {String} packageName the name of the package (to put in the define-form call)
 * @param {Boolean} forRepl  true if the code is being generated for the REPL, false if for an apk
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.getFormJava = function(formJson, packageName, forRepl) {
  var jsonObject = JSON.parse(formJson); 
  var javaCode = [];
  javaCode.push(Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject));
  var prityPrintCode = Blockly.Java.prityPrintJBridgeCode(javaCode.join('\n'));
  return prityPrintCode;
};

/**
 * Retrieves JSON string and imports for project.
 *
 * @param {Sting} JSON topBlocks from the Blockly mainWorkspace
 * @param {String} jsonObject
 * @returns {String} the generated code
 */
Blockly.Java.genJBridgeCode = function(topBlocks, jsonObject){
  Blockly.Java.initAllVariables();
  Blockly.Java.parseJBridgeJsonData(jsonObject);
  Blockly.Java.parseTopBlocks(topBlocks);

  var code = Blockly.Java.JBRIDGE_PACKAGE_NAME + 
  Blockly.Java.JBRIDGE_BASE_IMPORTS +
  Blockly.Java.genComponentImport(jBridgeImportsMap)+
  Blockly.Java.genJBridgeClass(topBlocks);

  return code;  
};

/**
 * Instantiates variables needed for current java generation.
 */
Blockly.Java.initAllVariables = function(){
    jBridgeTopBlockCodesList = [];
    jBridgeRegisterEventMap = new Object();
    jBridgeEventsList = [];
    jBridgeVariableDefinitionMap = new Object();
    jBridgeInitializationList = [];
    jBridgeComponentMap = new Object();
    jBridgeImportsMap = new Object();
    jBridgeProceduresMap = new Object();
    jBridgeEventMethodsList = [];
};

/**
 * Retrieves JSON string and imports for project.
 *
 * @param {String} JSON Object that contains app inventor blocks
 */
Blockly.Java.parseJBridgeJsonData = function(jsonObject){
  var jsonProperties = jsonObject.Properties;
  jBridgeCurrentScreen = jsonProperties.$Name;
  //iterating over the screen component properties
  for (var prop in jsonProperties){
    if (jsonProperties[prop] !== undefined){
      if (Blockly.Java.hasTypeCastKey(prop, screenPropertyCastMap)){
        var castedValue = Blockly.Java.TypeCastOneValue(prop, jsonProperties[prop] ,screenPropertyCastMap);
        jBridgeInitializationList.push("this." + prop  + "(" + castedValue +");");
      }
    }
  }
  //parsing the lower level components (not including the "Screen" component)
  for(var i=0;i<jsonProperties.$Components.length;i++){
    Blockly.Java.parseJBridgeJsonComopnents(jsonProperties.$Components[i], "this");
  }
};

Blockly.Java.parseJBridgeJsonComopnents = function (componentJson, rootName){
  var name = componentJson.$Name;

  //Not sure y there are component with undefined name.
  // Assuiming if a component has no name, its not a valid component
  if(name == undefined){
    name = "this";
  }
  jBridgeComponentMap[name] = [];
  jBridgeComponentMap[name].push({"rootName":rootName});
  jBridgeComponentMap[name].push({"Type": componentJson.$Type});

  jBridgeVariableDefinitionMap[name] = componentJson.$Type;
  jBridgeImportsMap[componentJson.$Type] = "import com.google.appinventor.components.runtime."+componentJson.$Type+";"; 
  var newObj = name
               +" = new "
               +componentJson.$Type
               +"("
               +rootName
               +");";

  jBridgeInitializationList.push(newObj);  
  if(componentJson.$Type.toLowerCase() == "imagesprite"){
    jBridgeInitializationList.push(name +".Initialize();");  
  }
  var componentsObj = undefined;
  for (var key in componentJson) {
    if (JBRIDGE_COMPONENT_SKIP_PROPERTIES.indexOf(key) <= -1 
         && key != "$Name" && key != "$Type" && componentJson.hasOwnProperty(key)) {
      if(key == "$Components"){
        componentsObj = componentJson[key];
      }else{
        //Removing the $ sign on ceratin properties in the json file
        var printableKey = key;
        if (key.charAt(0) == "$"){
          printableKey = key.substring(1);
        }
        jBridgeComponentMap[name].push({printableKey:componentJson[key]})
        //Convert color code & lower case for boolean value
        var valueOfLowerCase =componentJson[key].toLowerCase();
        var printableValue =componentJson[key];
        //JSON value from height/width fill parent is -2
        if ((key == "Height" || key == "Width") && printableValue == "-2"){
            printableValue = "LENGTH_FILL_PARENT";
        }
        //Java Bridge requires integers
        if (Blockly.Java.isNumber(printableValue)){
            printableValue = Math.round(printableValue);
        }
        //casting the color to HEX
        if(componentJson[key].substring(0,2) == "&H" && componentJson[key].length == 10){
          printableValue ="0x"+componentJson[key].substring(2);
        }
        //for True and False properties 
        if(valueOfLowerCase == "true" || valueOfLowerCase == "false"){
              printableValue = valueOfLowerCase;
        }
        //for properties that require qoutes ""
        if(JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) > -1){
          printableValue = "\""+ printableValue.replace(/"/gi, "\'") +"\"";
        }
        jBridgeInitializationList.push(Blockly.Java.genJBridgeJsonComopnents(name, printableKey, printableValue));
      }
    }
  }
  //Assuming that $Components Property is always an array 
  if(componentsObj != undefined){
    for(var i=0;i<componentsObj.length;i++){
      Blockly.Java.parseJBridgeJsonComopnents(componentsObj[i], name);
    } 
  }
};

Blockly.Java.genJBridgeJsonComopnents = function (componentName, property, value){
var code = componentName
           +"."
           +property
           +"("
           +value
           +");"
return code;
};
/*
*/
Blockly.Java.parseComponentDefinition = function(jBridgeVariableDefinitionMap){
  var code = "";
  for (var key in jBridgeVariableDefinitionMap) {
      code = code 
             + Blockly.Java.genComponentDefinition(jBridgeVariableDefinitionMap[key], key)
             +"\n";
             Blockly.Java.addPermisionsAndIntents(jBridgeVariableDefinitionMap[key]);
  }
  return code;
};

 /**
  *  Generates the corresponding code for each component as "private [type] [name] ;
  *
  * @params{String}
  * @params{String}
  */
Blockly.Java.genComponentDefinition = function(type, name){
  var code = "private "
             + type
             + " "
             + name
             +";";
  return code;
};


Blockly.Java.genComponentImport = function(jBridgeImportsMap){
  var code = "";
  for (var key in jBridgeImportsMap) {
      code = code 
             + '\n' 
             + jBridgeImportsMap[key];
  }
  return code;
};

/**
 * Generates public class declarations, event handlers, and their corresponding public methods.
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeClass =  function (topBlocks){
  var code = "\npublic class Screen1 extends Form implements HandlesEventDispatching { \n"
    + Blockly.Java.parseComponentDefinition(jBridgeVariableDefinitionMap)
    + Blockly.Java.genJBridgeDefineMethod()
    + Blockly.Java.genJBridgeDispatchEvent()
    + Blockly.Java.genJBridgeEventMethods()
    + Blockly.Java.genJBridgeDefineProcedure(jBridgeProceduresMap)
    +"\n}\n";
  return code;
};

/**
 * Generates public class declarations, event handlers, and their corresponding public methods.
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */

Blockly.Java.genJBridgeEventsRegister = function(jBridgeRegisterEventMap){
  var registeredEvents = []
  for(var key in jBridgeRegisterEventMap){
      registeredEvents.push(jBridgeRegisterEventMap[key]);
  }
  return registeredEvents.join("\n");
};

/**
 * Generates protected void $define method
 *
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeDefineMethod =  function (){
 var code =  "\nprotected void $define() { \n"
  + jBridgeInitializationList.join("\n")
  + "\n"
  + Blockly.Java.genJBridgeEventsRegister(jBridgeRegisterEventMap)
  +"\n}";
    return code;
};


/**
 * Generates parameters for each method in project
 *
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeDispatchEvent = function(){
  var code = "\npublic boolean dispatchEvent(Component component, String componentName, String eventName, Object[] params){\n"
  + jBridgeTopBlockCodesList.join("\n")
  +"\n return false;"
  +"\n}";

  return code;
};

Blockly.Java.genJBridgeEventMethods = function(){
  var code = "";
  if (jBridgeEventMethodsList !== undefined){
      code =jBridgeEventMethodsList.join("\n") + "\n";
  }
  return code;
}

Blockly.Java.genJBridgeDefineProcedure = function(jBridgeProceduresMap){
  var code = "";
  for (var key in jBridgeProceduresMap) {
      code = code 
             + '\n' 
             + jBridgeProceduresMap[key];
  }
  return code;
};

Blockly.Java.parseTopBlocks = function (topBlocks){
    for (var x = 0, block; block = topBlocks[x]; x++) {
      jBridgeTopBlockCodesList.push(Blockly.Java.parseBlock(block));
    }
};

Blockly.Java.getJBridgeInstanceName = function(block){
  var name = block.instanceName;
  if (jBridgeCurrentScreen == name){
      name = "this";
  }
  return name;
};

/**
 * Parses the event block and calls another parse method that corresponds to their block
 * category (i.e. Colors, Variables, etc.)
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */

Blockly.Java.parseBlock = function (block){
  jBridgeIsIndividualBlock = false;
  var code = "";
  var blockCategory = block.category;
  if (blockCategory == "Component"){
      code = Blockly.Java.parseJBridgeComponentBlock(block);
  }else if (blockCategory == "Colors"){
    code = Blockly.Java.parseJBridgeColorBlock(block);
  }else if (blockCategory == "Variables"){
    code = Blockly.Java.parseJBridgeVariableBlocks(block);
  }else if(blockCategory == "Math"){
    code = Blockly.Java.parseJBridgeMathBlocks(block);
  }else if( blockCategory == "Logic"){
    code = Blockly.Java.parseJBridgeLogicBlocks(block);
  }else if (blockCategory == "Procedures"){
    code = Blockly.Java.parseJBridgeProceduresBlocks(block);
  }else if (blockCategory == "Control"){
    code = Blockly.Java.parseJBridgeControlBlocks(block);
  }else if (blockCategory == "Lists"){
    code = Blockly.Java.parseJBridgeListBlocks(block);
  }else if (blockCategory == "Text"){
    code = Blockly.Java.parseJBridgeTextTypeBlocks(block);
  }
  return code;
}

Blockly.Java.parseJBridgeControlBlocks = function(controlBlock){
  var code = "";
  var controlType = controlBlock.type;
  if(controlType == "controls_if"){
    code = Blockly.Java.parseJBridgeControlIfBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  }else if(controlType == "controls_forEach"){
    code = Blockly.Java.parseJBridgeControlForEachBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  }
  return code;

}
Blockly.Java.parseJBridgeControlIfBlock = function(controlIfBlock){
  // var conditions = [];
  // var ifElseStatements = [];
  // var ifStatement;
  // var elseStatement;
  var code = "";
  var elseCount = controlIfBlock.elseCount_;
  var elseIfCount = controlIfBlock.elseifCount_;
  var ifCondition = "";
  var ifStatement = "";
  if( controlIfBlock.childBlocks_[1].category == "Logic" || controlIfBlock.childBlocks_[1].type == "text_compare"){
    ifCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
    ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]);
  }else{
    ifCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]);
    ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);    
  }
  code =  Blockly.Java.genJBridgeControlIfBlock(ifCondition, ifStatement);  
  var index = 2 + (elseIfCount * 2);
  if(elseIfCount > 0){
    for(var i = 2; i < index; i = i + 2){
      var elseIfCondition = "";
      var elseIfStatement = "";
      if( controlIfBlock.childBlocks_[i+1].category == "Logic" || controlIfBlock.childBlocks_[1].type == "text_compare"){
        elseIfCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i+1]);
        elseIfStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i]);
      }else{
        elseIfCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i]);
        elseIfStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i+1]);    
      }
      code = code  
             + Blockly.Java.genJBridgeControlElseIfBlock(elseIfCondition, elseIfStatement);
    }
  }
  if(elseCount == 1){
    var elseStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[index]);
    code = code 
           + Blockly.Java.genJBridgeControlElseBlock(elseStatement);
  }
  for (var x = index+elseCount ; x < controlIfBlock.childBlocks_.length; x++){
    code = code 
           + Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x]);
  }

  return code;

  // conditions.push(Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]));
  // ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
  //   for(var x = 2; x < controlIfBlock.childBlocks_.length- elseCount; x++){
  //     if(x%2 == 0){
  //         conditions.push(Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x]));
  //       }
  //       else ifElseStatements.push(Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x  
  //     }
  //     if(elseCount>0) elseStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[controlIfBlock.childBlocks_.length-1]);
  //     return Blockly.Java.genJBridgeControlIfBlock(conditions, ifStatement, ifElseStatements, elseStatement);
};

Blockly.Java.parseJBridgeControlForEachBlock = function(controlForEachBlock){
  var code = "";
  var forList = Blockly.Java.parseBlock(controlForEachBlock.childBlocks_[0]);
  var forItem = controlForEachBlock.getFieldValue('VAR');
  var forStatement = Blockly.Java.parseBlock(controlForEachBlock.childBlocks_[1]);
  code = Blockly.Java.genJBridgeControlForEachBlock(forList, forItem, forStatement);
  return code;
};

Blockly.Java.genJBridgeControlForEachBlock = function(forList, forItem, forStatement){
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


Blockly.Java.genJBridgeControlIfBlock = function(condition, statement){
  //in the case that the condition is a method
  condition = Blockly.Java.removeColonsAndNewlines(condition);
  var code = "";
  code = "if("
         +condition
         +"){ \n"
         + statement
         + "\n} \n";

  return code;
};

Blockly.Java.genJBridgeControlElseIfBlock = function(condition, statement){
  //in the case that the condition is a method
  condition = condition.replace(/[;\n]*/g, "");
  var code = "";
  code = "else if("
         +condition
         +"){ \n"
         + statement
         + "\n} \n";
  return code;
};

Blockly.Java.genJBridgeControlElseBlock = function(statement){
  var code = "";
  code = "else { \n"
         + statement
         + "\n} \n";
  return code;
};

// Blockly.Java.genJBridgeControlIfBlock = function(conditions, ifStatement, ifElseStatements, elseStatement){
//   var code = "";
//   code += "if("+conditions[0]+")"
//        + "{\n" + ifStatement + "\n}\n";
//   for(var i = 1,j=0; i < ifElseStatements.length && j<i; j++,i++){
//       code += "else if("+conditions[i]+")\n"
//               + "{\n" + ifElseStatements[j] + "\n}\n";
//   }

//   if(elseStatement != undefined)
//   {
//     code += "else {"+ elseStatement+"\n}";
//   }
//   return code;
// };


Blockly.Java.parseJBridgeVariableBlocks = function (variableBlock){
var code = "";
  var componentType = variableBlock.type;
  if (componentType == "lexical_variable_set"){
      code = Blockly.Java.parseJBridgeVariableSetBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }else if(componentType == "lexical_variable_get"){
      code = Blockly.Java.parseJBridgeVariableGetBlock(variableBlock);
  }else if(componentType = "global_declaration"){
      code = Blockly.Java.parseJBridgeGlobalIntializationBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }
  return code;
};

Blockly.Java.parseJBridgeVariableGetBlock = function(variableGetBlock){
    var paramName = variableGetBlock.getFieldValue('VAR');
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Java.getJBridgeParentBlockFieldMap(variableGetBlock.parentBlock_, "component_event", "PARAMETERS");
    paramName = Blockly.Java.getJBridgeRelativeParamName(paramsMap, paramName);
    if(variableGetBlock.parentBlock_.type == "controls_if" && variableGetBlock.childBlocks_.length == 0 && variableGetBlock.parentBlock_.childBlocks_[0] == variableGetBlock){
      paramName = "((Boolean) " + paramName + ").booleanValue()";
    }
    return Blockly.Java.genJBridgeVariableGetBlock(paramName);
  };

Blockly.Java.genJBridgeVariableGetBlock = function(paramName){
  var code = paramName;
  return code;
};

//It itertates through all the parent to find the specific blockType and loads fieldName map
Blockly.Java.getJBridgeParentBlockFieldMap = function (block, blockType, fieldName){
  if(block != undefined && block != null && block.type == blockType){ 
      return Blockly.Java.getFieldMap(block, fieldName);  
  }
  if(block == null || block == undefined){
    return new Object();
  }
  return Blockly.Java.getJBridgeParentBlockFieldMap(block.parentBlock_, blockType, fieldName);
};

Blockly.Java.parseJBridgeVariableSetBlock = function(variableSetBlock){
    var code = "";
    var leftValue = variableSetBlock.getFieldValue("VAR");
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Java.getJBridgeParentBlockFieldMap(variableSetBlock.parentBlock_, "component_event", "PARAMETERS");
    leftValue = Blockly.Java.getJBridgeRelativeParamName(paramsMap, leftValue);

    var rightValue = "";
    for(var x = 0, childBlock; childBlock = variableSetBlock.childBlocks_[x]; x++){
        var data = Blockly.Java.parseBlock(childBlock);
        rightValue = rightValue 
                     + data;
        if (jBridgeIsIndividualBlock){
           code = code + "\n" + data;
        }else {
          if(childBlock.type == "component_method"){
            var method = childBlock.instanceName + "." + childBlock.methodName;
            if(childBlock.childBlocks_.length > 0){
              var param1 = Blockly.Java.parseBlock(childBlock.childBlocks_[0]);
              if(param1.slice(0,1) == "\"" && param1.slice(-1) == "\""){
                param1 = param1.slice(1,-1);
              }
              method = method + "," + param1; 
            }
            if(Blockly.Java.hasTypeCastKey(method, returnTypeCastMap)){
              rightValue = Blockly.Java.TypeCastOneValue(method, rightValue, returnTypeCastMap);
            }
          }else if(Blockly.Java.hasTypeCastKey(leftValue, returnTypeCastMap)){
              rightValue = Blockly.Java.TypeCastOneValue(leftValue, rightValue, returnTypeCastMap);
          }
          code = code + Blockly.Java.genJBridgeVariableIntializationBlock(leftValue, rightValue);
        }
    }
    return code;
  };


Blockly.Java.parseJBridgeComponentBlock = function(componentBlock){
  var code = "";
  var componentType = componentBlock.type;
  if (componentType == "component_event"){
       code = Blockly.Java.parseJBridgeEventBlock(componentBlock);
  }else if (componentType == "component_set_get"){
      if (componentBlock.setOrGet == "set"){
          code = Blockly.Java.parseJBridgeSetBlock(componentBlock);
          jBridgeIsIndividualBlock = true;
      }else{
          code = Blockly.Java.parseJBridgeGetBlock(componentBlock);
      }
  }else if (componentType == "component_method" ){
    code = Blockly.Java.parseJBridgeMethodCallBlock(componentBlock);
    Blockly.Java.addPermisionsAndIntents(componentBlock.methodName);
    //ParentBlock is set block and the first child block of parent is currentBlock, then this is arg in the parent's block
    if((componentBlock.parentBlock_.type == "component_set_get" && componentBlock.parentBlock_.setOrGet == "set" && componentBlock.parentBlock_.childBlocks_[0] == componentBlock) 
      || (componentBlock.parentBlock_.type =="text_join") 
      || (componentBlock.parentBlock_.type =="component_method" && Blockly.Java.checkInputName(componentBlock.parentBlock_, "ARG") && componentBlock.parentBlock_.childBlocks_[0] == componentBlock)
      || (componentBlock.parentBlock_.type =="lexical_variable_set")){
      jBridgeIsIndividualBlock = false;
      if(code.slice(-2) == ";\n"){
        code = code.slice(0, -2);
      }
    }
    else{
      jBridgeIsIndividualBlock = true;
    }
  }else if (componentType == "component_component_block"){
    code = Blockly.Java.parseJBridgeComponentComponentBlock(componentBlock);
  }else{
    code =  "Invalid Component type : " + componentType ;
  }

  return code;
};

Blockly.Java.parseJBridgeMethodCallBlock = function(methodCallBlock){
  var objectName = methodCallBlock.instanceName;
  var methodName = methodCallBlock.methodName;
  var parentParamMap = Blockly.Java.getFieldMap(methodCallBlock.parentBlock_, "PARAMETERS");
  var test = methodCallBlock.parentBlock_.getFieldValue("ARG0");
  var paramsList = [];
  var code = "";
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = methodCallBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Java.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }
  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
  }
  if(objectName == "TinyWebDB1" && methodName == "StoreValue"){
    var YailList = "YailList";
    if(!jBridgeImportsMap[YailList]){
      jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
    }
    jBridgeParamList[1] = "YailList.makeList(" + jBridgeParamList[1] + ")";
  }
  if(Blockly.Java.hasTypeCastKey(methodName, paramTypeCastMap)){
    jBridgeParamList = Blockly.Java.TypeCast(methodName, jBridgeParamList, paramTypeCastMap);
  }
  code = Blockly.Java.genJBridgeMethodCallBlock(objectName ,methodName, jBridgeParamList) + "\n" + code;
  return code;
};




/**
 *This function identifies if the param is a global variable or functional variable
 *and returns the appropriate name
 *
 * @param {String} paramsMap
 * @param {String} paramName is the name of the parameter
 * @returns {String} params[index]
 */
Blockly.Java.getJBridgeRelativeParamName = function(paramsMap, paramName){
    var paramIndex = paramsMap[paramName];
    if ( paramIndex == undefined ){
      //check for "global " keyword in param name and remove it
      if( paramName.substring(0,7) == "global "){
        paramName = paramName.replace("global ", "");
      }
      return paramName;
    }
    return paramName;
};

/**
 * Populates a map in which the "keys" are the fieldName given by the 
 * block, and the "values" are the index of those fieldName values in the params[] java object.
 * @param block The block containing the paramters
 * @param fieldName the field name from the block
 * */
Blockly.Java.getFieldMap = function(block, fieldName){
  var fieldMap = new Object();
  if(block.inputList != undefined){
    for (var x = 0, input; input = block.inputList[x]; x++) {
      var fieldIndex = 0;
      if(input.name == fieldName){
        for (var y = 0, field; field = input.fieldRow[y]; y++){
          var fieldName = field.getText();
          if (fieldName.replace(/ /g,'').length > 0){
              eventMethodParamListings[fieldName] = fieldIndex;
              fieldMap[fieldName] = fieldIndex;
              fieldIndex ++;
          }
        }  
      }
    }
  }
  return fieldMap;
};

Blockly.Java.checkInputName = function(block, inputName){
  if(block.inputList != undefined){
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if(input.name.slice(0, inputName.length) == inputName){
          return true;
      }
    }
  }
  return false;
};

Blockly.Java.hasTypeCastKey = function(key, typeCastMap){
  if(typeCastMap.has(key)){
    return true;
  }
  return false;
};

Blockly.Java.getTypeCastValue = function(key, typeCastMap){
  if(typeCastMap.has(key)){
  return typeCastMap.get(key);
  }
  return null;
};

Blockly.Java.TypeCast = function(key, paramList, typeCastMap){
  var v = Blockly.Java.getTypeCastValue(key, typeCastMap);
  if(key == "Duration"){
    jBridgeImportsMap[key] = "import java.util.Calendar;";
  }
  var resultList = [];
  if (v != null && paramList.length > 0){
    for(var i = 0, param; param = paramList[i]; i++){
      if(Blockly.Java.isNumber(param)){
        resultList.push(Math.round(param));
      }else{
        resultList.push(v[i].replace(/XXX/g, param));
      }
    }
  }
  return resultList;
};

/**
 * Will cast the value if the key is contained in the typeCastMap.
 * Will cast floats to whole integers and cast types in paramTypeCastMap
 * @param key The key in the cast map
 * @param value The value to be casted
 * @param typeCastMap The type cast map
 * @return The casted value
 * */
Blockly.Java.TypeCastOneValue = function(key, value, typeCastMap){
  var v = Blockly.Java.getTypeCastValue(key, typeCastMap);
  var result = "";
  if (v != null){
    if(Blockly.Java.isNumber(value)){
      //Java bridge library requires ints/doubles over floats
      result = Math.round(value);
    }else{
      if (value === "True" || value == "False"){
          value = value.toLowerCase();
      }
      result = v[0].replace("XXX", value);
    }
  }
  //casting the color to HEX
  if(value.substring(0,2) === "&H" && value.length === 10){
    result = "0x" + value.substring(2);
  }
  return result;
};

Blockly.Java.getFieldList = function(block, fieldName){
  var fieldsList = [];
  if(block.inputList != undefined){
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if(input.name == fieldName){
        for (var y = 0, field; field = input.fieldRow[y]; y++){
          var fieldName = field.getText();
          if (fieldName.replace(/ /g,'').length > 0){
              fieldsList.push(fieldName);
          }
        }  
      }
    }
  }
  return fieldsList;
};

Blockly.Java.getProcName = function(block, inputName, fieldName){
  var procName ="";
  for (var x = 0, input; input = block.inputList[x]; x++) {
    if(input.name == inputName){
      for (var y = 0, field; field = input.fieldRow[y]; y++){
        if(field.name == fieldName){
          procName = field.text_;
        }
      }
    }
  }
  return procName;
};

Blockly.Java.genJBridgeMethodCallBlock = function(objectName, methodName, paramsList){
var code = "";
// use splice to get all the arguments after 'methodName'
var args = Array.prototype.splice.call(arguments, 2);
code = objectName
       + "."
       +methodName
       +"("
       + paramsList.join(", ")
       +");"

return code;
};

Blockly.Java.parseJBridgeColorBlock = function(colorBlock){
  // TOOD Fix the copy pasted or duplicated color palette block 
  var color = colorBlock.type.toUpperCase();
  return Blockly.Java.genJBridgeColorBlock(color);
};

Blockly.Java.genJBridgeColorBlock = function(color){
    return color;
};

Blockly.Java.parseJBridgeGetBlock = function(getBlock){
  var componentName = Blockly.Java.getJBridgeInstanceName(getBlock);
  var property = getBlock.propertyName;
  return Blockly.Java.genJBridgeGetBlock(componentName, property);
};

Blockly.Java.genJBridgeGetBlock = function(componentName, property){
  var code = componentName
             +"."
             +property
             +"()";
  return code;
};

Blockly.Java.parseJBridgeSetBlock = function(setBlock){
  var componentName = Blockly.Java.getJBridgeInstanceName(setBlock);
  var property = setBlock.propertyName;
  var ListPicker = "ListPicker";
  var YailList = "YailList";
  var value = "";
  var code = "";
  for (var x = 0, childBlock; childBlock = setBlock.childBlocks_[x]; x++) {
    var genCode = Blockly.Java.parseBlock(childBlock);
     if(jBridgeIsIndividualBlock){
        code = code + genCode + "\n";
      }else{
        value = value + genCode;
      }
  }
  //If value is not already a string, apply String.valueOf(value)
  if(JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(property.toLowerCase()) > -1){
    value = "String.valueOf(" + value + ")";
       
  }


  if((componentName.slice(0, ListPicker.length) == ListPicker) && (property == "Elements")){
    if(!jBridgeImportsMap[YailList]){
      jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
    }
    value = "YailList.makeList(" + value + ")";  
  }
  if(Blockly.Java.hasTypeCastKey(property, paramTypeCastMap)){
      value = Blockly.Java.TypeCastOneValue(property, value, paramTypeCastMap);
  }else if (Blockly.Java.isNumber(value)){
      //Java Bridge requires integers, floating point numbers will throw an exception
      value = Math.round(value);
  }
  code = Blockly.Java.genJBridgeSetBlock(componentName, property, value) + "\n" + code;
  return code;
};

Blockly.Java.genJBridgeSetBlock = function(componentName, property, value){
  var code = componentName
             +"."
             +property
             +"("
             +value
             +");";
  return code;
};

// Blockly.Java.paseJBridgeEventBlock = function(eventBlock){
//   var code = "";
//   var eventName = eventBlock.eventName;
//   var componentName = eventBlock.instanceName;

//   code = Blockly.Java.parseJBridgeEventBlock(eventBlock);

//   //Add to RegisterEventsMap
//   jBridgeRegisterEventMap[eventName] = Blockly.Java.genJBridgeEventDispatcher(eventName); 

//   return code;
// };


/**
 * Parses each event block
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.parseJBridgeEventBlock = function(eventBlock, isChildBlock){
  var code = "";
  isChildBlock = typeof isChildBlock !== 'undefined' ? isChildBlock : false;
  var componentName = eventBlock.instanceName;
  var eventName = eventBlock.eventName;
  var body = "";
  //reset the event method params from the last event method generation
  eventMethodParamListings = new Object();
  for (var x = 0, childBlock; childBlock = eventBlock.childBlocks_[x]; x++) {
      body = body 
             + "\n"
             + Blockly.Java.parseBlock(childBlock);
  }
  //This is to handle the if the component is the Screen Object
  if(componentName == jBridgeCurrentScreen){
    componentName = "this";
  }
  code = Blockly.Java.genJBridgeEventBlock(componentName, eventName, body);

  //Add to RegisterEventsMap
  jBridgeRegisterEventMap[eventName] = Blockly.Java.genJBridgeEventDispatcher(eventName); 

  return code;
};

/**
 * Generates the listener within the dispatchEvent method for each component that is used and
 * their corresponding parameters.
 *
 * @param {String} componentName is the name of the component passed in
 * @param {String} eventName is the name of the event being currently handled
 * @param {String} body
 * @returns {String} the generated code if there were no errors.
 */
//Event Blocks are actualy the "When Blocks"
Blockly.Java.genJBridgeEventBlock = function(componentName, eventName, body){
  var eventMethodName = componentName + eventName;
  var calledMethodParams = Blockly.Java.createCalledMethodParameterString(body);
  var code = "\nif( component.equals("+componentName+") && eventName.equals(\""+eventName+"\") ){\n"
    + eventMethodName + "(" + calledMethodParams + ");\n" //create event method
    +"return true;\n"
    +"}";
  Blockly.Java.addComponentEventMethod(eventMethodName, body);
  return code;
};

/**
 * Adds method names to list of methods that will be added to code at the end of block parsing
 *
 * @param {String} eventMethodName is the event that is being passed in
 * @param {String} body represents the entire code body within the project
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.addComponentEventMethod = function(eventMethodName, body){
  var stringParam = Blockly.Java.createMethodParameterString(body);
  var code = "\npublic void " + eventMethodName + "("+ stringParam +"){\n"
    + body
    + "\n}";
  jBridgeEventMethodsList.push(code);
}


 /** This method searches the body of the generated method for the dispatch event
 * parameters. If any parameters are used within the method then they must be passed in
 * as the method's parameter for use in the local scope
 * @param body The body of the generated event method
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.createMethodParameterString = function (body) {
    var parameters = [];
    if (body.search("component") >= 0) {
        parameters.push("Component component");
    }
    if (body.search("componentName") >= 0) {
        parameters.push("String componentName");
    }
    if (body.search("eventName") >= 0) {
        parameters.push("String eventName");
    }
    for (var paramName in eventMethodParamListings){
        if (body.search(paramName) >= 0){
            parameters.push("Object " + paramName);
        }
    }
    var stringParam = "";
    for (var i = 0; i < parameters.length; i++) {
        stringParam += parameters[i];
        //skip the comma at the end
        if (i !== parameters.length-1) {
            stringParam += ", ";
        }
    }
    return stringParam;
}

/**
 * Generates parameters for each method name within dispatchEvent
 *
 * @param {String} body that contains the entire code generation
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.createCalledMethodParameterString = function (body) {
    var parameters = [];
    if (body.search("component") >= 0) {
        parameters.push("component");
    }
    if (body.search("componentName") >= 0) {
        parameters.push("componentName");
    }
    if (body.search("eventName") >= 0) {
        parameters.push("eventName");
    }
    for (var paramName in eventMethodParamListings){
        if (body.search(paramName) >= 0){
            parameters.push("params[" + eventMethodParamListings[paramName] + "]");
        }
    }
    var stringParam = "";
    for (var i = 0; i < parameters.length; i++) {
        stringParam += parameters[i];
        //skip the comma at the end
        if (i !== parameters.length-1) {
            stringParam += ", ";
        }
    }
    return stringParam;
}

Blockly.Java.genJBridgeEventDispatcher = function(eventName){
  return "EventDispatcher.registerEventForDelegation(this, \"" + eventName +"Event\", \""+ eventName +"\" );";
};

Blockly.Java.parseJBridgeMathBlocks = function(mathBlock){
  var code = "";
  var type = mathBlock.type;
  if( type == "math_number"){
    code = Blockly.Java.parseJBridgeMathNumberBlock(mathBlock);
  }else if(type == "math_random_int"){
    code = Blockly.Java.parseJBridgeMathRandomInt(mathBlock);
  }else if(type == "math_random_float"){
    code = Blockly.Java.parseJBridgeMathRandomFloatBlock(mathBlock);
  }else if(type == "math_add"){
    code = Blockly.Java.parseJBridgeMathAdd(mathBlock);
  }else if(type == "math_subtract"){
    code = Blockly.Java.parseJBridgeMathSubtract(mathBlock);
  }else if(type == "math_multiply"){
    code = Blockly.Java.parseJBridgeMathMultiply(mathBlock);
  }else if(type == "math_division"){
    code = Blockly.Java.parseJBridgeMathDivision(mathBlock);
  }else if(type == "math_compare"){
    code = Blockly.Java.parseJBridgeMathCompare(mathBlock);
  }else if(type == "math_atan2"){
    code = Blockly.Java.parseJBridgeMathAtan2(mathBlock);
  }
  return code;
};
Blockly.Java.parseJBridgeMathNumberBlock = function(mathBlock){
  var numberValue ;
  //Assuming numver value always in the fieldRow[0] in inputlist[0].
  numberValue = mathBlock.getFieldValue('NUM');
  return Blockly.Java.genJBridgeMathNumberBlock(numberValue);
};

Blockly.Java.parseJBridgeMathAdd = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    if(leftValue.slice(-7) == ".Text()"){
      leftValue = "Integer.parseInt(" + leftValue + ")";
    }
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    if(rightValue.slice(-7) == ".Text()"){
      rightValue = "Integer.parseInt(" + rightValue + ")";
    }
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "+");
};

Blockly.Java.parseJBridgeMathSubtract = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "-");
};

Blockly.Java.parseJBridgeMathMultiply = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "*");
};

Blockly.Java.parseJBridgeMathDivision = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "/");
};

Blockly.Java.parseJBridgeMathRandomInt = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathRandomInt(leftValue, rightValue);
};

//TODO try other alternatives for Random integer like "Random.randInt(min, max)"
Blockly.Java.genJBridgeMathRandomInt = function(leftValue, rightValue){
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

Blockly.Java.genJBridgeMathOperation = function(leftValue, rightValue, operand){
    var code = "(" 
               +leftValue
               + " "
               + operand
               + " "
               + rightValue
               + ")";
    return code;
};

Blockly.Java.genJBridgeMathNumberBlock= function(numberValue){
   var code="";
   code = numberValue;
   return code;
};

Blockly.Java.parseJBridgeGlobalIntializationBlock = function(globalBlock){
  var leftValue ;
  var rightValue ;

  leftValue = globalBlock.getFieldValue('NAME').replace("global ", "");
  rightValue = "";
  for(var x = 0, childBlock; childBlock = globalBlock.childBlocks_[x]; x++){
        rightValue = rightValue 
                     + Blockly.Java.parseBlock(childBlock);
  }

  jBridgeComponentMap[leftValue] = [];
  var childType = globalBlock.childBlocks_[0].category;
  var variableType = Blockly.Java.getValueType(childType, rightValue);  

  jBridgeComponentMap[leftValue].push({"Type" : variableType});
  jBridgeVariableDefinitionMap[leftValue] = variableType;


  jBridgeInitializationList.push(Blockly.Java.genJBridgeVariableIntializationBlock(leftValue, rightValue));
  
  return "";
};

/**
 * Returns whether the given value is a number or not
 * @param value The value to check
 * @return whether it is an int or not
 * */
Blockly.Java.isNumber = function(value){
  return !isNaN(value);
};

Blockly.Java.getValueType = function(childType, value){
  var variableType = "String";
  if (childType == "Math"){
    if(value.indexOf(".") != -1){
      variableType = "float";
    }else{
      variableType = "int";
    }
  }else if(childType == "Logic"){
    variableType = "boolean";
  }else if (childType == "Lists"){
    variableType = TYPE_JAVA_ARRAYLIST;
  }
  return variableType;
};

Blockly.Java.genJBridgeVariableIntializationBlock = function(leftValue, rightValue){
  var code = ""
  code = leftValue 
         + " = "
         + rightValue
         +";";
  return code
};

Blockly.Java.parseJBridgeLogicBlocks = function (logicBlock){
var code = "";
  var componentType = logicBlock.type;
  if (componentType == "logic_boolean"){
      code = Blockly.Java.parseJBridgeBooleanBlock(logicBlock);
  }else if (componentType == "logic_operation"){
      code = Blockly.Java.parseJBridgeLogicOperationBlock(logicBlock);
  }else if (componentType == "logic_false"){
      code = "false";
  }else if (componentType == "logic_compare"){
      code = Blockly.Java.parseJBridgeLogicCompareBlocks(logicBlock);
  }else if (componentType == "logic_negate"){
      code = Blockly.Java.parseJBridgeLogicNegateBlocks(logicBlock);
  }
  return code;
};
  
Blockly.Java.parseJBridgeBooleanBlock = function(logicBlock){
  var value = logicBlock.getFieldValue("BOOL");
  return Blockly.Java.genJBridgeBooleanBlock(value);
};

Blockly.Java.parseJBridgeLogicCompareBlocks = function(logicBlock){
  var operator = logicBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(logicBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(logicBlock.childBlocks_[1]);
  return Blockly.Java.genJBridgeLogicCompareBlock(leftValue, rightValue, Blockly.Java.getJBridgeOperator(operator));
};

Blockly.Java.parseJBridgeLogicNegateBlocks = function(logicBlock){
  var value = Blockly.Java.parseBlock(logicBlock.childBlocks_[0]);
  return Blockly.Java.genJBridgeLogicNegateBlock(value);
};


Blockly.Java.genJBridgeBooleanBlock = function(value){
  return value.toLowerCase();
};

Blockly.Java.genJBridgeLogicCompareBlock = function (leftValue, rightValue, operator){

  var code = leftValue
             + " "
             + operator
             + " "
             + rightValue;
  return code;
};

Blockly.Java.genJBridgeLogicNegateBlock = function (value){
  var code = "!("
           + value
           + ")";
  return code;
};

Blockly.Java.parseJBridgeProceduresBlocks = function(proceduresBlock){
  var code = "";
  var proceduresType = proceduresBlock.type;
  if(proceduresType == "procedures_defnoreturn"){
     code = Blockly.Java.parseJBridgeProcDefNoReturn(proceduresBlock);
  }else if(proceduresType == "procedures_callnoreturn"){
     code = Blockly.Java.parseJBridgeProcCallNoReturn(proceduresBlock);
  }
  jBridgeIsIndividualBlock = true;
  return code;
};

Blockly.Java.parseJBridgeProcDefNoReturn = function(proceduresBlock){
  var code = "";
  var procName = proceduresBlock.getFieldValue("NAME");
  var procParms = [];
  for (var x = 0, params; params = proceduresBlock.arguments_[x]; x++) {
    procParms.push("Object " + params);
  }
  var statementList = [];
  for (var x = 0, childBlock; childBlock = proceduresBlock.childBlocks_[x]; x++) {
    statementList.push(Blockly.Java.parseBlock(childBlock));
  }
  
  jBridgeProceduresMap[procName] = Blockly.Java.genJBridgeProcDefNoReturn(procName, procParms.join(", "), statementList.join("\n"));

  return code;
};

/**
 * Generates parameters for each method
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeProcDefNoReturn = function (procedureName, procedureParams, body){
  var code = "\npublic void " 
       + procedureName
       + "("
       + procedureParams 
       + "){\n"
       + body
       + "\n}"; 
  return code;
}

Blockly.Java.parseJBridgeProcCallNoReturn = function(proceduresBlock){
  var procName = proceduresBlock.getFieldValue("PROCNAME");
  var paramsList = [];
  var code = "";
  var parentParamMap = Blockly.Java.getFieldMap(proceduresBlock.parentBlock_, "PARAMETERS");
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = proceduresBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Java.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }

  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
  }

  return Blockly.Java.genJBridgeProcCallNoReturn(procName, jBridgeParamList) + "\n" + code;
};

Blockly.Java.genJBridgeProcCallNoReturn = function(procName, paramsList){
  var code = procName
             + "("
             + paramsList.join(",")
             +");";
  
  return code;
};

Blockly.Java.parseJBridgeTextTypeBlocks = function(textBlock){
  var code = "";
  var type = textBlock.type;
  if (type == "text"){
    code = Blockly.Java.parseJBridgeTextBlock(textBlock);
  }else if(type == "text_join"){
    code = Blockly.Java.parseJBridgeTextJoinBlock(textBlock);
  }else if(type == "text_changeCase"){
    code = Blockly.Java.parseJBridgeTextChangeCaseBlock(textBlock);
  }else if(type == "text_compare"){
    code = Blockly.Java.parseJBridgeTextCompareBlock(textBlock);
  }else if(type == "text_length"){
    code = Blockly.Java.parseJBridgeTextLengthBlock(textBlock);
  }else if(type == "text_isEmpty"){
    code = Blockly.Java.parseJBridgeTextisEmptyBlock(textBlock);
  }else if(type == "text_trim"){
    code = Blockly.Java.parseJBridgeTextTrimBlock(textBlock);
  }else if(type == "text_starts_at"){
    code = Blockly.Java.parseJBridgeTextStartsAtBlock(textBlock);
  }else if(type == "text_contains"){
    code = Blockly.Java.parseJBridgeTextContainsBlock(textBlock);
  }else if(type == "text_replace_all"){
    code = Blockly.Java.parseJBridgeTextReplaceAllBlock(textBlock);
  }else if(type == "text_split"){
    code = Blockly.Java.parseJBridgeTextSplitBlock(textBlock);
  }else if(type == "text_split_at_spaces"){
    code = Blockly.Java.parseJBridgeTextSplitAtSpacesBlock(textBlock);
  }else if(type == "text_segment"){
    code = Blockly.Java.parseJBridgeTextSegmentBlock(textBlock);
  }
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Extracts part of the text starting at start position and continuing for length characters.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextSegmentBlock = function(textBlock){
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
 * Parsing an App Inventor Text Block that:
 * Divides the given text at any occurrence of a space, producing a list of the pieces.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextSplitAtSpacesBlock = function(textBlock){
    var code = "";
    var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
    var splitAt = '"\\\\s+"';
    var textMethod = ".split(" + splitAt + ")";
    code += text + textMethod;
    return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Divides text into pieces using at as the dividing points and produces a list of the results.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextSplitBlock = function(textBlock){
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
 * Returns a new text string obtained by replacing all occurrences of the substring with the replacement.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextReplaceAllBlock = function(textBlock){
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
 * Returns true if piece appears in text; otherwise, returns false.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextContainsBlock = function(textBlock){
    var code = "";
    var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
    var piece = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
    var textMethod = ".contains(" + piece + ")";
    code += text + textMethod;
    return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns the character position where the first character of piece first appears in text
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextStartsAtBlock = function(textBlock){
    var code = "";
    var text = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
    var piece = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
    var textMethod = ".indexOf(" + piece + ")";
    code += text + textMethod;
    return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Removes any spaces leading or trailing the input string and returns the result.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextTrimBlock = function(textBlock){
    var code = "";
    var textMethod = ".trim()";
    var child = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
    code += child + textMethod;
    return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns whether or not the string contains any characters (including spaces). 
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextisEmptyBlock = function(textBlock){
    var code = "";
    var emptyMethod = ".isEmpty()";
    var child = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
    code += child + emptyMethod;
    return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns the number of characters including spaces in the string. This is the length of the given text string.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextLengthBlock = function(textBlock){
  var code = "";
  var sizeMethod = ".length()";
  var childType = textBlock.childBlocks_[0].type;
  var child = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  code = "(" + child + ")" + sizeMethod;
  return code;
};

/**
 * Parsing an App Inventor Text Block that:
 * Contains a text string.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextBlock = function(textBlock){
  var textData = textBlock.getFieldValue("TEXT");
  return Blockly.Java.genJBridgeTextBlock(textData);
};

/**
 * Parsing an App Inventor Text Block that:
 * Appends all of the inputs to make a single string. If no inputs, returns an empty string.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextJoinBlock = function(textBlock){
  var joinList = [];
  for (var y = 0, joinBlock; joinBlock = textBlock.childBlocks_[y]; y++){
    var genCode = Blockly.Java.parseBlock(joinBlock);
    joinList.push(genCode);
  }
  if (joinList.length == 0){
    return "";
  }
  else{
    return Blockly.Java.genJBridgeTextJoinBlock(joinList);
  }
};

/**
 * Parsing an App Inventor Text Block that:
 * Returns whether or not the first string is lexicographically <, >, or = the second string 
 * depending on which dropdown is selected.
 * @param textBlock The Text Block
 * @return The equivalent Java Bridge Code for the Block
 */
Blockly.Java.parseJBridgeTextCompareBlock = function(textBlock){
  var operator = textBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(textBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(textBlock.childBlocks_[1]);
  var op = Blockly.Java.getJBridgeOperator(operator) + " 0"; 
  return Blockly.Java.getJBridgeTextCompareBlock(leftValue, rightValue, op);
};

Blockly.Java.genJBridgeTextBlock = function(text){
  var code = "\""+text.replace(/"/gi, "\'")+"\"";
  return code;
};

Blockly.Java.genJBridgeTextJoinBlock = function(joinList){
  var code = "";

  for (var x = 0; x < joinList.length; x++){
    //if its the last item of joinList
    if(x == (joinList.length - 1)){
        if(typeof joinList[x] !== 'string'){
            code = code + "(String.valueOf(" + joinList[x] + "))";
        }
        else{
            code = code + joinList[x];
          }
    }
    else{
        if(typeof joinList[x] !== 'string'){
            code = code + "(String.valueOf(" + joinList[x] + "))" + "+";
         }
        else{
            code = code + joinList[x] + " + ";
          }
    }
  }
  return code;
};

Blockly.Java.getJBridgeTextCompareBlock = function(leftValue, rightValue, op){
  var code = "(String.valueOf("
           + leftValue
           + ").compareTo(String.valueOf("
           + rightValue
           + ")) "
           + op
           + ")";
  return code;
};

Blockly.Java.parseJBridgeListBlocks = function(listBlock){
  var code = "";
  var type = listBlock.type;
  var name = "ArrayList";
  jBridgeImportsMap[name] = "import java.util.ArrayList;";
  if( type == "lists_create_with"){
    code = Blockly.Java.parseJBridgeListsCreateWithBlock(listBlock);
  }else if (type == "lists_select_item"){
      code = Blockly.Java.parseJBridgeListSelectItemBlock(listBlock);
  }else if(type == "lists_length"){
      code = Blockly.Java.parseJBridgeListLengthBlock(listBlock);
  }else if(type == "lists_is_list"){
      code = Blockly.Java.parseJBridgeListIsListBlock(listBlock);
  }else if(type == "lists_add_items"){
      code = Blockly.Java.parseJBridgeListAddItemBlock(listBlock);
  }else if (type == "lists_is_in"){
      code = Blockly.Java.parseJBridgeListContainsBlock(listBlock);
  }else if (type == "lists_pick_random_item"){
      code = Blockly.Java.parseJBridgeListPickRandomItem(listBlock);
  }else if (type == "lists_is_empty"){
      code = Blockly.Java.parseJBridgeListIsEmpty(listBlock);
  }else if (type == "lists_position_in"){
      code = Blockly.Java.parseJBridgeListPositionIn(listBlock);
  }else if (type == "lists_insert_item"){
      code = Blockly.Java.parseJBridgeListInsertItem(listBlock);
  }else if (type == "lists_replace_item"){
      code = Blockly.Java.parseJBridgeListReplaceItem(listBlock);
  }else if (type == "lists_remove_item"){
      code = Blockly.Java.parseJBridgeListRemoveItem(listBlock);
  }else if (type == "lists_append_list"){
      code = Blockly.Java.parseJBridgeListAppendList(listBlock);
  }else if (type == "lists_copy"){
      code = Blockly.Java.parseJBridgeListCopyList(listBlock);
  }else if (type == "lists_to_csv_row"){
      code = Blockly.Java.parseJBridgeListToCSVRow(listBlock);
  }else if (type == "lists_to_csv_table"){
      code = Blockly.Java.parseJBridgeListToCSVTable(listBlock);
  }
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Interprets the list as a table in row-major format and returns a CSV (comma-separated value) text representing the table.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListToCSVTable = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += "toCSVTable(" + listName + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Interprets the list as a row of a table and returns a CSV (comma-separated value) text representing the row.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListToCSVRow = function(listBlock){
  //defines the toCSV() method in the class
  jBridgeEventMethodsList.push(toCSVMethod);
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += "toCSV(" + listName + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Interprets the list as a row of a table and returns a CSV (comma-separated value) text representing the row.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListToCSVRow = function(listBlock){
  //defines the toCSV() method in the class
  jBridgeEventMethodsList.push(toCSVMethod);
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += "toCSV(" + listName + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Makes a copy of a list
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListCopyList = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += "new ArrayList<Object>(" + listName + ");";
  return code;
};


/**
 * Parses an App Inventor List block that:
 * Removes the item at the given position.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListAppendList = function(listBlock){
  var code = "";
  var list1 = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var list2 = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  code += list1 + ".addAll(" + list2 + ");";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Removes the item at the given position.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListRemoveItem = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  code += listName + ".remove(" + index + " - 1);";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Inserts replacement into the given list at position index.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListReplaceItem = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  var replacement = Blockly.Java.parseBlock(listBlock.childBlocks_[2]);
  code += listName + ".set(" + index + " - 1, " + replacement + ");";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Inserts an item into the list at the given position
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListInsertItem = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  var item = Blockly.Java.parseBlock(listBlock.childBlocks_[2]);
  code += listName + ".add(" + index + " - 1, " + item + ");";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Returns the position of the thing in the list.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListPositionIn = function(listBlock){
  var code = "";
  var thing = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  code += listName + ".indexOf(" + thing + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * If list has no items, returns true; otherwise, returns false.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListIsEmpty = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += listName + ".isEmpty()";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Picks an item at random from the list.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListPickRandomItem = function(listBlock){
  var randomObjName = "random";
  if(!jBridgeVariableDefinitionMap[randomObjName]){
      jBridgeVariableDefinitionMap[randomObjName] = "Random";
      jBridgeInitializationList.push(randomObjName + " = new Random();");
      jBridgeImportsMap[randomObjName] = "import java.util.Random;";
  }
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  code += listName + ".get(" + randomObjName + ".nextInt(" + listName + ".size())" + ")";
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Adds the given items to the end of the list.
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListAddItemBlock = function(listBlock){
  var code = "";
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var item = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  if (item.slice(-2) == ";\n"){
    item = item.slice(0, -2);
  }
  code = Blockly.Java.genJBridgeListsAddItemBlock(listName, item);
  if(listBlock.childBlocks_.length > 2){
    for(var x = 2, childBlock; childBlock = listBlock.childBlocks_[x]; x++){
      code = code + Blockly.Java.parseBlock(childBlock);
    }
  }
  return code;
};

/**
 * Parses an App Inventor List block that:
 * Creates a list from the given blocks. 
 * @param listBlock The List block
 * @return The generated Java code
 */
Blockly.Java.parseJBridgeListsCreateWithBlock = function(listBlock){
   var code = "";
   var childType = "String";
   var listName = "[Unknown]";
   var parentName = "";
   var isChildList = false;
   if (listBlock.parentBlock_.getFieldValue('NAME') != undefined){
      listName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "");
   }else if(listBlock.parentBlock_.getFieldValue('VAR') != undefined){
      listName = listBlock.parentBlock_.getFieldValue('VAR').replace("global ", "");
   }else {
      isChildList = true;
      parentName = Blockly.Java.findParentListName(listBlock);
      listName = parentName + "SubList";
      //set list name as comment for next recursive block to use
      listBlock.setCommentText(listName);
   }
   for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
     var addItemData = Blockly.Java.parseBlock(childBlock);
     childType = Blockly.Java.getValueType(childBlock.type, addItemData);
     if(childType == "int"){
      childType = "Integer";
     }else if(childType == "float"){
      childType = "Float";
     }
     //if child block for list is another list, adds nested list contents outside of parent list ".add()"
     if (childBlock.type == "lists_create_with"){
       code += addItemData;
       //list.add(childListName). childListName is stored in the block's "comment text"
       code += Blockly.Java.genJBridgeListsAddItemBlock(listName, childBlock.getCommentText());
     }else{
       code = code + Blockly.Java.genJBridgeListsAddItemBlock(listName, addItemData);
     }
    }
   if(listBlock.parentBlock_.type == "component_method"){
     var newList = Blockly.Java.genJBridgeNewList(childType);
     newList = newList.slice(0,-2);
     code = newList + code;
   }else if (isChildList){
     //create nested list seperately
     jBridgeVariableDefinitionMap[listName] = TYPE_JAVA_ARRAYLIST;
     jBridgeInitializationList.push(listName + " = new " + TYPE_JAVA_ARRAYLIST + "();");
   }else{
     code = Blockly.Java.genJBridgeNewList(childType)
          +"\n"
          + code;
   }
   return code;
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
Blockly.Java.findParentListName = function(listBlock){
    var parentName = "";    
    if (listBlock.parentBlock_.getFieldValue('NAME') != undefined){
      parentName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "");
    }else if(listBlock.parentBlock_.getFieldValue('VAR') != undefined){
      parentName = listBlock.parentBlock_.getFieldValue('VAR').replace("global ", "");
    }else if (listBlock.parentBlock_.getCommentText() != undefined){
      parentName = listBlock.parentBlock_.getCommentText();        
    }        
    return parentName;
};

/**
  * Parses blocks to retrieve items from list
  * in .genJBridgeListSelectItemBlock
  *
  * @params {String} listBlock
  * @returns {String} code generated if no errors from .genJBridgeListSelectItemBlock
  */
Blockly.Java.parseJBridgeListSelectItemBlock = function(listBlock){
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  if(Blockly.Java.hasTypeCastKey(listName, listTypeCastMap)){
     listName = Blockly.Java.TypeCastOneValue(listName, listName, listTypeCastMap);
  }
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Java.genJBridgeListSelectItemBlock(listName, index);  
};

/**
  * Parses blocks to then generate java code list.contains(object)
  * in .getJBridgeListContainsBlock
  *
  * @params {String} listBlock
  * @returns {String} code generated if no errors from .getJBridgeListContainsBlock
  */
Blockly.Java.parseJBridgeListContainsBlock = function(listBlock){
  var object = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Java.getJBridgeListContainsBlock(object, listName);
};

/**
  * Generates java code list.get(index-1) from parsed blocks
  *
  * @params {String} listName
  * @params {String} index
  * @returns {String} code generated if no errors
  */
Blockly.Java.genJBridgeListSelectItemBlock = function(listName, index){
  var code = listName + ".get(" + index + " - 1)";
  return code;
};

/**
  * Generates java code for a new ArrayList of type Object
  * The List is of type "Object" because App Inventor lists take many types 
  * @returns {String} code generated if no errors
  */
Blockly.Java.genJBridgeNewList = function(type){
  var code = "new " + TYPE_JAVA_ARRAYLIST + "();\n";
  return code;
};

/**
  *  Generates java code list.add(object) from parsed blocks
  *
  * @params {String} listName
  * @params {String} addItem
  * @returns {String} code generated if no errors
  */
Blockly.Java.genJBridgeListsAddItemBlock = function(listName, addItem){
   addItem = Blockly.Java.removeColonsAndNewlines(addItem);
   var code = listName
            + ".add(" 
            + addItem
            +"); \n";
   return code;
};

/**
  *  Generates java code list.contains(object) from parsed blocks
  *
  * @params {String} object
  * @params {String} listName
  * @returns {String} code generated if no errors
  */
Blockly.Java.getJBridgeListContainsBlock = function(object, listName){
  var code = listName 
           + ".contains("
           + object
           + ")";
  return code; 
};

/**
  *  Parses math blocks and determines string or number comparison
  *
  * @params {String} mathBlock
  * @returns {String} code generated if no errors, as a reult of .genJBridgeMathCompare
  */
Blockly.Java.parseJBridgeMathCompare = function (mathBlock){
  var operator = mathBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
  var op = Blockly.Java.getJBridgeOperator(operator);
  if(op == "==" && (leftValue.indexOf("String.valueOf(") == 0 || mathBlock.childBlocks_[1].category == "Text")){
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
Blockly.Java.parseJBridgeMathAtan2 = function (mathBlock){
  var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
  return Blockly.Java.genJBridgeMathAtan2(leftValue, rightValue);
};

/**
  *  Generates java code for tan function
  *
  * @params {String} leftValue
  * @params {String} rightValue
  * @returns {String} code generated if no errors
  */
Blockly.Java.genJBridgeMathAtan2 = function (leftValue, rightValue){
  var code = "Math.toDegrees(Math.atan2(" 
             + leftValue
             + ", "
             + rightValue
             + "))";
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
Blockly.Java.genJBridgeStringEqualsCompare = function (leftValue, rightValue, operator){
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
Blockly.Java.genJBridgeMathCompare = function (leftValue, rightValue, operator){
  var code = leftValue
             + operator
             + rightValue;
  return code;
};

/**
  *  Translates JBridge math operator from parsed blocks
  *
  * @params {String} operator
  * @returns {String} returns java-translated version of desired operator
  */
Blockly.Java.getJBridgeOperator = function(operator){
  var op = operator;
  if(operator == "GT"){
    op = ">";
  }else if(operator == "LT"){
    op = "<";
  }else if(operator == "EQ" || operator == "EQUAL"){
    op = "==";
  }else if(operator == "NEQ"){
    op = "!=";
  }else if(operator == "GTE"){
    op = ">=";
  }else if(operator == "LTE"){
    op = "<=";
  }else if(operator == 'AND'){
    op = "&&";
  }else if (operator == "OR"){
    op = "||";
  }

  return op;
};

 /**
  *  Parses the List Length Block later generate listName.size()
  *
  * @params {String} listName
  * @returns {String} code generated if no errors, as a result of .genJBridgeListLengthBlock
  */
Blockly.Java.parseJBridgeListLengthBlock = function(listBlock){
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  return Blockly.Java.genJBridgeListLengthBlock(listName);
};

 /**
  *  Generates code list.size()
  *
  * @params {String} listName
  * @returns {String} code generated if no errors
  */
Blockly.Java.genJBridgeListLengthBlock = function(listName){
  var code = listName + ".size()"
  return code;
};

 /**
  *  Parses math logic block and conducts an evaluation using left
  *
  * @params {String} logicBlock from blocks
  * @returns {String} code generated if no errors, called from .genJBridgeLogicOperationBlock
  */
Blockly.Java.parseJBridgeLogicOperationBlock = function(logicBlock){
  var operator = logicBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(logicBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(logicBlock.childBlocks_[1]);

return Blockly.Java.genJBridgeLogicOperationBlock(leftValue, rightValue, Blockly.Java.getJBridgeOperator(operator));
};

/**
 * Applies appropriate operator (i.e. addition, subtraction, etc.) to two values in java
 *
 * @params{String} leftValue
 * @params{String} rightValue
 * @params{String} operator
 * @return{String} code that is generated
 */
Blockly.Java.genJBridgeLogicOperationBlock = function (leftValue, rightValue, operator){

  var code = leftValue
             + " "
             + operator
             + " "
             + rightValue;
  return code;
};

Blockly.Java.parseJBridgeComponentComponentBlock = function(componentBlock){
  var name = componentBlock.instanceName;
  return Blockly.Java.genJBridgeComponentComponentBlock(name);
};

Blockly.Java.genJBridgeComponentComponentBlock = function(name){
  var code = name;
  return code;
};

 /**
  *  Parses math random block and checks for correct imports. If none
  *  exist, they are added
  *
  * @params {String} mathBlock to parse
  * @returns {String} code generated if no errors
  */
Blockly.Java.parseJBridgeMathRandomFloatBlock = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    return Blockly.Java.genJBridgeMathRandomFloatBlock();
};

 /**
  *  Generates the random.nextFloat components in JBridge format
  *
  * @returns {String} code generated if no errors
  */
Blockly.Java.genJBridgeMathRandomFloatBlock = function(){
    var code = "(random.nextFloat())"
    return code;
};


 /**
  *  Parses Java Bridge Text Blocks and changes their case according to corresponding operator
  *
  * @param {String} textBlock
  * @returns {String} code generated if no errors, as a result of genJBridgeTextChangeCaseBlock
  */
Blockly.Java.parseJBridgeTextChangeCaseBlock = function(textBlock){
    var operator = textBlock.getFieldValue("OP");
    var op = "toLowerCase()";
    if(operator == "UPCASE"){
        op = "toUpperCase()";
    }
    var genCode = "";
    for(var x = 0, childBlock; childBlock = textBlock.childBlocks_[x]; x++){
          genCode = genCode + Blockly.Java.parseBlock(childBlock);
    }    
    return Blockly.Java.genJBridgeTextChangeCaseBlock(genCode, op);
};

 /**
  *  Generates JBridgeText for changing the case of text
  *
  * @param {String} inputText
  * @params{String} changeCase
  * @return{String} code generated if no errors
  */
Blockly.Java.genJBridgeTextChangeCaseBlock = function(inputText, changeCase){
    var code = "String.valueOf("
              + inputText 
              + ")."
              + changeCase;
    return code;
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
Blockly.Java.parseJBridgeListIsListBlock = function(listBlock){
  var genCode = ""
  for(var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++){
          genCode = genCode + Blockly.Java.parseBlock(childBlock);
  }
  return Blockly.Java.genJBridgeListIsListBlock(genCode);
};

Blockly.Java.genJBridgeListIsListBlock = function(genCode){
  var code = "(("
            + genCode
            + ")"
            + " instanceof ArrayList<?>"
            + ")"
  return code;
};

 /**
  *  Allows more readable JBridge code using indentation using
  * curly brackets as indentation queues
  * @param {String} javaCode generated
  * @return{String} Prity code generated if no errors
  */
Blockly.Java.prityPrintJBridgeCode = function(javaCode){
  var stack=new Array();
  var lines = javaCode.split('\n');
  var prityPrint = [];
  for(var i = 0;i < lines.length;i++){
    var line = lines[i].trim();
    if(line == ";" || line.length == 0){
      continue;
    }
    var lastChar = line.slice(-1);
    var indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    if(lastChar== "{"){
      stack.push("{");
    } else if(lastChar== "}"){
      stack.pop();
      indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    }
    prityPrint.push(indentation + line);
    
  }
  return prityPrint.join("\n");
};


 /**
  *  Adds the permissions and intents to the AndroidManifest.xml file
  *
  * @param {String} indentLength
  * @return{String} indentation for corresponding method structure
  */
Blockly.Java.prityPrintIndentationJBridge = function(indentLength){
  var indentation = "";
  for(var j=0; j<indentLength; j++){
    indentation += "  ";
  }
  return indentation;
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
Blockly.Java.getFormMainfest = function(formJson, packageName, forRepl) {
    Blockly.Java.initAndroidPermisionAndIntent();
    var jsonObject = JSON.parse(formJson); 
    Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject);
    
    var androidIntents = "";
    var androidPermisions = "";
    for (var key in jBridgePermissionToAdd) {
      androidPermisions += jBridgeAndroidPermisions[key];
    }
    for (var key in jBridgeIntentsToAdd) {
      androidIntents += jBridgeAndroidIntents[key];
    }
    return Blockly.Java.genManifestString(androidPermisions, androidIntents);
    
};

 /**
  *  Defines the permissions and intents strings
  *
  */
Blockly.Java.initAndroidPermisionAndIntent = function(){
    //This includes method Names or Type
    jBridgeAndroidPermisions["receive_sms"] = "<uses-permission android:name=\"android.permission.RECEIVE_SMS\"/>\r\n\r\n    ";
    jBridgeAndroidPermisions["send_sms"] = "<uses-permission android:name=\"android.permission.SEND_SMS\"/>\r\n\r\n    ";
    jBridgeAndroidPermisions["voice_receive_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.RECEIVE_SMS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["voice_send_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.SEND_SMS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["manage_accounts"] = "<uses-permission android:name=\"android.permission.MANAGE_ACCOUNTS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["get_accounts"] = "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["use_credentials"] =  "<uses-permission android:name=\"android.permission.USE_CREDENTIALS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["vibrate"] = "<uses-permission android:name=\"android.permission.VIBRATE\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["internet"] = "<uses-permission android:name=\"android.permission.INTERNET\" />\r\n\r\n    ";

    jBridgeMethodAndTypeToPermisions["vibrate"] = ["vibrate"];
    jBridgeMethodAndTypeToPermisions["tinywebdb"] = ["internet"];
    jBridgeMethodAndTypeToPermisions["sendmessage"] = ["receive_sms","send_sms", "voice_receive_sms","voice_send_sms", "manage_accounts", "get_accounts","use_credentials"];
    
    //This includes method Names or Type
    jBridgeAndroidIntents["sendmessage"] = "<receiver android:name=\"com.google.appinventor.components.runtime.util.SmsBroadcastReceiver\"\r\n\r\n          android:enabled=\"true\" android:exported=\"true\">\r\n\r\n    "
                            + "<intent-filter>\r\n\r\n        \r\n\r\n        "
                            + "<action android:name=\"android.provider.Telephony.SMS_RECEIVED\"/>\r\n\r\n        "
                            + "<action android:name=\"com.google.android.apps.googlevoice.SMS_RECEIVED\"\r\n\r\n                android:permission=\"com.google.android.apps.googlevoice.permission.RECEIVE_SMS\"/>\r\n\r\n    "
                            + "</intent-filter>\r\n\r\n"
                            + "</receiver>\r\n\r\n    ";
};

 /**
  *  Adds the permissions and intents to the AndroidManifest.xml file
  *
  * @params name
  */
Blockly.Java.addPermisionsAndIntents = function(name){
  name = name.toLowerCase();
  if(name in jBridgeMethodAndTypeToPermisions){
    var permissions = jBridgeMethodAndTypeToPermisions[name];
    for(var i=0; i<permissions.length; i++){
      jBridgePermissionToAdd[permissions[i]] = true;
    }   
  }
  if(name in jBridgeAndroidIntents){
    jBridgeIntentsToAdd[name] = true; 
  }
};

/**
 * Generates android manifest string from android permissions and android intents
 *
 * @params{String} androidPermissions
 * @params{String} androidIntents
 * @return{String} code that is generated
 */
Blockly.Java.genManifestString = function(androidPermisions, androidIntents){
  var mainfestString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n\r\n"
                            + "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\r\n\r\n    package=\"org.appinventor\"\r\n\r\n    android:versionCode=\"1\"\r\n\r\n    android:versionName=\"1.0\" >\r\n\r\n"
                            + "<uses-sdk\r\n\r\n        android:minSdkVersion=\"8\"\r\n\r\n        android:targetSdkVersion=\"21\" />\r\n\r\n    "                  
                            + androidPermisions
                            + "<application\r\n\r\n        android:allowBackup=\"true\"\r\n\r\n        android:icon=\"@drawable/ic_launcher\"\r\n\r\n        android:label=\"Screen1\">\r\n\r\n        "
                            + "<activity\r\n\r\n            android:name=\".Screen1\"\r\n\r\n            android:label=\"Screen1\" >\r\n\r\n            "
                            + "<intent-filter>\r\n\r\n                "
                            + "<action android:name=\"android.intent.action.MAIN\" />\r\n\r\n\r\n\r\n                "
                            + "<category android:name=\"android.intent.category.LAUNCHER\" />\r\n\r\n            "
                            + "</intent-filter>\r\n\r\n        "
                            + androidIntents
                            + "</activity>\r\n\r\n        "
                            + "</application>\r\n\r\n\r\n\r\n"
                            + "</manifest>";
  return mainfestString;
};

/**
 * Method that strips all of the ";" and "\n" characters from the code.
 * Used for methods that are generated but wrapped within another method
 * @param {String} the code to strip
 * @return {String} the stripped code 
*/
Blockly.Java.removeColonsAndNewlines = function(code){
    return code.replace(/[;\n]*/g, "");
}