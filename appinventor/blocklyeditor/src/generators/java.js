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
var jBridgeGlobalVarTypes = new Object();
var jBridgeLexicalVarTypes = new Object();
var JBRIDGE_COMPONENT_SKIP_PROPERTIES = ["Uuid", "$Version", "TextAlignment"]; //properties to skip when reading Json File
var JBRIDGE_JSON_TEXT_PROPERTIES = ["Title", "Text", "BackgroundImage", "Image", "Icon", "Source", "Picture", "Hint", "Action", "ActivityClass", "ActivityPackage", "ServiceURL", "Country", "Language", "ElementsFromString", "Prompt"]; //Properties that should include the double qoutes "" in the output JBridge Javacode
var jBridgeImportsMap = new Object();
var jBridgeProceduresMap = new Object();
var jBridgeEventMethodsList = [];
var jBridgeListNames = [];
var jBridgeIsIndividualBlock = false; // is to Identify if a block is Iduvidal root block or sub-block
var jBridgeCurrentScreen;
var jBridgeParsingEventMethod = false;
var isParsingJBridgeProcedure = false;
var jBridgeEventMethodSetupCode = "";
var JBRIDGE_COMPONENT_TEXT_PROPERTIES = ["Text", "Picture", "Source"];

var jBridgePermissionToAdd = new Object; //this should be a set
var jBridgeIntentsToAdd = new Object; // this should be a set
var jBridgeAndroidPermisions = new Object();
var jBridgeAndroidIntents = new Object();
var jBridgeMethodAndTypeToPermisions = new Object();

//predefined helper methods to be declared if used
var toCSVMethod = "\npublic String toCSV(ArrayList<Object> originalList){\nStringBuilder stringBuilder = new StringBuilder();\nfor (int i=0;i < originalList.size(); i++){\nObject elem = originalList.get(i);\nstringBuilder.append(elem.toString());\nif (i < originalList.size()-1){\nstringBuilder.append(\", \");\n}\n}\nreturn stringBuilder.toString();\n}";

var singleMathJavaNames = new Map();
singleMathJavaNames.set("ROOT", "sqrt");
singleMathJavaNames.set("ABS", "abs");
singleMathJavaNames.set("LN", "log");
singleMathJavaNames.set("EXP", "exp");
singleMathJavaNames.set("ROUND", "round");
singleMathJavaNames.set("CEILING", "ceil");
singleMathJavaNames.set("FLOOR", "floor");
singleMathJavaNames.set("SIN", "sin");
singleMathJavaNames.set("COS", "cos");
singleMathJavaNames.set("TAN", "tan");
singleMathJavaNames.set("ASIN", "asin");
singleMathJavaNames.set("ACOS", "acos");
singleMathJavaNames.set("ATAN", "atan");

var singleMathTypes = ["math_single", "math_trig", "math_abs", "math_neg", "math_round", "math_ceiling", "math_floor"];
var mathOperationBlocks = ["math_add", "math_subtract", "math_multiply", "math_division", "math_compare", "math_atan2", "math_power"];

var propertyBlockSet = ["Speed"];

var JAVA_CLASS_INT = "Integer";
var JAVA_CLASS_FLOAT = "Float";
var JAVA_CLASS_DOUBLE = "Double";
var JAVA_CLASS_BOOLEAN = "Boolean";
var JAVA_INT = "int";
var JAVA_FLOAT = "float";
var JAVA_DOUBLE = "double";
var JAVA_BOOLEAN = "boolean";
var JAVA_STRING = "String";
var JAVA_SPRITE = "Sprite";
var JAVA_VIEW = "AndroidViewComponent";
var JAVA_YAIL_LIST = "YailList";
var JAVA_ARRAY_LIST = "ArrayList";
var JAVA_OBJECT = "Object";

var methodParam = new Object();
//Param type Map start. Includes methods and individual events
var methodParamsMap = {

  //string methods
  'Text': {0: JAVA_STRING},

  //canvas methods
  'BackgroundColor': {0: JAVA_INT},
  'BackgroundImage': {0: JAVA_STRING},
  'DrawCircle': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_FLOAT, 3: JAVA_BOOLEAN},
  'DrawLine': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_INT, 3: JAVA_INT},
  'DrawPoint': {0: JAVA_INT, 1: JAVA_INT},
  'DrawText': {0: JAVA_STRING, 1: JAVA_INT, 2: JAVA_INT},
  'DrawTextAtAngle': {0: JAVA_STRING, 1: JAVA_INT, 2: JAVA_INT, 3: JAVA_FLOAT},
  'findSpriteCollisions': {0: JAVA_SPRITE},
  'FontSize': {0: JAVA_FLOAT},
  'GetBackgroundPixelColor': {0: JAVA_INT, 1: JAVA_INT},
  'GetPixelColor': {0: JAVA_INT, 1: JAVA_INT},
  'Height': {0: JAVA_INT},
  'LineWidth': {0: JAVA_FLOAT},
  'SaveAs': {0: JAVA_STRING},
  'setChildHeight': {0: JAVA_VIEW, 1: JAVA_INT},
  'SetBackgroundPixelColor': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_INT},
  'PaintColor': {0: JAVA_INT},
  'TextAlignment': {0: JAVA_INT},
  'Visible': {0: JAVA_BOOLEAN},
  'Width': {0: JAVA_FLOAT},
  'WidthPercent': {0: JAVA_FLOAT},
  'MoveTo': {0: JAVA_FLOAT, 1: JAVA_FLOAT},
  'Dragged': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_INT, 3: JAVA_INT, 4: JAVA_INT, 5: JAVA_INT, 6: JAVA_BOOLEAN},
  'Flung': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT, 3: JAVA_FLOAT, 4: JAVA_FLOAT, 5: JAVA_FLOAT, 6: JAVA_BOOLEAN},
  'Touched': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_BOOLEAN}, //newly added 8/23
  'TouchUp': {0: JAVA_FLOAT, 1: JAVA_FLOAT},
  'TouchDown': {0: JAVA_FLOAT, 1: JAVA_FLOAT},

  //sprite methods
  'Bounce': {0: JAVA_INT},
  'CollidedWith': {0: JAVA_SPRITE},
  'CollidingWith': {0: JAVA_SPRITE},
  'Speed': {0: JAVA_FLOAT},

  //ball methods
  'PointInDirection': {0: JAVA_FLOAT, 1: JAVA_FLOAT},
  'PointTowards': {0: JAVA_SPRITE},
  'EdgeReached': {0: JAVA_INT},
  'Enabled': {0: JAVA_BOOLEAN},
  'Heading': {0: JAVA_FLOAT},
  'Y': {0: JAVA_DOUBLE},
  'X': {0: JAVA_DOUBLE},

  //camera
  'AfterPicture': {0: JAVA_STRING},

  //videoPlayer
  'VideoPlayerError': {0: JAVA_STRING},

  //textTospeech
  'AfterSpeaking': {0: JAVA_STRING},
  'Speak': {0: JAVA_STRING},

  //sound
  'SoundError': {0: JAVA_STRING},
  'Source': {0: JAVA_STRING},
  'Vibrate': {0: JAVA_INT},

  //player
  'PlayerError': {0: JAVA_STRING},
  'Pause': {},
  'Start': {},

  //camcorder
  'AfterRecording': {0: JAVA_STRING},

  //speechRecognizer
  'AfterGettingText': {0: JAVA_STRING},

  //yandexTranslate
  'GotTranslation': {0: JAVA_STRING, 1: JAVA_STRING},
  'RequestTranslation': {0: JAVA_STRING, 2: JAVA_STRING},

  //spinner
  'AfterSelecting': {0: JAVA_STRING},

  //slider
  'PositionChanged': {0: JAVA_FLOAT},

  //notifer
  'AfterChoosing': {0: JAVA_STRING},
  'AfterTextInput': {0: JAVA_STRING},

  //orientation sensor
  'OrientationChanged': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT},

  //nearField
  'TagRead': {0: JAVA_STRING},

  //location sensor
  'LongitudeFromAddress': {0: JAVA_STRING},
  'LatitudeFromAddress': {0: JAVA_STRING},
  'LocationChanged': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT},
  'StatusChanged': {0: JAVA_STRING, 1: JAVA_STRING},

  //barcode scanner
  "AfterScan": {0: JAVA_STRING},

  //accelerometer sensor
  'AccelerationChanged': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT},

  //pedometer
  'SimpleStep': {0: JAVA_INT, 1: JAVA_FLOAT},
  'WalkStep': {0: JAVA_INT, 1: JAVA_FLOAT},

  //proximity sensor
  'ProximityChanged': {0: JAVA_FLOAT},

  //file
  'AppendToFile': {0: JAVA_STRING, 1: JAVA_STRING},
  'Delete': {0: JAVA_STRING},
  'ReadFrom': {0: JAVA_STRING},
  'SaveFile': {0: JAVA_STRING, 1: JAVA_STRING},

  //fusionTableControls
  'GetRows': {0: JAVA_STRING, 1: JAVA_STRING},
  'GetRowsWithConditions': {0: JAVA_STRING, 1: JAVA_STRING, 2: JAVA_STRING},
  'InsertRow': {0: JAVA_STRING, 1: JAVA_STRING, 2: JAVA_STRING},

  //bluetoothServer
  'AcceptConnection': {0: JAVA_STRING},
  'AcceptConnectionWithUUID': {0: JAVA_STRING},
  'Connect': {0: JAVA_STRING},
  'ConnectWithUUID': {0: JAVA_STRING},
  'IsDevicePaired': {0: JAVA_STRING},
  'RecievedSignedBytes': {0: JAVA_INT},
  'RecievedUnsignedBytes': {0: JAVA_INT},
  'RecieveText': {0: JAVA_INT},
  'Send1ByteNumber': {0: JAVA_STRING},
  'Send2ByteNumber': {0: JAVA_STRING},
  'Send4ByteNumber': {0: JAVA_STRING},
  'SendBytes': {0: JAVA_OBJECT},
  'SendText': {0: JAVA_STRING},

  //web
  'BuildRequestData': {0: JAVA_OBJECT},
  'HtmlTextDecode': {0: JAVA_STRING},
  'JSONTextDecode': {0: JAVA_STRING},
  'PostFile': {0: JAVA_STRING},
  'PostText': {0: JAVA_STRING},
  'PostTextWithEncoding': {0: JAVA_STRING, 1: JAVA_STRING},
  'PutFile': {0: JAVA_STRING},
  'PutText': {0: JAVA_STRING},
  'PutTextWithEncoding': {0: JAVA_STRING},
  'UriEncode': {0: JAVA_STRING},
  'XMLTextDecode': {0: JAVA_STRING},

  //sharing
  'ShareFile': {0: JAVA_STRING},
  'ShareFileWithMessage': {0: JAVA_STRING, 1: JAVA_STRING},
  'ShareMessage': {0: JAVA_STRING},

  //twitter
  'DirectMessage': {0: JAVA_STRING, 1: JAVA_STRING},
  'Follow': {0: JAVA_STRING},
  'Login': {0: JAVA_STRING, 1: JAVA_STRING},
  'SearchTwitter': {0: JAVA_STRING},
  'StopFollowing': {0: JAVA_STRING},
  'Tweet': {0: JAVA_STRING},
  'TweetWithImage': {0: JAVA_STRING},

  //tinyWebDB
  'GetValue': {0: JAVA_STRING, 1: JAVA_STRING},
  'StoreValue': {0: JAVA_STRING, 1: JAVA_OBJECT},

  //firebase
  'GotValue': {0: JAVA_STRING, 1: JAVA_OBJECT},

  //tinyDB
  'ClearTag': {0: JAVA_STRING},

  //texting
  'MessageReceived': {0: JAVA_STRING, 1: JAVA_STRING},
  'PhoneNumber': {0: JAVA_STRING},
  'Message': {0: JAVA_STRING},

  //screen methods
  'OtherScreenClosed': {0: JAVA_STRING, 1: JAVA_OBJECT},

  //Image methods
  'Picture': {0: JAVA_STRING},

  //Text Box Methods
  'Hint': {0: JAVA_STRING},

  //List picker methods
  'Elements': {0: JAVA_YAIL_LIST}
};
//Map of double casting
var methodSpecialCases = new Map();

//canvas methods
methodSpecialCases.set("BackgroundColor", ["((Float)XXX).intValue()"]);
methodSpecialCases.set("DrawCircle", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "XXX", "XXX"]);
methodSpecialCases.set("DrawLine", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("PaintColor", ["Integer.parseInt(String.valueOf(XXX))"]);
methodSpecialCases.set("Dragged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Boolean)XXX).booleanValue()"]);
methodSpecialCases.set("MoveTo", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("Flung", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Boolean)XXX).booleanValue()"]);
methodSpecialCases.set("TouchDown", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("TouchUp", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("Touched", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Boolean)XXX).booleanValue()"]);
methodSpecialCases.set("PointinDirection", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//clock methods
methodSpecialCases.set("Duration", ["((Calendar)XXX)", "((Calendar)XXX)"]);
methodSpecialCases.set("TimerInterval", ["Integer.parseInt(String.valueOf(XXX))"]);

//location sensor
methodSpecialCases.set("LocationChanged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//accelerometer sensor
methodSpecialCases.set("AccelerationChanged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//orientation sensor
methodSpecialCases.set("OrientationChanged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//pedometer
methodSpecialCases.set('SimpleStep', ["(int)XXX", "((Float)XXX).intValue()"]);
methodSpecialCases.set('WalkStep', ["(int)XXX", "((Float)XXX).intValue()"]);

//proximity sensor
methodSpecialCases.set('ProximityChanged', ["((Float)XXX).intValue()"]);

//slider
methodSpecialCases.set('PositionChanged', ["((Float)XXX).intValue()"]);

//sprite
methodSpecialCases.set('Speed', ["((Float)XXX).intValue()"]);

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


//JSON Parameters
var JSONKEY_JAVACODE = "java_code";
var JSONKEY_SUCCESS = "success";
var JSONVALUE_UNSUCCESSFUL = "false";
var JSONVALUE_SUCCESSFUL = "true";
var JSONKEY_ERRORS = "errors";

var generationErrors = [];
/**
 * Generate the Yail code for this blocks workspace, given its associated form specification.
 *
 * @param {String} formJson JSON string describing the contents of the form. This is the JSON
 *    content from the ".scm" file for this form.
 * @param {String} packageName the name of the package (to put in the define-form call)
 * @param {Boolean} forRepl  true if the code is being generated for the REPL, false if for an apk
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.getFormJava = function (formJson, packageName, forRepl) {
  var screenJSONInfo = JSON.parse(formJson);

  var jsonResponse = new Object();
  try {
    var javaCodeList = [];
    javaCodeList.push(Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), screenJSONInfo));
    var javaCode = Blockly.Java.prettyPrintJBridgeCode(javaCodeList.join('\n'));

    jsonResponse[JSONKEY_SUCCESS] = generationErrors.length == 0;
    if (generationErrors.length > 0) {
      jsonResponse[JSONKEY_ERRORS] = generationErrors;
    } else {
      jsonResponse[JSONKEY_JAVACODE] = javaCode;
    }
  } catch (e) {
    // catch any runtime errors
    jsonResponse[JSONKEY_SUCCESS] = JSONVALUE_UNSUCCESSFUL;
    generationErrors.push("Generation Error");
    jsonResponse[JSONKEY_ERRORS] = generationErrors;
  }

  return JSON.stringify(jsonResponse);
};

/**
 * Retrieves JSON string and imports for project.
 *
 * @param {Sting} JSON topBlocks from the Blockly mainWorkspace
 * @param {String} jsonObject
 * @returns {String} the generated code
 */
Blockly.Java.genJBridgeCode = function (topBlocks, jsonObject) {
  Blockly.Java.initAllVariables();
  Blockly.Java.parseJBridgeJsonData(jsonObject);
  Blockly.Java.sortBlocksByPriority(topBlocks);
  Blockly.Java.parseTopBlocks(topBlocks);

  var code = Blockly.Java.JBRIDGE_PACKAGE_NAME +
    Blockly.Java.JBRIDGE_BASE_IMPORTS +
    Blockly.Java.genComponentImport(jBridgeImportsMap) +
    Blockly.Java.genJBridgeClass(topBlocks);

  return code;
};

/**
 * Sorts blocks to control the order that they are parsed.
 * Used to parse blocks that have defined information first
 * @param topBlocks
 */
Blockly.Java.sortBlocksByPriority = function (topBlocks) {
  var priorityIndex = 0;
  for (var x = 0, block; block = topBlocks[x]; x++) {
    if (block.type == "global_declaration") {
      //swap priority
      var tmpBlock = topBlocks[priorityIndex];
      topBlocks[priorityIndex++] = block;
      topBlocks[x] = tmpBlock;
    }
  }
};

/**
 * Instantiates variables needed for java generation.
 */
Blockly.Java.initAllVariables = function () {
  jBridgeTopBlockCodesList = [];
  jBridgeRegisterEventMap = new Object();
  jBridgeEventsList = [];
  jBridgeVariableDefinitionMap = new Object();
  jBridgeInitializationList = [];
  jBridgeEventMethodSetupCode = "";
  jBridgeComponentMap = new Object();
  jBridgeGlobalVarTypes = new Object();
  jBridgeImportsMap = new Object();
  jBridgeProceduresMap = new Object();
  jBridgeEventMethodsList = [];
  jBridgeListNames = [];
};

/**
 * Retrieves JSON string and imports for project.
 *
 * @param {String} JSON Object that contains app inventor blocks
 */
Blockly.Java.parseJBridgeJsonData = function (jsonObject) {
  var jsonProperties = jsonObject.Properties;
  jBridgeCurrentScreen = jsonProperties.$Name;
  //iterating over the screen component properties
  for (var prop in jsonProperties) {
    if (jsonProperties[prop] !== undefined) {
      if (Blockly.Java.hasTypeCastKey(prop, screenPropertyCastMap)) {
        var castedValue = Blockly.Java.TypeCastOneValue(prop, jsonProperties[prop], screenPropertyCastMap);
        jBridgeInitializationList.push("this." + prop + "(" + castedValue + ");");

      }
    }
  }
  //parsing the lower level components (not including the "Screen" component)
  for (var i = 0; i < jsonProperties.$Components.length; i++) {
    Blockly.Java.parseJBridgeJsonComponents(jsonProperties.$Components[i], "this");
  }
};

Blockly.Java.parseJBridgeJsonComponents = function (componentJson, rootName) {
  var name = componentJson.$Name;

  // Assuiming if a component has no name, its not a valid component
  if (name == undefined) {
    name = "this";
  }
  jBridgeComponentMap[name] = [];
  jBridgeComponentMap[name].push({"rootName": rootName});
  jBridgeComponentMap[name].push({"Type": componentJson.$Type}); //<- look here?

  jBridgeVariableDefinitionMap[name] = componentJson.$Type;
  jBridgeImportsMap[componentJson.$Type] = "import com.google.appinventor.components.runtime." + componentJson.$Type + ";";
  var newObj = name
    + " = new "
    + componentJson.$Type
    + "("
    + rootName
    + ");";

  jBridgeInitializationList.push(newObj);
  if (componentJson.$Type.toLowerCase() == "imagesprite" || componentJson.$Type.toLowerCase() == "ball") { //just inserted 7/20/16 by *Elia*
    jBridgeInitializationList.push(name + ".Initialize();");
  }
  var componentsObj = undefined;
  for (var key in componentJson) {
    if (JBRIDGE_COMPONENT_SKIP_PROPERTIES.indexOf(key) <= -1
      && key != "$Name" && key != "$Type" && componentJson.hasOwnProperty(key)) {
      if (key == "$Components") {
        componentsObj = componentJson[key];
      } else {
        //Removing the $ sign on ceratin properties in the json file
        var printableKey = key;
        if (key.charAt(0) == "$") {
          printableKey = key.substring(1);
        }
        jBridgeComponentMap[name].push({printableKey: componentJson[key]})
        //Convert color code & lower case for boolean value
        var valueOfLowerCase = componentJson[key].toLowerCase();
        var printableValue = componentJson[key];
        //JSON value from height/width fill parent is -2
        if ((key == "Height" || key == "Width") && printableValue == "-2") {
          printableValue = "LENGTH_FILL_PARENT";
        }
        //Java Bridge prefers java integers over floats or doubles
        if (Blockly.Java.isNumber(printableValue) && JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) <= -1) {
          printableValue = Math.round(printableValue);
        }
        //casting the color to HEX
        if (componentJson[key].substring(0, 2) == "&H" && componentJson[key].length == 10) {
          printableValue = "0x" + componentJson[key].substring(2);
        }
        //for True and False properties
        if (valueOfLowerCase == "true" || valueOfLowerCase == "false") {
          printableValue = valueOfLowerCase;
        }
        //for properties that require qoutes ""
        if (JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) > -1) {
          printableValue = "\"" + printableValue.replace(/"/gi, "\'") + "\"";
        }
        jBridgeInitializationList.push(Blockly.Java.genJBridgeJsonComopnents(name, printableKey, printableValue));
      }
    }
  }
  //Assuming that $Components Property is always an array
  if (componentsObj != undefined) {
    for (var i = 0; i < componentsObj.length; i++) {
      Blockly.Java.parseJBridgeJsonComopnents(componentsObj[i], name);
    }
  }
};

Blockly.Java.genJBridgeJsonComopnents = function (componentName, property, value) {
  var code = componentName
    + "."
    + property
    + "("
    + value
    + ");"
  return code;
};
/*
*/
Blockly.Java.parseComponentDefinition = function (jBridgeVariableDefinitionMap) {
  var code = "";
  for (var key in jBridgeVariableDefinitionMap) {
    code = code
      + Blockly.Java.genComponentDefinition(jBridgeVariableDefinitionMap[key], key)
      + "\n";
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
Blockly.Java.genComponentDefinition = function (type, name) {
  var code = "private "
    + type
    + " "
    + name
    + ";";
  return code;
};


Blockly.Java.genComponentImport = function (jBridgeImportsMap) {
  var code = "";
  for (var key in jBridgeImportsMap) {
    code = code
      + '\n'
      + jBridgeImportsMap[key];
  }
  return code;
};

/**
 * Generates class declarations, event handlers, and their corresponding public methods.
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeClass = function (topBlocks) {
  var code = "\nclass " + jBridgeCurrentScreen + " extends Form implements HandlesEventDispatching { \n"
    + Blockly.Java.parseComponentDefinition(jBridgeVariableDefinitionMap)
    + Blockly.Java.genJBridgeDefineMethod()
    + Blockly.Java.genJBridgeDispatchEvent()
    + Blockly.Java.genJBridgeEventMethods()
    + Blockly.Java.genJBridgeDefineProcedure(jBridgeProceduresMap)
    + "\n}\n";
  return code;
};


/**
 * Generates class declarations, event handlers, and their corresponding public methods.
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */

Blockly.Java.genJBridgeEventsRegister = function (jBridgeRegisterEventMap) {
  var registeredEvents = []
  for (var key in jBridgeRegisterEventMap) {
    registeredEvents.push(jBridgeRegisterEventMap[key]);
  }
  return registeredEvents.join("\n");
};

/**
 * Generates protected void $define method
 *
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeDefineMethod = function () {
  var code = "\nprotected void $define() { \n"
    + jBridgeInitializationList.join("\n")
    + "\n"
    + Blockly.Java.genJBridgeEventsRegister(jBridgeRegisterEventMap)
    + "\n}";
  return code;
};


/**
 * Generates parameters for each method in project
 *
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeDispatchEvent = function () {
  var code = "\npublic boolean dispatchEvent(Component component, String componentName, String eventName, Object[] params){\n"
    + jBridgeTopBlockCodesList.join("\n")
    + "\n return false;"
    + "\n}";

  return code;
};

Blockly.Java.genJBridgeEventMethods = function () {
  var code = "";
  if (jBridgeEventMethodsList !== undefined) {
    code = jBridgeEventMethodsList.join("\n") + "\n";
  }
  return code;
}

Blockly.Java.genJBridgeDefineProcedure = function (jBridgeProceduresMap) {
  var code = "";
  for (var key in jBridgeProceduresMap) {
    code = code
      + '\n'
      + jBridgeProceduresMap[key];
  }
  return code;
};

Blockly.Java.parseTopBlocks = function (topBlocks) {
  for (var x = 0, block; block = topBlocks[x]; x++) {
    if (Blockly.Java.floatingBlock(block) == false) {
      jBridgeTopBlockCodesList.push(Blockly.Java.parseBlock(block));
    }
  }
};

/**
 * Determines if the block is a floating block. Floating block is any block who's category is not component, variable, or procedure.
 * category (i.e. Colors, Variables, etc.)
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {Boolean} whether block is a floating block.
 */
Blockly.Java.floatingBlock = function (block) {
  if (block == undefined) {
    return false;
  }
  jBridgeIsIndividualBlock = false;
  var blockCategory = block.category;
  if (blockCategory == "Component") {
    return false;
  } else if (blockCategory == "Colors") {
    return true;
  } else if (blockCategory == "Variables") {
    return false;
  } else if (blockCategory == "Math") {
    return true;
  } else if (blockCategory == "Logic") {
    return true;
  } else if (blockCategory == "Procedures") {
    return false;
  } else if (blockCategory == "Control") {
    return true;
  } else if (blockCategory == "Lists") {
    return true;
  } else if (blockCategory == "Text") {
    return true;
  }
  return false;
};


Blockly.Java.getJBridgeInstanceName = function (block) {
  var name = block.instanceName;
  if (jBridgeCurrentScreen == name) {
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

Blockly.Java.parseBlock = function (block) {
  if (block == undefined) {
    return "";
  }
  jBridgeIsIndividualBlock = false;
  var code = "";
  var blockCategory = block.category;
  if (blockCategory == "Component") {
    code = Blockly.Java.parseJBridgeComponentBlock(block);
  } else if (blockCategory == "Colors") {
    code = Blockly.Java.parseJBridgeColorBlock(block);
  } else if (blockCategory == "Variables") {
    code = Blockly.Java.parseJBridgeVariableBlocks(block);
  } else if (blockCategory == "Math") {
    code = Blockly.Java.parseJBridgeMathBlocks(block);
  } else if (blockCategory == "Logic") {
    code = Blockly.Java.parseJBridgeLogicBlocks(block);
  } else if (blockCategory == "Procedures") {
    code = Blockly.Java.parseJBridgeProceduresBlocks(block);
  } else if (blockCategory == "Control") {
    code = Blockly.Java.parseJBridgeControlBlocks(block);
  } else if (blockCategory == "Lists") {
    code = Blockly.Java.parseJBridgeListBlocks(block);
  } else if (blockCategory == "Text") {
    code = Blockly.Java.parseJBridgeTextTypeBlocks(block);
  }
  return code;
};

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
 * Tests a given condition.
 * If the condition is true, performs the actions in a given sequence of blocks
 * @param controlIfBlock The App Inventor Block
 * @return The equivalent Java Code
 */
Blockly.Java.parseJBridgeControlIfBlock = function (controlIfBlock) {
  var code = "";
  var elseCount = controlIfBlock.elseCount_;
  var elseIfCount = controlIfBlock.elseifCount_;
  var ifCondition = "";
  var ifStatement = "";
  if (controlIfBlock.childBlocks_[1].category == "Logic" || controlIfBlock.childBlocks_[1].type == "text_compare") {
    ifCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
    ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]);
  } else {
    ifCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]);
    ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
  }
  code = Blockly.Java.genJBridgeControlIfBlock(ifCondition, ifStatement);
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


Blockly.Java.parseJBridgeVariableBlocks = function (variableBlock) {
  var code = "";
  var componentType = variableBlock.type;
  if (componentType == "lexical_variable_set") {
    code = Blockly.Java.parseJBridgeVariableSetBlock(variableBlock);
    jBridgeIsIndividualBlock = true;
  } else if (componentType == "lexical_variable_get") {
    code = Blockly.Java.parseJBridgeVariableGetBlock(variableBlock);
  } else if (componentType = "global_declaration") {
    code = Blockly.Java.parseJBridgeGlobalIntializationBlock(variableBlock);
    jBridgeIsIndividualBlock = true;
  }
  return code;
};

Blockly.Java.parseJBridgeVariableGetBlock = function (variableGetBlock) {
  var paramName = variableGetBlock.getFieldValue('VAR');
  var paramsMap = new Object();
  //Check if the variable is global or fuction param
  paramsMap = Blockly.Java.getJBridgeParentBlockFieldMap(variableGetBlock.parentBlock_, "component_event", "PARAMETERS");
  paramName = Blockly.Java.getJBridgeRelativeParamName(paramsMap, paramName);
  return Blockly.Java.genJBridgeVariableGetBlock(paramName);
};

Blockly.Java.genJBridgeVariableGetBlock = function (paramName) {
  var code = paramName;
  return code;
};


/**
 *  Iterates through all the parent to find the specific blockType and loads fieldName map
 */
Blockly.Java.getJBridgeParentBlockFieldMap = function (block, blockType, fieldName) {
  if (block != undefined && block != null && block.type == blockType) {
    return Blockly.Java.getFieldMap(block, fieldName);
  }
  if (block == null || block == undefined) {
    return new Object();
  }
  return Blockly.Java.getJBridgeParentBlockFieldMap(block.parentBlock_, blockType, fieldName);
};

Blockly.Java.parseJBridgeVariableSetBlock = function (variableSetBlock) {
  var code = "";
  var leftValue = variableSetBlock.getFieldValue("VAR");
  var paramsMap = new Object();
  //Check if the variable is global or fuction param
  paramsMap = Blockly.Java.getJBridgeParentBlockFieldMap(variableSetBlock.parentBlock_, "component_event", "PARAMETERS");
  leftValue = Blockly.Java.getJBridgeRelativeParamName(paramsMap, leftValue);

  var rightValue = "";
  var type = jBridgeGlobalVarTypes[leftValue];
  for (var x = 0, childBlock; childBlock = variableSetBlock.childBlocks_[x]; x++) {
    var data = Blockly.Java.parseBlock(childBlock);
    type = Blockly.Java.findObjectCastType(type);
    rightValue = "(" + type + ") " + data;
    if (jBridgeIsIndividualBlock) {
      code = code + "\n" + data;
    } else {
      if (childBlock.type == "component_method") {
        var method = childBlock.instanceName + "." + childBlock.methodName;
        if (childBlock.childBlocks_.length > 0) {
          var param1 = Blockly.Java.parseBlock(childBlock.childBlocks_[0]);
          if (param1.slice(0, 1) == "\"" && param1.slice(-1) == "\"") {
            param1 = param1.slice(1, -1);
          }
          method = method + "," + param1;
        }
        if (Blockly.Java.hasTypeCastKey(method, returnTypeCastMap)) {
          rightValue = Blockly.Java.TypeCastOneValue(method, rightValue, returnTypeCastMap);
        }
      } else if (Blockly.Java.hasTypeCastKey(leftValue, returnTypeCastMap)) {
        rightValue = Blockly.Java.TypeCastOneValue(leftValue, rightValue, returnTypeCastMap);
      }
      code = code + Blockly.Java.genJBridgeVariableIntializationBlock(leftValue, rightValue);
    }
  }
  return code;
};

Blockly.Java.findObjectCastType = function (javaType) {
  var castType = javaType;
  if (javaType == JAVA_INT) {
    castType = JAVA_CLASS_INT;
  } else if (javaType == JAVA_BOOLEAN) {
    castType = JAVA_CLASS_BOOLEAN
  } else if (javaType == JAVA_FLOAT) {
    castType = JAVA_CLASS_FLOAT;
  } else if (javaType == JAVA_DOUBLE) {
    castType = JAVA_CLASS_DOUBLE;
  }
  return castType;
};

Blockly.Java.parseJBridgeComponentBlock = function (componentBlock) {
  var code = "";
  var componentType = componentBlock.type;
  if (componentType == "component_event") {
    code = Blockly.Java.parseJBridgeEventBlock(componentBlock);
  } else if (componentType == "component_set_get") {
    if (componentBlock.setOrGet == "set") {
      code = Blockly.Java.parseJBridgeSetBlock(componentBlock);
      jBridgeIsIndividualBlock = true;
    } else {
      code = Blockly.Java.parseJBridgeGetBlock(componentBlock);
    }
  } else if (componentType == "component_method") {
    code = Blockly.Java.parseJBridgeMethodCallBlock(componentBlock);
    Blockly.Java.addPermisionsAndIntents(componentBlock.methodName);
    //ParentBlock is set block and the first child block of parent is currentBlock, then this is arg in the parent's block
    if ((componentBlock.parentBlock_.type == "component_set_get" && componentBlock.parentBlock_.setOrGet == "set" && componentBlock.parentBlock_.childBlocks_[0] == componentBlock)
      || (componentBlock.parentBlock_.type == "text_join")
      || (componentBlock.parentBlock_.type == "component_method" && Blockly.Java.checkInputName(componentBlock.parentBlock_, "ARG") && componentBlock.parentBlock_.childBlocks_[0] == componentBlock)
      || (componentBlock.parentBlock_.type == "lexical_variable_set")) {
      jBridgeIsIndividualBlock = false;
      if (code.slice(-2) == ";\n") {
        code = code.slice(0, -2);
      }
    }
    else {
      jBridgeIsIndividualBlock = true;
    }
  } else if (componentType == "component_component_block") {
    code = Blockly.Java.parseJBridgeComponentComponentBlock(componentBlock);
  } else {
    code = "Invalid Component type : " + componentType;
  }

  return code;
};

/**
 * creates params list from field map generation from the particular component method
 */
Blockly.Java.parseJBridgeMethodCallBlock = function (methodCallBlock) {
  var objectName = methodCallBlock.instanceName;
  var methodName = methodCallBlock.methodName;
  var parentParamMap = Blockly.Java.getFieldMap(methodCallBlock.parentBlock_, "PARAMETERS");
  var test = methodCallBlock.parentBlock_.getFieldValue("ARG0");
  var paramsList = [];
  var code = "";

  //parse all the params Block
  var params = methodParamsMap[methodName];
  var count = 0;
  if (params != undefined) {
    for (var typeIndex in params) {
      var paramBlock = methodCallBlock.childBlocks_[count];
      var genCode = Blockly.Java.parseBlock(paramBlock);

      //assert the param is casted to type required by method
      var requiredType = params[typeIndex];
      genCode = Blockly.Java.assertType(requiredType, genCode, paramBlock);

      if (jBridgeIsIndividualBlock) {
        code = code + genCode + "\n";
      } else {
        paramsList.push(genCode);
      }
      count++;
    }

    //parse next blocks that are not parameters
    while (count < methodCallBlock.childBlocks_.length) {
      var childBlock = methodCallBlock.childBlocks_[count];
      var childCode = Blockly.Java.parseBlock(childBlock);
      code = code + childCode + "\n";
      count++;
    }

    var jBridgeParamList = [];

    for (var y = 0, param; param = paramsList[y]; y++) {
      jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
    }
    if (objectName == "TinyWebDB1" && methodName == "StoreValue") {
      var YailList = "YailList";
      if (!jBridgeImportsMap[YailList]) {
        jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
      }
      jBridgeParamList[1] = "YailList.makeList(" + jBridgeParamList[1] + ")";
    }

    code = Blockly.Java.genJBridgeMethodCallBlock(objectName, methodName, paramsList) + "\n" + code;
  }
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
Blockly.Java.getJBridgeRelativeParamName = function (paramsMap, paramName) {
  var paramIndex = paramsMap[paramName];
  if (paramIndex == undefined) {
    //check for "global " keyword in param name and remove it
    if (paramName.substring(0, 7) == "global ") {
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
Blockly.Java.getFieldMap = function (block, fieldName) {
  var fieldMap = new Object();
  if (block.inputList != undefined) {
    for (var x = 0, input; input = block.inputList[x]; x++) {
      var fieldIndex = 0;
      if (input.name == fieldName) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
          var fieldName = field.getText();
          if (fieldName.replace(/ /g, '').length > 0) {
            eventMethodParamListings[fieldName] = fieldIndex;
            fieldMap[fieldName] = fieldIndex;
            fieldIndex++;
          }
        }
      }
    }
  }
  return fieldMap;
};

Blockly.Java.checkInputName = function (block, inputName) {
  if (block.inputList != undefined) {
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if (input.name.slice(0, inputName.length) == inputName) {
        return true;
      }
    }
  }
  return false;
};

Blockly.Java.hasTypeCastKey = function (key, typeCastMap) {
  if (typeCastMap.has(key)) {
    return true;
  }
  return false;
};

Blockly.Java.getTypeCastValue = function (key, typeCastMap) {
  if (typeCastMap.has(key)) {
    return typeCastMap.get(key);
  }
  return null;
};

/**
 * Will cast the value if the key is contained in the typeCastMap.
 * Will cast floats to whole integers and cast types in paramTypeCastMap
 * @param key The key in the cast map
 * @param value The value to be casted
 * @param typeCastMap The type cast map
 * @return The casted value
 * */
Blockly.Java.TypeCastOneValue = function (key, value, typeCastMap) {
  var v = Blockly.Java.getTypeCastValue(key, typeCastMap);
  var result = "";
  if (v != null) {
    if (Blockly.Java.isNumber(value)) {
      //Java bridge library requires ints/doubles over floats
      result = Math.round(value);
    } else {
      if (value === "True" || value == "False") {
        value = value.toLowerCase();
      }
      result = v[0].replace("XXX", value);
    }
  }
  //casting the color to HEX
  if (value.substring(0, 2) === "&H" && value.length === 10) {
    result = "0x" + value.substring(2);
  }
  return result;
};

Blockly.Java.getFieldList = function (block, fieldName) {
  var fieldsList = [];
  if (block.inputList != undefined) {
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if (input.name == fieldName) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
          var fieldName = field.getText();
          if (fieldName.replace(/ /g, '').length > 0) {
            fieldsList.push(fieldName);
          }
        }
      }
    }
  }
  return fieldsList;
};

Blockly.Java.getProcName = function (block, inputName, fieldName) {
  var procName = "";
  for (var x = 0, input; input = block.inputList[x]; x++) {
    if (input.name == inputName) {
      for (var y = 0, field; field = input.fieldRow[y]; y++) {
        if (field.name == fieldName) {
          procName = field.text_;
        }
      }
    }
  }
  return procName;
};

/* Generates the method call block for the component method
 */
Blockly.Java.genJBridgeMethodCallBlock = function (objectName, methodName, paramsList) {
  var code = "";
// use splice to get all the arguments after 'methodName'
  var args = Array.prototype.splice.call(arguments, 2);
  code = objectName
    + "."
    + methodName
    + "("
    + paramsList.join(", ")
    + ");"

  return code;
};

Blockly.Java.parseJBridgeColorBlock = function (colorBlock) {
  // TOOD Fix the copy pasted or duplicated color palette block
  var color = colorBlock.type.toUpperCase();
  return Blockly.Java.genJBridgeColorBlock(color);
};

Blockly.Java.genJBridgeColorBlock = function (color) {
  return color;
};

Blockly.Java.parseJBridgeGetBlock = function (getBlock) {
  var componentName = Blockly.Java.getJBridgeInstanceName(getBlock);
  var property = getBlock.propertyName;
  return Blockly.Java.genJBridgeGetBlock(componentName, property);
};

Blockly.Java.genJBridgeGetBlock = function (componentName, property) {
  var code = Blockly.Java.JBridgeCheckProperty(componentName, property);
  return code;
};

Blockly.Java.JBridgeCheckProperty = function (componentName, property) {
  var code = "";
  if (Blockly.Java.withinPropertySet(property)) {
    code = "((Float)" + componentName + "." + property + "()" + ").intValue()";
  }
  else {
    code = componentName + "." + property + "()";
  }
  return code;
};

Blockly.Java.withinPropertySet = function (property) {
  return propertyBlockSet.indexOf(property) > -1;
};
/* Parses a set block of any component
*/
Blockly.Java.parseJBridgeSetBlock = function (setBlock) {
  var componentName = Blockly.Java.getJBridgeInstanceName(setBlock);
  var property = setBlock.propertyName;
  var ListPicker = "ListPicker";
  var YailList = "YailList";
  var value = "";
  var code = "";
  //iterate through one child or until the second to last block depending on children
  var childLength = setBlock.childBlocks_.length > 1 ? setBlock.childBlocks_.length - 1 : 1;

  //retreive param types for component set method
  var paramTypes = methodParamsMap[property];
  var supportedMethod = false;
  if (paramTypes != undefined) {
    supportedMethod = true;
  } else {
    console.log("Component Set Method (" + property + ") not supported in " + jBridgeCurrentScreen);
  }
  for (var x = 0, childBlock; x < childLength; x++) {
    childBlock = setBlock.childBlocks_[x];
    var genCode = Blockly.Java.parseBlock(childBlock);

    //assert param is casted to required type
    if (supportedMethod) {
      var paramType = paramTypes[x];
      genCode = Blockly.Java.assertType(paramType, genCode, childBlock);
    }

    if (jBridgeIsIndividualBlock) {
      code = code + genCode + "\n";
    } else {
      value = value + genCode;
    }
  }
  //always cast parameters when parsing procedure
  if (Blockly.Java.shouldParseSetBlockValue(setBlock, setBlock.childBlocks_[0])) {
    //component set methods only take one parameter
    var params = methodParamsMap[property];
    if (params != undefined) {
      var type = params[0];
      value = Blockly.Java.castToType(type, value);
    }
  }
  //If value is not already a string, apply String.valueOf(value)
  if (JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(property) > -1) {
    //setting a string property to an integer should call String.valueOf()
    if (setBlock.childBlocks_[0].category.toLowerCase() == "math"
      || setBlock.childBlocks_[0].category.toLowerCase() == "lists") {
      value = "String.valueOf(" + value + ")";
    }
  }
  if ((componentName.slice(0, ListPicker.length) == ListPicker) && (property == "Elements")) {
    if (!jBridgeImportsMap[YailList]) {
      jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
    }
    value = "YailList.makeList(" + value + ")";
  }

  if (Blockly.Java.isNumber(value)) {
    //Java Bridge requires integers, floating point numbers will throw an exception
    value = Math.round(value);
  }
  code = Blockly.Java.genJBridgeSetBlock(componentName, property, value) + "\n" + code;
  //parse the next block if there is one
  if (setBlock.childBlocks_.length > 1) {
    code += Blockly.Java.parseBlock(setBlock.childBlocks_[setBlock.childBlocks_.length - 1]);
  }
  return code;
};

/**
 * Returns whether a component set block needs to cast its value. For example, this is the case with TinyDB.getValue() where it always
 * returns a Java Object that needs to be casted to the component method's required type.
 * */
Blockly.Java.shouldParseSetBlockValue = function (setBlock, childBlock) {
  var shouldParse = false;
  if (isParsingJBridgeProcedure) {
    shouldParse = true;
  } else if (childBlock.typeName == "TinyDB") {
    shouldParse = true;
  } else if (Blockly.Java.isMathOperationBlock(childBlock)) {
    //Math operations might return doubles
    shouldParse = true;
  }
  return shouldParse;
};

Blockly.Java.genJBridgeSetBlock = function (componentName, property, value) {
  var code = componentName
    + "."
    + property
    + "("
    + value
    + ");";
  return code;
};


/**
 * Parses each event block
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.parseJBridgeEventBlock = function (eventBlock, isChildBlock) {
  var code = "";
  isChildBlock = typeof isChildBlock !== 'undefined' ? isChildBlock : false;
  var componentName = eventBlock.instanceName;
  var eventName = eventBlock.eventName;
  methodParam = eventBlock.eventName; //method param is now eventname instead of methodname in the case of a set/get block
  var body = "";
  //reset the event method params from the last event method generation
  eventMethodParamListings = new Object();
  jBridgeParsingEventMethod = true;
  for (var x = 0, childBlock; childBlock = eventBlock.childBlocks_[x]; x++) {
    body = body
      + "\n"
      + Blockly.Java.parseBlock(childBlock);
  }
  //add any setup code (e.x. List declaration before usage)
  body = jBridgeEventMethodSetupCode + body;
  jBridgeEventMethodSetupCode = "";

  jBridgeParsingEventMethod = false;
  //This is to handle the if the component is the Screen Object
  if (componentName == jBridgeCurrentScreen) {
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
Blockly.Java.genJBridgeEventBlock = function (componentName, eventName, body) {
  var eventMethodName = componentName + eventName;
  var calledMethodParams = Blockly.Java.createCalledMethodParameterString(body);
  var code = "\nif( component.equals(" + componentName + ") && eventName.equals(\"" + eventName + "\") ){\n"
    + eventMethodName + "(" + calledMethodParams + ");\n" //create event method
    + "return true;\n"
    + "}";
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
Blockly.Java.addComponentEventMethod = function (eventMethodName, body) {
  var stringParam = Blockly.Java.createMethodParameterString(body);
  var code = "\npublic void " + eventMethodName + "(" + stringParam + "){\n"
    + body
    + "\n}";
  jBridgeEventMethodsList.push(code);
};

/**
 * This method searches the body of the generated method for the dispatch event
 * parameters. If any parameters are used within the method then they must be passed in
 * as the method's parameter for use in the local scope
 * @param body The body of the generated event method
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.createMethodParameterString = function (body) {
  var parameters = [];
  // var castValue = new Object();
  var index = new Object();
  for (var paramName in eventMethodParamListings) {
    index = eventMethodParamListings[paramName];
    var methodMap = methodParamsMap[methodParam];
    if (methodMap != undefined) {
      var castValue = methodParamsMap[methodParam][index];
      parameters.push(castValue + " " + paramName);
    } else {
      generationErrors.push("Cannot find method param entry for " + methodParam + "." + paramName);
    }
  }
  var stringParam = "";
  for (var i = 0; i < parameters.length; i++) {
    stringParam += parameters[i];
    //skip the comma at the end
    if (i !== parameters.length - 1) {
      stringParam += ", ";
    }
  }
  return stringParam;
};

/**
 * Generates parameters for each method name within dispatchEvent
 *
 * @param {String} body that contains the entire code generation
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.createCalledMethodParameterString = function (body) {
  var stringParam = "";

  if (Blockly.Java.checkCast(methodParam, methodSpecialCases)) { //if it contains special casting
    stringParam = Blockly.Java.specialCast(body, methodParam, eventMethodParamListings, methodSpecialCases);
  } else { //regular cast
    stringParam = Blockly.Java.normalCast(body, methodParam, eventMethodParamListings, methodParamsMap);
  }

  return stringParam;
};

/* *
 * Checks whether or not the casting contains markers that indicate a casting within a casting
 * e.g.((Float)XXX).intValue())
 *
 * @param {Object} method that uses the parameters
 * @param {Object} mapping from method to casting
 * @returns {Boolean} whether or not the statement is true
 */
Blockly.Java.checkCast = function (methodParam, methodSpecialCases) {
  var castValue = Blockly.Java.getTypeCastValue(methodParam, methodSpecialCases);

  if (castValue == null) {
    return false;
  } else {
    return true;
  }
};

//for each value within the eventMethodParams, match the parameter number to the
/* *
 * Basic casting of parameter values (e.g. string, int)
 *
 * @param {String} generated code thus far
 * @param {Object} method that uses the parameters
 * @param {Object} list of parameters
 * @param {Object} mapping from method to casting
 * @returns {String} the generated casting in java
 */
Blockly.Java.normalCast = function (body, methodParam, eventMethodParamListings, methodParamsMap) {
  var parameters = [];
  var stringParam = "";
  var index = new Object(); //get key from methodParasMap

  for (var paramName in eventMethodParamListings) {
    index = eventMethodParamListings[paramName];
    if (methodParamsMap[methodParam] != undefined) {
      var objectCastType = Blockly.Java.findObjectCastType(methodParamsMap[methodParam][index]);
      parameters.push("(" + objectCastType + ")" + "params[" + eventMethodParamListings[paramName] + "]");
    }
  }

  for (var i = 0; i < parameters.length; i++) {
    stringParam += parameters[i];
    //skip the comma at the end
    if (i !== parameters.length - 1) {
      stringParam += ", ";
    }
  }

  return stringParam;
};


/* *
 * Deep casting of each parameter according to their cast. This is determined by
 * the typeCastMap
 *
 * @param {String} generated code thus far
 * @param {String} method that uses the parameters
 * @param {Object} list of parameters
 * @param {Object} mapping from method to casting
 * @param {Boolean} whether or not this is method will be used for casting parameters (true)
 * or within the method (false)
 * @returns {String} the generated casting in java
 */
Blockly.Java.specialCast = function (body, key, paramList, typeCastMap) {
  var v = Blockly.Java.getTypeCastValue(key, typeCastMap);
  var parameters = [];
  var x = 0;
  var stringParam = "";
  if (key == "Duration") {
    jBridgeImportsMap[key] = "import java.util.Calendar;";
  }

  if (v != null) {
    for (var paramName in paramList) {
      parameters.push(v[x].replace(/XXX/g, "params[" + paramList[paramName] + "]"));
      x++;
    }
  }

  for (var i = 0; i < parameters.length; i++) {
    stringParam += parameters[i];

    //skip the comma at the end
    if (i !== parameters.length - 1) {
      stringParam += ", ";
    }
  }

  return stringParam;
};


Blockly.Java.genJBridgeEventDispatcher = function (eventName) {
  return "EventDispatcher.registerEventForDelegation(this, \"" + eventName + "Event\", \"" + eventName + "\" );";
};

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

Blockly.Java.isSingleMathBlock = function (mathBlock) {
  return singleMathTypes.indexOf(mathBlock.type) > -1;
};

Blockly.Java.isMathOperationBlock = function (mathBlock) {
  return mathOperationBlocks.indexOf(mathBlock.type) >= 0;
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

Blockly.Java.castValueToInteger = function (block, value) {
  var needsCasting = false;
  if (block.category != "Math" && block.category != "Logic") {
    if (block.category == "Variables") {
      if (jBridgeLexicalVarTypes[value] != undefined && jBridgeLexicalVarTypes[value] != JAVA_INT) {
        needsCasting = true;
      } else if (jBridgeGlobalVarTypes[value] != undefined && jBridgeGlobalVarTypes[value] != JAVA_INT) {
        needsCasting = true;
      }
    } else if (block.type == "component_set_get") {
      if (block.setOrGet == "get") {
        var property = block.property;
        if (property == undefined) {
          property = block.propertyName;
        }
        var params = methodParamsMap[property];
        if (params != undefined) {
          var param = params[0];
          if (param != JAVA_INT && param != JAVA_DOUBLE && param != JAVA_FLOAT) {
            needsCasting = true;
          }
        }
      }
    } else {
      if (value.search(".intValue()") < 0) {
        needsCasting = true;
      }
    }
  }
  if (needsCasting) {
    //Need to force cast Objects returned by Lists to int
    if (block.category == "Lists") {
      value = "(int)" + value
    }
    value = "Integer.valueOf(" + value + ")";
  }

  return value;
};

Blockly.Java.castObjectChildToInteger = function (block, childNumber, value) {
  if (block.childBlocks_[childNumber - 1].category != "Math") {
    if (block.childBlocks_[childNumber - 1].category != "Variables") {
      value = "(int) " + value;
    } else if (jBridgeLexicalVarTypes[value] != undefined && jBridgeLexicalVarTypes[value] != JAVA_INT) {
      value = "(int) " + value;
    }
  }
  return value;
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
 * gives the min or max of two given numbers
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathOnListBlock = function (mathBlock) {
  var code = "";
  var operand = mathBlock.getFieldValue('OP');
  var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  if (leftValue.slice(-7) == ".Text()") {
    leftValue = "Integer.parseInt(" + leftValue + ")";
  }
  var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
  if (rightValue.slice(-7) == ".Text()") {
    rightValue = "Integer.parseInt(" + rightValue + ")";
  }
  //Math.min() or Math.max()
  code += "Math." + operand.toLowerCase() + "(" + leftValue + ", " + rightValue + ")";
  return code;
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
Blockly.Java.parseJBridgeMathNumberBlock = function (mathBlock) {
  var numberValue;
  //Assuming numver value always in the fieldRow[0] in inputlist[0].
  numberValue = mathBlock.getFieldValue('NUM');
  return Blockly.Java.genJBridgeMathNumberBlock(numberValue);
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

Blockly.Java.genJBridgeMathNumberBlock = function (numberValue) {
  var code = "";
  code = numberValue;
  return code;
};

Blockly.Java.parseJBridgeGlobalIntializationBlock = function (globalBlock) {
  var leftValue;
  var rightValue;

  leftValue = globalBlock.getFieldValue('NAME').replace("global ", "");
  rightValue = "";
  for (var x = 0, childBlock; childBlock = globalBlock.childBlocks_[x]; x++) {
    rightValue = rightValue
      + Blockly.Java.parseBlock(childBlock);
  }

  var childType = globalBlock.childBlocks_[0].category;
  //TODO change get value type to pass the block. List blocks dont always return lists (select item block)
  var variableType = Blockly.Java.getValueType(childType, rightValue, globalBlock.childBlocks_[0]);

  jBridgeGlobalVarTypes[leftValue] = variableType;
  jBridgeVariableDefinitionMap[leftValue] = variableType;


  jBridgeInitializationList.push(Blockly.Java.genJBridgeVariableIntializationBlock(leftValue, rightValue));

  return "";
};

/**
 * Returns whether the given value is a number or not
 * @param value The value to check
 * @return whether it is an int or not
 * */
Blockly.Java.isNumber = function (value) {
  return !isNaN(value);
};

Blockly.Java.getValueType = function (childType, value, block) {
  var variableType = JAVA_STRING;

  if (childType == "Math") {
    if (value.indexOf(".") != -1) {
      variableType = JAVA_FLOAT;
    } else {
      variableType = JAVA_INT;
    }
  } else if (childType == "Logic") {
    variableType = JAVA_BOOLEAN;
  } else if (childType == "Lists") {
    if (block.type == "lists_select_item") {
      variableType = JAVA_OBJECT;
    } else {
      variableType = TYPE_JAVA_ARRAYLIST;
    }
  } else if (childType == "Colors") {
    variableType = JAVA_INT;
  }
  return variableType;
};

Blockly.Java.genJBridgeVariableIntializationBlock = function (leftValue, rightValue) {
  var code = "";
  code = leftValue
    + " = "
    + rightValue
    + ";";
  return code
};

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

Blockly.Java.isStringBlock = function (block) {
  var isString = false;
  if (JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(block.propertyName) == 0) {
    isString = true;
  } else if (block.category == "Variables") {
    var varName = block.fieldVar_.name;
    if (jBridgeVariableDefinitionMap[varName] == JAVA_STRING) {
      isString = true;
    }
  } else if (block.category == "Text") {
    isString = true;
  }
  return isString;
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

Blockly.Java.parseJBridgeProceduresBlocks = function (proceduresBlock) {
  var code = "";
  var proceduresType = proceduresBlock.type;
  if (proceduresType == "procedures_defnoreturn") {
    code = Blockly.Java.parseJBridgeProcDefNoReturn(proceduresBlock);
  } else if (proceduresType == "procedures_callnoreturn") {
    code = Blockly.Java.parseJBridgeProcCallNoReturn(proceduresBlock);
  }
  jBridgeIsIndividualBlock = true;
  return code;
};

Blockly.Java.parseJBridgeProcDefNoReturn = function (proceduresBlock) {
  var code = "";
  var procName = proceduresBlock.getFieldValue("NAME");
  var procParams = [];
  for (var x = 0, params; params = proceduresBlock.arguments_[x]; x++) {
    procParams.push("Object " + params);
  }

  isParsingJBridgeProcedure = true;
  var statementList = [];
  for (var x = 0, childBlock; childBlock = proceduresBlock.childBlocks_[x]; x++) {
    statementList.push(Blockly.Java.parseBlock(childBlock));
  }
  isParsingJBridgeProcedure = false;
  var body = statementList.join("\n");

  jBridgeProceduresMap[procName] = Blockly.Java.genJBridgeProcDefNoReturn(procName, procParams.join(", "), body);

  return code;
};

/**
 * Generates parameters for each method
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeProcDefNoReturn = function (procedureName, procedureParams, body) {
  var code = "\npublic void "
    + procedureName
    + "("
    + procedureParams
    + "){\n"
    + body
    + "\n}";
  return code;
}

Blockly.Java.parseJBridgeProcCallNoReturn = function (proceduresBlock) {
  var procName = proceduresBlock.getFieldValue("PROCNAME");
  var paramsList = [];
  var code = "";
  var parentParamMap = Blockly.Java.getFieldMap(proceduresBlock.parentBlock_, "PARAMETERS");
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = proceduresBlock.childBlocks_[y]; y++) {
    var genCode = Blockly.Java.parseBlock(paramBlock);
    if (jBridgeIsIndividualBlock) {
      code = code + genCode + "\n";
    } else {
      paramsList.push(genCode);
    }
  }

  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++) {
    jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
  }

  return Blockly.Java.genJBridgeProcCallNoReturn(procName, jBridgeParamList) + "\n" + code;
};

Blockly.Java.genJBridgeProcCallNoReturn = function (procName, paramsList) {
  var code = procName
    + "("
    + paramsList.join(",")
    + ");";

  return code;
};

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
 *  Generates string comparison in java code
 *
 * @params {String} leftValue
 * @params {String} rightValue
 * @params {String} op
 * @return {String} code if there are no errors
 */

Blockly.Java.getJBridgeTextCompareBlock = function (leftValue, rightValue, op) {
  var code = "(String.valueOf("
    + leftValue
    + ").compareTo(String.valueOf("
    + rightValue
    + ")) "
    + op
    + ")";
  return code;
};

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
 * Generates java code for a new ArrayList of type Object
 * The List is of type "Object" because App Inventor lists take many types
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeNewList = function (type) {
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
Blockly.Java.genJBridgeListsAddItemBlock = function (listName, addItem) {
  addItem = Blockly.Java.removeColonsAndNewlines(addItem);
  var code = listName
    + ".add("
    + addItem
    + "); \n";
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
 *  Translates JBridge math operator from parsed blocks
 *
 * @params {String} operator
 * @returns {String} returns java-translated version of desired operator
 */
Blockly.Java.getJBridgeOperator = function (operator) {
  var op = operator;
  if (operator == "GT") {
    op = ">";
  } else if (operator == "LT") {
    op = "<";
  } else if (operator == "EQ" || operator == "EQUAL") {
    op = "==";
  } else if (operator == "NEQ") {
    op = "!=";
  } else if (operator == "GTE") {
    op = ">=";
  } else if (operator == "LTE") {
    op = "<=";
  } else if (operator == 'AND') {
    op = "&&";
  } else if (operator == "OR") {
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
Blockly.Java.parseJBridgeListLengthBlock = function (listBlock) {
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  return Blockly.Java.genJBridgeListLengthBlock(listName);
};

/**
 *  Generates code list.size()
 *
 * @params {String} listName
 * @returns {String} code generated if no errors
 */
Blockly.Java.genJBridgeListLengthBlock = function (listName) {
  var code = listName + ".size()"
  return code;
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

Blockly.Java.parseJBridgeComponentComponentBlock = function (componentBlock) {
  var name = componentBlock.instanceName;
  return Blockly.Java.genJBridgeComponentComponentBlock(name);
};

Blockly.Java.genJBridgeComponentComponentBlock = function (name) {
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
Blockly.Java.parseJBridgeMathRandomFloatBlock = function (mathBlock) {
  var name = "random";
  if (!jBridgeVariableDefinitionMap[name]) {
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
Blockly.Java.genJBridgeMathRandomFloatBlock = function () {
  var code = "(random.nextFloat())"
  return code;
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
  var genCode = ""
  for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
    genCode = genCode + Blockly.Java.parseBlock(childBlock);
  }
  return Blockly.Java.genJBridgeListIsListBlock(genCode);
};

Blockly.Java.genJBridgeListIsListBlock = function (genCode) {
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
Blockly.Java.prettyPrintJBridgeCode = function (javaCode) {
  var stack = new Array();
  var lines = javaCode.split('\n');
  var prityPrint = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line == ";" || line.length == 0) {
      continue;
    }
    var lastChar = line.slice(-1);
    var indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    if (lastChar == "{") {
      stack.push("{");
    } else if (lastChar == "}") {
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
Blockly.Java.prityPrintIndentationJBridge = function (indentLength) {
  var indentation = "";
  for (var j = 0; j < indentLength; j++) {
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
Blockly.Java.getManifestJSONData = function (formJson) {
  Blockly.Java.initAndroidPermisionAndIntent();
  var jsonObject = JSON.parse(formJson);
  Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject);

  //forming json return string
  var jsonReturn = "{";
  jsonReturn += "\"screenName\": \"" + jBridgeCurrentScreen + "\",";

  jsonReturn += "\"intents\": [";
  var added = false;
  for (var key in jBridgeIntentsToAdd) {
    jsonReturn += "{\"intent\": \"" + jBridgeAndroidIntents[key].replace(/["]/g, "'") + "\"},";
    added = true;
  }
  //remove last comma
  if (added == true) {
    jsonReturn = jsonReturn.slice(0, -1);
  }
  jsonReturn += "],";

  added = false;
  jsonReturn += "\"permissions\": [";
  for (var key in jBridgePermissionToAdd) {
    jsonReturn += "{\"permission\": \"" + jBridgeAndroidPermisions[key].replace(/["]/g, "'") + "\"},";
    added = true;
  }
  //remove last comma
  if (added == true) {
    jsonReturn = jsonReturn.slice(0, -1);
  }
  //removing newline characters
  jsonReturn = jsonReturn.replace(/[\r\n]*/g, "");
  jsonReturn += "]";
  jsonReturn += "}";
  return jsonReturn;
};

/**
 *  Defines the permissions and intents strings
 *
 */
Blockly.Java.initAndroidPermisionAndIntent = function () {
  //This includes method Names or Type
  jBridgeAndroidPermisions["receive_sms"] = "<uses-permission android:name=\"android.permission.RECEIVE_SMS\"/>\r\n\r\n    ";
  jBridgeAndroidPermisions["send_sms"] = "<uses-permission android:name=\"android.permission.SEND_SMS\"/>\r\n\r\n    ";
  jBridgeAndroidPermisions["voice_receive_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.RECEIVE_SMS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["voice_send_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.SEND_SMS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["manage_accounts"] = "<uses-permission android:name=\"android.permission.MANAGE_ACCOUNTS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["get_accounts"] = "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["use_credentials"] = "<uses-permission android:name=\"android.permission.USE_CREDENTIALS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["vibrate"] = "<uses-permission android:name=\"android.permission.VIBRATE\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["internet"] = "<uses-permission android:name=\"android.permission.INTERNET\" />\r\n\r\n    ";

  jBridgeMethodAndTypeToPermisions["vibrate"] = ["vibrate"];
  jBridgeMethodAndTypeToPermisions["tinywebdb"] = ["internet"];
  jBridgeMethodAndTypeToPermisions["sendmessage"] = ["receive_sms", "send_sms", "voice_receive_sms", "voice_send_sms", "manage_accounts", "get_accounts", "use_credentials"];

  //This includes method Names or Type
  jBridgeAndroidIntents["sendmessage"] = "<receiver android:name=\"com.google.appinventor.components.runtime.util.SmsBroadcastReceiver\"\r\n\r\n android:enabled=\"true\" android:exported=\"true\">\r\n\r\n"
    + "<intent-filter>\r\n\r\n        \r\n\r\n        "
    + "<action android:name=\"android.provider.Telephony.SMS_RECEIVED\"/>\r\n\r\n        "
    + "<action android:name=\"com.google.android.apps.googlevoice.SMS_RECEIVED\"/>\r\n\r\n"
    + "</intent-filter>\r\n\r\n"
    + "</receiver>\r\n\r\n    ";
};

/**
 *  Adds the permissions and intents to the AndroidManifest.xml file
 *
 * @params name
 */
Blockly.Java.addPermisionsAndIntents = function (name) {
  name = name.toLowerCase();
  if (name in jBridgeMethodAndTypeToPermisions) {
    var permissions = jBridgeMethodAndTypeToPermisions[name];
    for (var i = 0; i < permissions.length; i++) {
      jBridgePermissionToAdd[permissions[i]] = true;
    }
  }
  if (name in jBridgeAndroidIntents) {
    jBridgeIntentsToAdd[name] = true;
  }
};

/**
 * Method that strips all of the ";" and "\n" characters from the code.
 * Used for methods that are generated but wrapped within another method
 * @param {String} the code to strip
 * @return {String} the stripped code
 */
Blockly.Java.removeColonsAndNewlines = function (code) {
  return code.replace(/[;\n]*/g, "");
};

/**
 * Asserts that the given code will be casted to the required type
 * @param type The type to cast to
 * @param code The code to cast
 * @param childBlock The Block used to generate the code
 */
Blockly.Java.assertType = function (type, code, childBlock) {
  var castedCode = code;
  switch (type) {
    case JAVA_STRING:
      castedCode = Blockly.Java.castValueToString(childBlock, code);
      break;
    case JAVA_INT:
      castedCode = Blockly.Java.castValueToInteger(childBlock, code);
      break;
    case JAVA_FLOAT:
      castedCode = "Float.valueOf(" + code + ")";
      break;
    case JAVA_ARRAY_LIST:
      castedCode = Blockly.Java.castValueToArrayList(childBlock, code);
  }
  return castedCode;
};

Blockly.Java.castValueToArrayList = function (block, value) {
  var needsCasting = false;
  if (block.category != "Lists") {
    needsCasting = true;
  }
  if (needsCasting) {
    value = Blockly.Java.castToType(JAVA_ARRAY_LIST, value);
  }

  return value;
};

Blockly.Java.castValueToString = function (block, value) {
  var needsCasting = false;
  if (block.category != "Text") {
    if (block.category == "Variables") {
      if (jBridgeLexicalVarTypes[value] != undefined && jBridgeLexicalVarTypes[value] != JAVA_STRING) {
        needsCasting = true;
      } else if (jBridgeGlobalVarTypes[value] != undefined && jBridgeGlobalVarTypes[value] != JAVA_STRING) {
        needsCasting = true;
      }
    } else if (block.type == "component_set_get") {
      if (block.setOrGet == "get") {
        var property = block.property;
        if (property == undefined) {
          property = block.propertyName;
        }
        var params = methodParamsMap[property];
        if (params != undefined) {
          var param = params[0];
          if (param != JAVA_STRING) {
            needsCasting = true;
          }
        }
      }
    } else if (block.category == "Math") {
      needsCasting = true;
    }
  }
  if (needsCasting) {
    value = Blockly.Java.castToType(JAVA_STRING, value);
  }

  return value;
};

/**
 * Casts the given value to the given Java type
 */
Blockly.Java.castToType = function (type, code) {
  var castedCode = code;
  switch (type) {
    case JAVA_STRING:
      castedCode = "String.valueOf(" + code + ")";
      break;
    case JAVA_INT:
      castedCode = "Integer.valueOf(" + code + ")";
      break;
    case JAVA_FLOAT:
      castedCode = "(float) (" + code + ")";
      break;
    case JAVA_ARRAY_LIST:
      castedCode = "((List)" + code + ")";
      jBridgeImportsMap["List"] = "import java.util.List;";
      break;
  }
  return castedCode;
};
