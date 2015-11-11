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
Blockly.Yail.RESERVED_WORDS_ = '';

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/Yail/Reference/Operators/Operator_Precedence
 */
Blockly.Yail.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Yail.ORDER_NONE = 99;          // (...)

Blockly.Yail.YAIL_ADD_COMPONENT = "(add-component ";
Blockly.Yail.YAIL_ADD_TO_LIST = "(add-to-list ";
Blockly.Yail.YAIL_BEGIN = "(begin ";
Blockly.Yail.YAIL_CALL_COMPONENT_METHOD = "(call-component-method ";
Blockly.Yail.YAIL_CALL_COMPONENT_TYPE_METHOD = "(call-component-type-method ";
Blockly.Yail.YAIL_CALL_YAIL_PRIMITIVE = "(call-yail-primitive ";
Blockly.Yail.YAIL_CLEAR_FORM = "(clear-current-form)";
// The lines below are complicated because we want to support versions of the
// Companion older then 2.20ai2 which do not have set-form-name defined
Blockly.Yail.YAIL_SET_FORM_NAME_BEGIN = "(try-catch (let ((attempt (delay (set-form-name \"";
Blockly.Yail.YAIL_SET_FORM_NAME_END = "\")))) (force attempt)) (exception java.lang.Throwable 'notfound))";
Blockly.Yail.YAIL_CLOSE_COMBINATION = ")";
Blockly.Yail.YAIL_CLOSE_BLOCK = ")\n";
Blockly.Yail.YAIL_COMMENT_MAJOR = ";;; ";
Blockly.Yail.YAIL_COMPONENT_REMOVE = "(remove-component ";
Blockly.Yail.YAIL_COMPONENT_TYPE = "component";
Blockly.Yail.YAIL_DEFINE = "(def ";
Blockly.Yail.YAIL_DEFINE_EVENT = "(define-event ";
Blockly.Yail.YAIL_DEFINE_FORM = "(define-form ";
Blockly.Yail.YAIL_DO_AFTER_FORM_CREATION = "(do-after-form-creation ";
Blockly.Yail.YAIL_DOUBLE_QUOTE = "\"";
Blockly.Yail.YAIL_FALSE = "#f";
Blockly.Yail.YAIL_FOREACH = "(foreach ";
Blockly.Yail.YAIL_FORRANGE = "(forrange ";
Blockly.Yail.YAIL_GET_COMPONENT = "(get-component ";
Blockly.Yail.YAIL_GET_PROPERTY = "(get-property ";
Blockly.Yail.YAIL_GET_COMPONENT_TYPE_PROPERTY = "(get-property-and-check  ";
Blockly.Yail.YAIL_GET_VARIABLE = "(get-var ";
Blockly.Yail.YAIL_AND_DELAYED = "(and-delayed ";
Blockly.Yail.YAIL_OR_DELAYED = "(or-delayed ";
Blockly.Yail.YAIL_IF = "(if ";
Blockly.Yail.YAIL_INIT_RUNTIME = "(init-runtime)";
Blockly.Yail.YAIL_INITIALIZE_COMPONENTS = "(call-Initialize-of-components";
Blockly.Yail.YAIL_LET = "(let ";
Blockly.Yail.YAIL_LEXICAL_VALUE = "(lexical-value ";
Blockly.Yail.YAIL_SET_LEXICAL_VALUE = "(set-lexical! ";
Blockly.Yail.YAIL_LINE_FEED = "\n";
Blockly.Yail.YAIL_NULL = "(get-var *the-null-value*)";
Blockly.Yail.YAIL_EMPTY_LIST = "'()";
Blockly.Yail.YAIL_OPEN_BLOCK = "(";
Blockly.Yail.YAIL_OPEN_COMBINATION = "(";
Blockly.Yail.YAIL_QUOTE = "'";
Blockly.Yail.YAIL_RENAME_COMPONENT = "(rename-component ";
Blockly.Yail.YAIL_SET_AND_COERCE_PROPERTY = "(set-and-coerce-property! ";
Blockly.Yail.YAIL_SET_AND_COERCE_COMPONENT_TYPE_PROPERTY = "(set-and-coerce-property-and-check! ";
Blockly.Yail.YAIL_SET_SUBFORM_LAYOUT_PROPERTY = "(%set-subform-layout-property! ";
Blockly.Yail.YAIL_SET_VARIABLE = "(set-var! ";
Blockly.Yail.YAIL_SET_THIS_FORM = "(set-this-form)\n ";
Blockly.Yail.YAIL_SPACER = " ";
Blockly.Yail.YAIL_TRUE = "#t";
Blockly.Yail.YAIL_WHILE = "(while ";
Blockly.Yail.YAIL_LIST_CONSTRUCTOR = "*list-for-runtime*";

Blockly.Yail.SIMPLE_HEX_PREFIX = "&H";
Blockly.Yail.YAIL_HEX_PREFIX = "#x";

// permit leading and trailing whitespace for checking that strings are numbers
Blockly.Yail.INTEGER_REGEXP = "^[\\s]*[-+]?[0-9]+[\\s]*$";
Blockly.Yail.FLONUM_REGEXP = "^[\\s]*[-+]?([0-9]*)((\\.[0-9]+)|[0-9]\\.)[\\s]*$";


Blockly.Yail.JBRIDGE_BASE_IMPORTS = "import com.google.appinventor.components.runtime.HandlesEventDispatching; \nimport com.google.appinventor.components.runtime.EventDispatcher; \nimport com.google.appinventor.components.runtime.Form; \nimport com.google.appinventor.components.runtime.Component; \n";
Blockly.Yail.JBRIDGE_PACKAGE_NAME = "\npackage org.appinventor.Screen1; \n";

// Blockly.Yail.JBRIDGE_DECLARE = [];
// Blockly.Yail.JBRIDGE_DEFINE = [];
// Blockly.Yail.JBRIDGE_IMPORTS = [];
var jBridgeTopBlockCodesList = [];
var jBridgeRegisterEventMap = new Object();
var jBridgeEventsList = [];
var jBridgeVariableDefinitionMap = new Object();
var jBridgeInitializationList = [];
var jBridgeComponentMap = new Object();
var JBRIDGE_COMPONENT_SKIP_PROPERTIES = ["Uuid", "$Version", "TextAlignment"]; //properties to skip when reading Json File
var JBRIDGE_JSON_TEXT_PROPERTIES = ["Title", "Text", "BackgroundImage", "Image", "Icon", "Source", "Picture", "Hint"]; //Properties that should include the double qoutes "" in the output JBridge Javacode
var jBridgeImportsMap = new Object();
var jBridgeProceduresMap = new Object();
var jBridgeIsIndividualBlock = false; // is to Identify if a block is Iduvidal root block or sub-block
var jBridgeCurrentScreen = "Screen1";
var JBRIDGE_COMPONENT_TEXT_PROPERTIES = ["text", "picture", "source"];
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
  // TODO: check for JSON parse error
  var componentNames = [];
  var formProperties; 
  var formName;
  var code = [];
  var javaCode = [];
  if (jsonObject.Properties) {
    formProperties = jsonObject.Properties;
    formName = formProperties.$Name;
  } else {
    throw "Cannot find form properties";
  }
  if (!formName) {
    throw "Unable to determine form name";
  }
  
  code.push("\n######################################\n");
  var my_all_blocks = Blockly.mainWorkspace.getAllBlocks();
  code.push(my_all_blocks);
  code.push("\n######################################\n");

  code.push("\n------------------------------------\n");
  javaCode.push(Blockly.Yail.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject));
  code.push("\n------------------------------------\n");
  if (!forRepl) {
    code.push(Blockly.Yail.getYailPrelude(packageName, formName));
  }
    
  var componentMap = Blockly.Component.buildComponentMap([], [], false, false);
  
  for (var comp in componentMap.components)
    componentNames.push(comp);

  var globalBlocks = componentMap.globals;
  for (var i = 0, block; block = globalBlocks[i]; i++) {
    code.push(Blockly.Yail.blockToCode(block));
  }
  
  if (formProperties) {
    var sourceType = jsonObject.Source;
    if (sourceType == "Form") {
      code = code.concat(Blockly.Yail.getComponentLines(formName, formProperties, null /*parent*/, 
        componentMap, false /*forRepl*/));
    } else {
      throw "Source type " + sourceType + " is invalid.";
    }
  
    // Fetch all of the components in the form, this may result in duplicates
    componentNames = Blockly.Yail.getDeepNames(formProperties, componentNames);
    // Remove the duplicates
    var uniqueNames = componentNames.filter(function(elem, pos) {
        return componentNames.indexOf(elem) == pos});
    componentNames = uniqueNames;

    // Add runtime initializations
    code.push(Blockly.Yail.YAIL_INIT_RUNTIME);
  
    if (forRepl) {
      code = Blockly.Yail.wrapForRepl(formName, code, componentNames);
    }

    // TODO?: get rid of empty property assignments? I'm not convinced this is necessary.
    // The original code in YABlockCompiler.java attempts to do this, but it matches on 
    // "set-property" rather than "set-and-coerce-property" so I'm not sure it is actually
    // doing anything. If we do need this, something like the call below might work.
    // 
    // finalCode = code.join('\n').replace(/\\(set-property.*\"\"\\)\\n*/mg, "");
  }
  
  return Blockly.Java.prityPrintJBridgeCode(javaCode.join('\n'));  // Blank line between each section.
};

Blockly.Yail.getDeepNames = function(componentJson, componentNames) {
  if (componentJson.$Components) {
    var children = componentJson.$Components;
    for (var i = 0, child; child = children[i]; i++) {
      componentNames.push(child.$Name);
      componentNames = Blockly.Yail.getDeepNames(child, componentNames);
    }
  }
  return componentNames;
}

/**
 * Generate the beginning Yail code for an APK compilation (i.e., not the REPL)
 * 
 * @param {String} packageName  the name of the package for the app
 *     (e.g. "appinventor.ai_somebody.myproject.Screen1")
 * @param {String} formName  (e.g., "Screen1")
 * @returns {String} Yail code
 * @private
*/
Blockly.Yail.getYailPrelude = function(packageName, formName) {
 return "#|\n$Source $Yail\n|#\n\n"
     + Blockly.Yail.YAIL_DEFINE_FORM
     + packageName
     + Blockly.Yail.YAIL_SPACER
     + formName
     + Blockly.Yail.YAIL_CLOSE_BLOCK
     + "(require <com.google.youngandroid.runtime>)\n";
}

/**
 * Wraps Yail code for use in the REPL and returns the new code as an array of strings
 * 
 * @param {String} formName 
 * @param {Array} code  code strings to be wrapped
 * @param {Array} componentNames array of component names
 * @returns {Array} wrapped code strings
 * @private
 */
Blockly.Yail.wrapForRepl = function(formName, code, componentNames) {
  var replCode = [];
  replCode.push(Blockly.Yail.YAIL_BEGIN);
  replCode.push(Blockly.Yail.YAIL_CLEAR_FORM);
  if (formName != "Screen1") {
    // If this form is not named Screen1, then the REPL won't be able to resolve any references
    // to it or to any properties on the form itself (such as Title, BackgroundColor, etc) unless
    // we tell it that "Screen1" has been renamed to formName.
    // By generating a call to rename-component here, the REPL will rename "Screen1" to formName
    // in the current environment. See rename-component in runtime.scm.
    replCode.push(Blockly.Yail.getComponentRenameString("Screen1", formName));
  }
  replCode = replCode.concat(code);
  replCode.push(Blockly.Yail.getComponentInitializationString(formName, componentNames));
  replCode.push(Blockly.Yail.YAIL_CLOSE_BLOCK);
  return replCode;
}

/**
 * Return code to initialize all components in componentMap.
 * 
 * @param {Array} componentNames array of names of components in the workspace
 * @returns {Array} code strings
 * @private
 */
Blockly.Yail.getComponentInitializationString = function(formName, componentNames) {
  var code = Blockly.Yail.YAIL_INITIALIZE_COMPONENTS;
  code += " " + Blockly.Yail.YAIL_QUOTE + formName;
  for (var i = 0, cName; cName = componentNames[i]; i++) {  // TODO: will we get non-component fields this way?
    if (cName != formName)                                  // Avoid duplicate initialization of the form
      code = code + " " + Blockly.Yail.YAIL_QUOTE + cName;
  }
  code = code + ")";
  return code;
}

/**
 * Generate Yail code for the component described by componentJson, and all of its child
 * components (if it has any). componentJson may describe a Form or a regular component. The
 * generated code includes adding each component to the form, as well as generating code for
 * the top-level blocks for that component.
 *
 * @param {String} formName
 * @param {String} componentJson JSON string describing the component
 * @param {String} parentName  the name of the component that contains this component (which may be
 *    its Form, for top-level components).
 * @param {Object} componentMap map from component names to the top-level blocks for that component
 *    in the workspace. See the Blockly.Component.buildComponentMap description for the structure.
 * @param {Boolean} forRepl true iff we're generating code for the REPL rather than an apk.
 * @returns {Array} code strings
 * @private
 */
Blockly.Yail.getComponentLines = function(formName, componentJson, parentName, componentMap, 
  forRepl) {
  var code = [];
  var componentName = componentJson.$Name;
  if (componentJson.$Type == 'Form') {
    code = Blockly.Yail.getFormPropertiesLines(formName, componentJson, !forRepl);
  } else {
    code = Blockly.Yail.getComponentPropertiesLines(formName, componentJson, parentName, !forRepl);
  }

  if (!forRepl) {
    // Generate code for all top-level blocks related to this component
    if (componentMap.components && componentMap.components[componentName]) {
      var componentBlocks = componentMap.components[componentName];
      for (var i = 0, block; block = componentBlocks[i]; i++) {
        code.push(Blockly.Yail.blockToCode(block));
      }
    }
  }

  // Generate code for child components of this component
  if (componentJson.$Components) {
    var children = componentJson.$Components;
    for (var i = 0, child; child = children[i]; i++) {
      code = code.concat(Blockly.Yail.getComponentLines(formName, child, componentName, 
        componentMap, forRepl));
    }
  }
  return code;  
};

/**
 * Generate Yail to add the component described by componentJson to its parent, followed by
 * the code that sets each property of the component (for all its properties listed in
 * componentJson).
 * 
 * @param {String} formName
 * @param {String} componentJson JSON string describing the component
 * @param {String} parentName  the name of the component that contains this component (which may be
 *    its Form, for top-level components).
 * @param {Boolean} whether to include comments in the generated code
 * @returns {Array} code strings
 * @private
 */
Blockly.Yail.getComponentPropertiesLines = function(formName, componentJson, parentName, 
  includeComments) {
  var code = [];
  var componentName = componentJson.$Name;
  var componentType = componentJson.$Type;
  // generate the yail code that adds the component to its parent, followed by the code that
  // sets each property of the component
  if (includeComments) {
    code.push(Blockly.Yail.YAIL_COMMENT_MAJOR + componentName + Blockly.Yail.YAIL_LINE_FEED);
  }
  code.push(Blockly.Yail.YAIL_ADD_COMPONENT + parentName + Blockly.Yail.YAIL_SPACER + 
    componentType + Blockly.Yail.YAIL_SPACER + componentName + Blockly.Yail.YAIL_SPACER);
  code = code.concat(Blockly.Yail.getPropertySettersLines(componentJson, componentName));
  code.push(Blockly.Yail.YAIL_CLOSE_BLOCK);
  return code;
}

/**
 * Generate Yail to set the properties for the Form described by componentJson.
 * 
 * @param {String} formName
 * @param {String} componentJson JSON string describing the component
 * @param {Boolean} whether to include comments in the generated code
 * @returns {Array} code strings
 * @private
 */
Blockly.Yail.getFormPropertiesLines = function(formName, componentJson, includeComments) {
  var code = [];
  if (includeComments) {
    code.push(Blockly.Yail.YAIL_COMMENT_MAJOR + formName + Blockly.Yail.YAIL_LINE_FEED);
  }
  var yailForComponentProperties = Blockly.Yail.getPropertySettersLines(componentJson, formName);
  if (yailForComponentProperties.length > 0) {
    // getPropertySettersLine returns an array of lines.  So we need to 
    // concatenate them (using join) before pushing them onto the Yail expression.
    // WARNING:  There may be other type errors of this sort in this file, which
    // (hopefully) will be uncovered in testing. Please
    // be alert for these errors and check carefully.
    code.push(Blockly.Yail.YAIL_DO_AFTER_FORM_CREATION + yailForComponentProperties.join(" ") + 
      Blockly.Yail.YAIL_CLOSE_BLOCK);
  }
  return code;
}

/**
 * Generate the code to set property values for the specifed component.
 *
 * @param {Object} componentJson JSON String describing the component
 * @param {String} componentName the name of the component (also present in the $Name field in
 *    componentJson)
 * @returns {Array} code strings
 * @private
 */
Blockly.Yail.getPropertySettersLines = function(componentJson, componentName) {
  var code = [];
  for (var prop in componentJson) {
    if (prop.charAt(0) != "$" && prop != "Uuid") {
      code.push(Blockly.Yail.getPropertySetterString(componentName, componentJson.$Type, prop, 
        componentJson[prop]));
    }
  }
  return code;
}

/**
 * Generate the code to set a single property value.
 *
 * @param {String} componentName
 * @param {String} propertyName
 * @param {String} propertyValue
 * @returns code string
 * @private
 */
Blockly.Yail.getPropertySetterString = function(componentName, componentType, propertyName, 
  propertyValue) {
  var code = Blockly.Yail.YAIL_SET_AND_COERCE_PROPERTY + Blockly.Yail.YAIL_QUOTE + 
    componentName + Blockly.Yail.YAIL_SPACER + Blockly.Yail.YAIL_QUOTE + propertyName + 
    Blockly.Yail.YAIL_SPACER;
  var propType = Blockly.Yail.YAIL_QUOTE + 
    Blockly.ComponentTypes[componentType].properties[propertyName].type;
  var value = Blockly.Yail.getPropertyValueString(propertyValue, propType);
  code = code.concat(value + Blockly.Yail.YAIL_SPACER + propType + Blockly.Yail.YAIL_CLOSE_BLOCK);
  return code;
}

/**
 * Generate the Yail code for a property value. Special case handling when propertyType is
 * "'number", "'boolean", "'component", the empty string, or null. For all other property values
 * it returns the value as converted by Blockly.Yail.quotifyForREPL().
 *
 * @param {String} propertyValue
 * @param {String} propertyType
 * @returns code string
 * @private
 */
Blockly.Yail.getPropertyValueString = function(propertyValue, propertyType) {
  if (propertyType == "'number") {
    if (propertyValue.match(Blockly.Yail.INTEGER_REGEXP) 
            || propertyValue.match(Blockly.Yail.FLONUM_REGEXP)) { // integer
      return propertyValue;
    } else if (propertyValue.match(Blockly.Yail.SIMPLE_HEX_PREFIX + "[0-9A-F]+")) { // hex
      return Blockly.Yail.YAIL_HEX_PREFIX + 
        propertyValue.substring(Blockly.Yail.SIMPLE_HEX_PREFIX.length);
    }
  } else if (propertyType == "'boolean") {
    if (-1 != propertyValue.indexOf("False")) {
      return "#f";
    } else if (-1 != propertyValue.indexOf("True")) {
      return "#t";
    }
  } else if (propertyType == "'component") {
    if (propertyValue == "") {
      return "\"\"";
    } else {
      return Blockly.Yail.YAIL_GET_COMPONENT + propertyValue + ")";
    }
  }

  if (propertyValue == "" || propertyValue == "null") {  // empty string
    return "\"\"";
  }
  return Blockly.Yail.quotifyForREPL(propertyValue);
}

/**
 * Generate the code to rename a component
 *
 * @param {String} oldName
 * @param {String} newName
 * @returns {String} code
 * @private
 */
Blockly.Yail.getComponentRenameString = function(oldName, newName) {
  return Blockly.Yail.YAIL_RENAME_COMPONENT + Blockly.Yail.quotifyForREPL(oldName)
    + Blockly.Yail.YAIL_SPACER + Blockly.Yail.quotifyForREPL(newName)
    + Blockly.Yail.YAIL_CLOSE_BLOCK;
}

/**
 * Transform a string to the Kawa input representation of the string, for sending to
 * the REPL, by using backslash to escape quotes and backslashes. But do not escape a backslash
 * if it is part of \n. Then enclose the result in quotes.
 * TODO: Extend this to a complete transformation that deals with the full set of formatting
 * characters.
 *
 * @param {String} s string to be quotified
 * @returns {String}
 * @private
 */
Blockly.Yail.quotifyForREPL = function(s) {
  if (!s) {
    return null;
  } else {
    var sb = [];
    sb.push('"');
    var len = s.length;
    var lastIndex = len - 1;
    for (var i = 0; i < len; i++) {
      c = s.charAt(i);
      if (c == '\\') {
        // If this is \n don't slashify the backslash
        // TODO(user): Make this cleaner and more general
        if (!(i == lastIndex) && s.charAt(i + 1) == 'n') {
          sb.push(c);
          sb.push(s.charAt(i + 1));
          i = i + 1;
        } else {
          sb.push('\\');
          sb.push(c);
        }
      } else if (c == '"') {
        sb.push('\\');
        sb.push(c);
      } else {
        var u = s.charCodeAt(i);  // unicode of c
        if (u < ' '.charCodeAt(0) || u > '~'.charCodeAt(0)) {
          // Replace any special chars with \u1234 unicode
          var hex = "000" + u.toString(16);
          hex = hex.substring(hex.length - 4);
          sb.push("\\u" + hex);
        } else {
          sb.push(c);
        }
      }
    }
    sb.push('"');
    return sb.join("");
  }
}

/**
 * Encode a string as a properly escaped Yail string, complete with quotes.
 * @param {String} string Text to encode.
 * @return {String} Yail string.
 * @private
 */

Blockly.Yail.quote_ = function(string) {
  string = Blockly.Yail.quotifyForREPL(string);
  if (!string) {                // quotifyForREPL can return null for
    string = '""';              // empty string
  }
  return string;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Yail.scrubNakedValue = function(line) {
  return line;
};

/**
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Yail code created for this block.
 * @param {thisOnly} if true, only return code for this block and not any following statements
 *   note that calls of scrub_ with no 3rd parameter are equivalent to thisOnly=false, which
 *   was the behavior before this parameter was added.
 * @return {string} Yail code with comments and subsequent blocks added.
 * @private
 */
Blockly.Yail.scrub_ = function(block, code, thisOnly) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  /* TODO: fix for Yail comments?
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Generator.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].targetBlock();
        if (childBlock) {
          var comment = Blockly.Generator.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Generator.prefixLines(comment, '// ');
          }
        }
      }
    }
  }*/
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = thisOnly ? "" : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

Blockly.Yail.getDebuggingYail = function() {
  var code = [];
  var componentMap = Blockly.Component.buildComponentMap([], [], false, false);
  
  var globalBlocks = componentMap.globals;
  for (var i = 0, block; block = globalBlocks[i]; i++) {
    code.push(Blockly.Yail.blockToCode(block));
  }
  
  var blocks = Blockly.mainWorkspace.getTopBlocks(true);
  for (var x = 0, block; block = blocks[x]; x++) {
    
    // generate Yail for each top-level language block
    if (!block.category) {
      continue;
    }
    code.push(Blockly.Yail.blockToCode(block));
  }
  return code.join('\n\n');
};

/**
 * Generate code for the specified block but *not* attached blocks.
 * @param {Blockly.Block} block The block to generate code for.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.Yail.blockToCode1 = function(block) {
  if (!block) {
    return '';
  }
  var func = this[block.type];
  if (!func) {
    throw 'Language "' + name + '" does not know how to generate code ' +
        'for block type "' + block.type + '".';
  }
  var code = func.call(block);
  if (code instanceof Array) {
    // Value blocks return tuples of code and operator order.
    if (block.disabled) {
      code[0] = '';
    }
    return [this.scrub_(block, code[0], true), code[1]];
  } else {
    if (block.disabled) {
      code = '';
    }
    return this.scrub_(block, code, true);
  }
};


Blockly.Yail.genJBridgeCode = function(topBlocks, jsonObject){
  Blockly.Yail.initAllVariables();
  Blockly.Yail.parseJBridgeJsonData(jsonObject);
  Blockly.Yail.parseTopBlocks(topBlocks);

  var code = Blockly.Yail.JBRIDGE_PACKAGE_NAME + 
  Blockly.Yail.JBRIDGE_BASE_IMPORTS +
  Blockly.Yail.genComponentImport(jBridgeImportsMap)+
  Blockly.Yail.genJBridgeClass(topBlocks);

  return code;  
};

Blockly.Yail.initAllVariables = function(){
    jBridgeTopBlockCodesList = [];
    jBridgeRegisterEventMap = new Object();
    jBridgeEventsList = [];
    jBridgeVariableDefinitionMap = new Object();
    jBridgeInitializationList = [];
    jBridgeComponentMap = new Object();
    jBridgeImportsMap = new Object();
    jBridgeProceduresMap = new Object();

};

Blockly.Yail.parseJBridgeJsonData = function(jsonObject){
  var property = jsonObject.Properties;
  var title = property.Title;
  var icon = property.Icon;
  if (title != undefined){
    jBridgeInitializationList.push("this.Title(\""+title +"\");");
  }if(icon != undefined){
    jBridgeInitializationList.push("this.Icon(\""+icon +"\");");
  }
  for(var i=0;i<property.$Components.length;i++){
    Blockly.Yail.parseJBridgeJsonComopnents(property.$Components[i], "this");
  } 

   

};

Blockly.Yail.parseJBridgeJsonComopnents = function (componentJson, rootName){
  var name = componentJson.$Name;

  //Not sure y there are component with undefined name.
  // Assuiming if a component has no name, its not a valid component 
  if(name == undefined){
    return;
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
        if(componentJson[key].substring(0,2) == "&H" && componentJson[key].length == 10){
          printableValue ="0x"+componentJson[key].substring(2);
        }
        //for True and False properties 
        if(valueOfLowerCase == "true" || valueOfLowerCase == "false"){
              printableValue = valueOfLowerCase;
        }
        //for properties that require qoutes ""
        if(JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) > -1){
          printableValue = "\""+ printableValue +"\"";
        }
        jBridgeInitializationList.push(Blockly.Yail.genJBridgeJsonComopnents(name, printableKey, printableValue));
      }
    }
  }
  //Assuming that $Components Property is always an array 
  if(componentsObj != undefined){
    for(var i=0;i<componentsObj.length;i++){
      Blockly.Yail.parseJBridgeJsonComopnents(componentsObj[i], name);
    } 
  }
};

Blockly.Yail.genJBridgeJsonComopnents = function (componentName, property, value){
var code = componentName
           +"."
           +property
           +"("
           +value
           +");"
return code;
};

Blockly.Yail.parseComponentDefinition = function(jBridgeVariableDefinitionMap){
  var code = "";
  for (var key in jBridgeVariableDefinitionMap) {
      code = code 
             + Blockly.Yail.genComponentDefinition(jBridgeVariableDefinitionMap[key], key)
             +"\n";
  }
  return code;
};

Blockly.Yail.genComponentDefinition = function(type, name){
  var code = "private "
             + type
             + " "
             + name
             +";";
  return code;
};

Blockly.Yail.genComponentImport = function(jBridgeImportsMap){
  var code = "";
  for (var key in jBridgeImportsMap) {
      code = code 
             + '\n' 
             + jBridgeImportsMap[key];
  }
  return code;
};

Blockly.Yail.genJBridgeClass =  function (topBlocks){
  var code = "\npublic class Screen1 extends Form implements HandlesEventDispatching { \n"
    + Blockly.Yail.parseComponentDefinition(jBridgeVariableDefinitionMap)
    + Blockly.Yail.genJBridgeDefineMethod()
    + Blockly.Yail.genJBridgeDispatchEvent()
    + Blockly.Yail.genJBridgeDefineProcedure(jBridgeProceduresMap)
    +"\n}\n";
  return code;
};

Blockly.Yail.genJBridgeEventsRegister = function(jBridgeRegisterEventMap){
  var registeredEvents = []
  for(var key in jBridgeRegisterEventMap){
      registeredEvents.push(jBridgeRegisterEventMap[key]);
  }
  return registeredEvents.join("\n");
};

Blockly.Yail.genJBridgeDefineMethod =  function (){
 var code =  "\nprotected void $define() { \n"
  + jBridgeInitializationList.join("\n")
  + "\n"
  + Blockly.Yail.genJBridgeEventsRegister(jBridgeRegisterEventMap)
  +"\n}";
    return code;
};

Blockly.Yail.genJBridgeDispatchEvent = function(){
  var code = "\npublic boolean dispatchEvent(Component component, String componentName, String eventName, Object[] params){\n"
  + jBridgeTopBlockCodesList.join("\n")
  +"\n return false;"
  +"\n}";

  return code;
};

Blockly.Yail.genJBridgeDefineProcedure = function(jBridgeProceduresMap){
  var code = "";
  for (var key in jBridgeProceduresMap) {
      code = code 
             + '\n' 
             + jBridgeProceduresMap[key];
  }
  return code;
};

Blockly.Yail.parseTopBlocks = function (topBlocks){
    for (var x = 0, block; block = topBlocks[x]; x++) {
      jBridgeTopBlockCodesList.push(Blockly.Yail.parseBlock(block));
    }
};

Blockly.Yail.getJBridgeInstanceName = function(block){
  return block.instanceName;
};

Blockly.Yail.parseBlock = function (block){
  jBridgeIsIndividualBlock = false;
  var code = "";
  var blockCategory = block.category;
  if (blockCategory == "Component"){
      code = Blockly.Yail.parseJBridgeComponentBlock(block);
  }else if (blockCategory == "Colors"){
    code = Blockly.Yail.parseJBridgeColorBlock(block);
  }else if (blockCategory == "Variables"){
    code = Blockly.Yail.parseJBridgeVariableBlocks(block);
  }else if(blockCategory == "Math"){
    code = Blockly.Yail.parseJBridgeMathBlocks(block);
  }else if( blockCategory == "Logic"){
    code = Blockly.Yail.parseJBridgeLogicBlocks(block);
  }else if (blockCategory == "Procedures"){
    code = Blockly.Yail.parseJBridgeProceduresBlocks(block);
  }else if (blockCategory == "Control"){
    code = Blockly.Yail.parseJBridgeControlBlocks(block);
  }else if (blockCategory == "Lists"){
    code = Blockly.Yail.parseJBridgeListBlocks(block);
  }else if (blockCategory == "Text"){
    code = Blockly.Yail.parseJBridgeTextTypeBlocks(block);
  }
  return code;
}
Blockly.Yail.parseJBridgeControlBlocks = function(controlBlock){
  var code = "";
  var controlType = controlBlock.type;
  if(controlType == "controls_if"){
    code = Blockly.Yail.parseJBridgeControlIfBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  }
  return code;

}
Blockly.Yail.parseJBridgeControlIfBlock = function(controlIfBlock){
  // var conditions = [];
  // var ifElseStatements = [];
  // var ifStatement;
  // var elseStatement;
  var code = "";
  var elseCount = controlIfBlock.elseCount_;
  var elseIfCount = controlIfBlock.elseifCount_;
  var ifCondition = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[0]);
  var ifStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[1]);
  code =  Blockly.Yail.genJBridgeControlIfBlock(ifCondition, ifStatement);  
  var index = 2 + (elseIfCount * 2);
  if(elseIfCount > 0){
    for(var i=2; i< index; i=i+2){
      var elseIfCondition = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[i]);
      var elseIfStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[i+1]);
      code = code  
             + Blockly.Yail.genJBridgeControlElseIfBlock(elseIfCondition, elseIfStatement);
    }
  }
  if(elseCount == 1){
    var elseStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[index]);
    code = code 
           + Blockly.Yail.genJBridgeControlElseIfBlock(elseStatement);
  }
  for (var x = index+elseCount ; x < controlIfBlock.childBlocks_.length; x++){
    code = code 
           + Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[x]);
  }

  return code;

  // conditions.push(Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[0]));
  // ifStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[1]);
  //   for(var x = 2; x < controlIfBlock.childBlocks_.length- elseCount; x++){
  //     if(x%2 == 0){
  //         conditions.push(Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[x]));
  //       }
  //       else ifElseStatements.push(Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[x  
  //     }
  //     if(elseCount>0) elseStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[controlIfBlock.childBlocks_.length-1]);
  //     return Blockly.Yail.genJBridgeControlIfBlock(conditions, ifStatement, ifElseStatements, elseStatement);
};

Blockly.Yail.genJBridgeControlIfBlock = function(condition, statement){
  var code = "";
  code = "if("
         +condition
         +"){ \n"
         + statement
         + "\n} \n"

  return code;
};

Blockly.Yail.genJBridgeControlElseIfBlock = function(condition, statement){
  var code = "";
  code = "else if("
         +condition
         +"){ \n"
         + statement
         + "\n} \n"
  return code;
};

Blockly.Yail.genJBridgeControlElseIfBlock = function(statement){
  var code = "";
  code = "else { \n"
         + statement
         + "\n} \n"
  return code;
};

// Blockly.Yail.genJBridgeControlIfBlock = function(conditions, ifStatement, ifElseStatements, elseStatement){
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


Blockly.Yail.parseJBridgeVariableBlocks = function (variableBlock){
var code = "";
  var componentType = variableBlock.type;
  if (componentType == "lexical_variable_set"){
      code = Blockly.Yail.parseJBridgeVariableSetBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }else if(componentType == "lexical_variable_get"){
      code = Blockly.Yail.parseJBridgeVariableGetBlock(variableBlock);
  }else if(componentType = "global_declaration"){
      code = Blockly.Yail.parseJBridgeGlobalIntializationBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }
  return code;
};

Blockly.Yail.parseJBridgeVariableGetBlock = function(variableGetBlock){
    var paramName = variableGetBlock.getFieldValue('VAR');
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Yail.getJBridgeParentBlockFieldMap(variableGetBlock.parentBlock_, "component_event", "PARAMETERS");
    paramName = Blockly.Yail.getJBridgeRelativeParamName(paramsMap, paramName);
    return Blockly.Yail.genJBridgeVariableGetBlock(paramName);
  };

Blockly.Yail.genJBridgeVariableGetBlock = function(paramName){
  var code = paramName;
  return code;
};

//It itertates through all the parent to find the specific blockType and loads fieldName map
Blockly.Yail.getJBridgeParentBlockFieldMap = function (block, blockType, fieldName){
  if(block != undefined && block != null && block.type == blockType){
      return Blockly.Yail.getFieldMap(block, fieldName);  
  }
  if(block == null || block == undefined){
    return new Object();
  }
  return Blockly.Yail.getJBridgeParentBlockFieldMap(block.parentBlock_, blockType, fieldName);
};

Blockly.Yail.parseJBridgeVariableSetBlock = function(variableSetBlock){
    var code = "";
    var leftValue = variableSetBlock.getFieldValue("VAR");
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Yail.getJBridgeParentBlockFieldMap(variableSetBlock.parentBlock_, "component_event", "PARAMETERS");
    leftValue = Blockly.Yail.getJBridgeRelativeParamName(paramsMap, leftValue);

    var rightValue = ""
    for(var x = 0, childBlock; childBlock = variableSetBlock.childBlocks_[x]; x++){
        var data = Blockly.Yail.parseBlock(childBlock);
        rightValue = rightValue 
                     + data;
        if (jBridgeIsIndividualBlock){
           code = code + "\n" + data;
        }else {
          code = code + Blockly.Yail.genJBridgeVariableIntializationBlock(leftValue, rightValue);
        }
    }
    return code;
  };


Blockly.Yail.parseJBridgeComponentBlock = function(componentBlock){
  var code = "";
  var componentType = componentBlock.type;
  if (componentType == "component_event"){
       code = Blockly.Yail.parseJBridgeEventBlock(componentBlock);
  }else if (componentType == "component_set_get"){
      if (componentBlock.setOrGet == "set"){
          code = Blockly.Yail.parseJBridgeSetBlock(componentBlock);
          jBridgeIsIndividualBlock = true;
      }else{
          code = Blockly.Yail.parseJBridgeGetBlock(componentBlock);
      }
  }else if (componentType == "component_method" ){
    code = Blockly.Yail.parseJBridgeMethodCallBlock(componentBlock);
    //TODO Not sure what is the side effect of commiting below lines
    // var methodname = componentBlock.methodName;
    // if(methodname != undefined && methodname.substring(0,3) != "Get"){
      jBridgeIsIndividualBlock = true;
    // }
  }else if (componentType == "component_component_block"){
    code = Blockly.Yail.parseJBridgeComponentComponentBlock(componentBlock);
  }else{
    code =  "Invalid Component type : " + componentType ;
  }

  return code;
};

Blockly.Yail.parseJBridgeMethodCallBlock = function(methodCallBlock){
  var objectName = methodCallBlock.instanceName;
  var methodName = methodCallBlock.methodName;
  var parentParamMap = Blockly.Yail.getFieldMap(methodCallBlock.parentBlock_, "PARAMETERS");
  var test = methodCallBlock.parentBlock_.getFieldValue("PARAMETERS");
  var paramsList = [];
  var code = "";
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = methodCallBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Yail.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }
  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Yail.getJBridgeRelativeParamName(parentParamMap, param));
  }
  code = Blockly.Yail.genJBridgeMethodCallBlock(objectName ,methodName, jBridgeParamList) + "\n" + code;
  return code;
};

//This function identifies if the param is a global variable or functional variable 
//and returns the appropriate name
Blockly.Yail.getJBridgeRelativeParamName = function(paramsMap, paramName){
  var paramIndex = paramsMap[paramName];
    if ( paramIndex == undefined ){
      //check for "global " keyword in param name and remove it
      if( paramName.substring(0,7) == "global "){
        paramName = paramName.replace("global ", "");
      }
      return paramName;
    }
    return "params[" + paramIndex+"]";
};

Blockly.Yail.getFieldMap = function(block, fieldName){
  var fieldMap = new Object();
  if(block.inputList != undefined){
    for (var x = 0, input; input = block.inputList[x]; x++) {
      var fieldIndex = 0;
      if(input.name == fieldName){
        for (var y = 0, field; field = input.fieldRow[y]; y++){
          var fieldName = field.getText();
          if (fieldName.replace(/ /g,'').length > 0){
              fieldMap[fieldName] = fieldIndex;
              fieldIndex ++;
          }
        }  
      }
    }
  }
  return fieldMap;
};

Blockly.Yail.getFieldList = function(block, fieldName){
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

Blockly.Yail.getProcName = function(block, inputName, fieldName){
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

Blockly.Yail.genJBridgeMethodCallBlock = function(objectName, methodName, paramsList){
var code = "";
// use splice to get all the arguments after 'methodName'
var args = Array.prototype.splice.call(arguments, 2);
code = objectName
       + "."
       +methodName
       +" ("
       + paramsList.join(", ")
       +");"  
return code;
};

Blockly.Yail.parseJBridgeColorBlock = function(colorBlock){
  // TOOD Fix the copy pasted or duplicated color palette block 
  var color = colorBlock.type.toUpperCase();
  return Blockly.Yail.genJBridgeColorBlock(color);
};

Blockly.Yail.genJBridgeColorBlock = function(color){
    return color;
};

Blockly.Yail.parseJBridgeGetBlock = function(getBlock){
  var componentName = Blockly.Yail.getJBridgeInstanceName(getBlock);
  var property = getBlock.propertyName;
  return Blockly.Yail.genJBridgeGetBlock(componentName, property);
};

Blockly.Yail.genJBridgeGetBlock = function(componentName, property){
  var code = componentName
             +"."
             +property
             +"()";
  return code;
};

Blockly.Yail.parseJBridgeSetBlock = function(setBlock){
  var componentName = Blockly.Yail.getJBridgeInstanceName(setBlock);
  var property = setBlock.propertyName;

  var value = "";
  var code = "";
  for (var x = 0, childBlock; childBlock = setBlock.childBlocks_[x]; x++) {
    var genCode = Blockly.Yail.parseBlock(childBlock);
     if(jBridgeIsIndividualBlock){
        code = code + genCode + "\n";
      }else{
        value = value + genCode;
      }
  }

  if(JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(property.toLowerCase()) > -1){
    value = "String.valueOf(" +value+")";
  }
  code = Blockly.Yail.genJBridgeSetBlock(componentName, property, value) + "\n" + code;
  return code;
};

Blockly.Yail.genJBridgeSetBlock = function(componentName, property, value){
  var code = componentName
             +"."
             +property
             +"("
             +value
             +");";
  return code;
};

// Blockly.Yail.paseJBridgeEventBlock = function(eventBlock){
//   var code = "";
//   var eventName = eventBlock.eventName;
//   var componentName = eventBlock.instanceName;

//   code = Blockly.Yail.parseJBridgeEventBlock(eventBlock);

//   //Add to RegisterEventsMap
//   jBridgeRegisterEventMap[eventName] = Blockly.Yail.genJBridgeEventDispatcher(eventName); 

//   return code;
// };


Blockly.Yail.parseJBridgeEventBlock = function(eventBlock, isChildBlock){
  var code = "";
  isChildBlock = typeof isChildBlock !== 'undefined' ? isChildBlock : false;
  var componentName = eventBlock.instanceName;
  var eventName = eventBlock.eventName;
  var body = "";
  for (var x = 0, childBlock; childBlock = eventBlock.childBlocks_[x]; x++) {
      body = body 
             + "\n"
             + Blockly.Yail.parseBlock(childBlock);
  }
  //This is to handle the if the component is the Screen Object
  if(componentName == jBridgeCurrentScreen){
    componentName = "this";
  }
  code = Blockly.Yail.genJBridgeEventBlock(componentName, eventName, body);

  //Add to RegisterEventsMap
  jBridgeRegisterEventMap[eventName] = Blockly.Yail.genJBridgeEventDispatcher(eventName); 

  return code;
};

//Event Blocks are actualy the "When Blocks"
Blockly.Yail.genJBridgeEventBlock = function(componentName, eventName, body){
  var code = "\nif( component.equals("+componentName+") && eventName.equals(\""+eventName+"\") ){\n"
    + body + "\n"
    +"return true;\n"
    +"}";

  return code;
}; 

Blockly.Yail.genJBridgeEventDispatcher = function(eventName){
  return "EventDispatcher.registerEventForDelegation( this, \"" + eventName +"Event\", \""+ eventName +"\" );";
};

Blockly.Yail.parseJBridgeMathBlocks = function(mathBlock){
  var code = "";
  var type = mathBlock.type;
  if( type == "math_number"){
    code = Blockly.Yail.parseJBridgeMathNumberBlock(mathBlock);
  }else if(type == "math_random_int"){
    code = Blockly.Yail.parseJBridgeMathRandomInt(mathBlock);
  }else if(type == "math_random_float"){
    code = Blockly.Yail.parseJBridgeMathRandomFloatBlock(mathBlock);
  }else if(type == "math_add"){
    code = Blockly.Yail.parseJBridgeMathAdd(mathBlock);
  }else if(type == "math_subtract"){
    code = Blockly.Yail.parseJBridgeMathSubtract(mathBlock);
  }else if(type == "math_multiply"){
    code = Blockly.Yail.parseJBridgeMathMultiply(mathBlock);
  }else if(type == "math_division"){
    code = Blockly.Yail.parseJBridgeMathDivision(mathBlock);
  }else if(type == "math_compare"){
    code = Blockly.Yail.parseJBridgeMathCompare(mathBlock);
  }else if(type == "math_atan2"){
    code = Blockly.Yail.parseJBridgeMathAtan2(mathBlock);
  }
  return code;
};
Blockly.Yail.parseJBridgeMathNumberBlock = function(mathBlock){
  var numberValue ;
  //Assuming numver value always in the fieldRow[0] in inputlist[0].
  numberValue = mathBlock.getFieldValue('NUM');
  return Blockly.Yail.genJBridgeMathNumberBlock(numberValue);
};

Blockly.Yail.parseJBridgeMathAdd = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "+");
};

Blockly.Yail.parseJBridgeMathSubtract = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "-");
};

Blockly.Yail.parseJBridgeMathMultiply = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "*");
};

Blockly.Yail.parseJBridgeMathDivision = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "/");
};

Blockly.Yail.parseJBridgeMathRandomInt = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathRandomInt(leftValue, rightValue);
};

//TODO try other alternatives for Random integer like "Random.randInt(min, max)"
Blockly.Yail.genJBridgeMathRandomInt = function(leftValue, rightValue){
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

Blockly.Yail.genJBridgeMathOperation = function(leftValue, rightValue, operand){
    var code = "(" 
               +leftValue
               + " "
               + operand
               + " "
               + rightValue
               + ")";
    return code;
};

Blockly.Yail.genJBridgeMathNumberBlock= function(numberValue){
   var code="";
   code = numberValue;
   return code;
};

Blockly.Yail.parseJBridgeGlobalIntializationBlock = function(globalBlock){
  var leftValue ;
  var rightValue ;

  leftValue = globalBlock.getFieldValue('NAME').replace("global ", "");
  rightValue = ""
  for(var x = 0, childBlock; childBlock = globalBlock.childBlocks_[x]; x++){
        rightValue = rightValue 
                     + Blockly.Yail.parseBlock(childBlock);
  }

  jBridgeComponentMap[leftValue] = [];
  var childType = globalBlock.childBlocks_[0].category;
  var variableType = Blockly.Yail.getValueType(childType, rightValue);  

  jBridgeComponentMap[leftValue].push({"Type" : variableType});
  jBridgeVariableDefinitionMap[leftValue] = variableType;


  jBridgeInitializationList.push(Blockly.Yail.genJBridgeVariableIntializationBlock(leftValue, rightValue));
  
  return "";
};
Blockly.Yail.getValueType = function(childType, value){
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
    variableType = "ArrayList"
  }
  return variableType;
};

Blockly.Yail.genJBridgeVariableIntializationBlock = function(leftValue, rightValue){
  var code = ""
  code = leftValue 
         + " = "
         + rightValue
         +";";
  return code
};

Blockly.Yail.parseJBridgeLogicBlocks = function (logicBlock){
var code = "";
  var componentType = logicBlock.type;
  if (componentType == "logic_boolean"){
      code = Blockly.Yail.parseJBridgeBooleanBlock(logicBlock);
  }else if (componentType == "logic_operation"){
      code = Blockly.Yail.parseJBridgeLogicOperationBlock(logicBlock);
  }else if (componentType == "logic_false"){
      code = "false";
  }
  return code;
};
  
Blockly.Yail.parseJBridgeBooleanBlock = function(logicBlock){
  var value = logicBlock.getFieldValue("BOOL");
  return Blockly.Yail.genJBridgeBooleanBlock(value);
};

Blockly.Yail.genJBridgeBooleanBlock = function(value){
  return value.toLowerCase();
};

Blockly.Yail.parseJBridgeProceduresBlocks = function(proceduresBlock){
  var code = "";
  var proceduresType = proceduresBlock.type;
  if(proceduresType == "procedures_defnoreturn"){
     code = Blockly.Yail.parseJBridgeProcDefNoReturn(proceduresBlock);
  }else if(proceduresType == "procedures_callnoreturn"){
     code = Blockly.Yail.parseJBridgeProcCallNoReturn(proceduresBlock);
  }
  jBridgeIsIndividualBlock = true;
  return code;
};

Blockly.Yail.parseJBridgeProcDefNoReturn = function(proceduresBlock){
  var code = "";
  var procName = proceduresBlock.getFieldValue("NAME");
  var procParms = [];
  for (var x = 0, params; params = proceduresBlock.arguments_[x]; x++) {
    procParms.push("Object " + params);
  }
  var statementList = [];
  for (var x = 0, childBlock; childBlock = proceduresBlock.childBlocks_[x]; x++) {
    statementList.push(Blockly.Yail.parseBlock(childBlock));
  }
  
  jBridgeProceduresMap[procName] = Blockly.Yail.genJBridgeProcDefNoReturn(procName, procParms.join(", "), statementList.join("\n"));

  return code;
};

Blockly.Yail.genJBridgeProcDefNoReturn = function (procedureName, procedureParams, body){
  var code = "\npublic void " 
       + procedureName
       + "("
       + procedureParams 
       + "){\n"
       + body
       + "\n}"; 
  return code;
}

Blockly.Yail.parseJBridgeProcCallNoReturn = function(proceduresBlock){
  var procName = proceduresBlock.getFieldValue("PROCNAME");
  var paramsList = [];
  var code = "";
  var parentParamMap = Blockly.Yail.getFieldMap(proceduresBlock.parentBlock_, "PARAMETERS");
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = proceduresBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Yail.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }

  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Yail.getJBridgeRelativeParamName(parentParamMap, param));
  }

  return Blockly.Yail.genJBridgeProcCallNoReturn(procName, jBridgeParamList) + "\n" + code;
};

Blockly.Yail.genJBridgeProcCallNoReturn = function(procName, paramsList){
  var code = procName
             + "("
             + paramsList.join(",")
             +");";
  
  return code;
};

Blockly.Yail.parseJBridgeTextTypeBlocks = function(textBlock){
  var code = "";
  var type = textBlock.type;
  if (type == "text"){
    code = Blockly.Yail.parseJBridgeTextBlock(textBlock);
  }else if(type == "text_join"){
    code = Blockly.Yail.parseJBridgeTextJoinBlock(textBlock);
  }else if(type == "text_changeCase"){
    code = Blockly.Yail.parseJBridgeTextChangeCaseBlock(textBlock);
  }
  return code;
};

Blockly.Yail.parseJBridgeTextBlock = function(textBlock){
  var textData = textBlock.getFieldValue("TEXT");
  return Blockly.Yail.genJBridgeTextBlock(textData);
};

Blockly.Yail.parseJBridgeTextJoinBlock = function(textBlock){
  var joinList = [];
  for (var y = 0, joinBlock; joinBlock = textBlock.childBlocks_[y]; y++){
    var genCode = Blockly.Yail.parseBlock(joinBlock);
    joinList.push(genCode);
  }
  if (joinList.length == 0){
    return "";
  }
  else{
    return Blockly.Yail.genJBridgeTextJoinBlock(joinList);
  }
};

Blockly.Yail.genJBridgeTextBlock = function(text){
  var code = "\""+text+"\"";
  return code;
};

Blockly.Yail.genJBridgeTextJoinBlock = function(joinList){
  var code = "";
  for (var x = 0; x < joinList.length; x++){
    if(x == (joinList.length - 1)){
      code = code + "(" + joinList[x] + ")" + ".toString()";
    }
    else{
      code = code + "(" + joinList[x] + ")" + ".toString()" + " + ";
    }
  }
  return code;
};

Blockly.Yail.parseJBridgeListBlocks = function(listBlock){
  var code = "";
  var type = listBlock.type;
  var name = "ArrayList";
  jBridgeImportsMap[name] = "import java.util.ArrayList;";
  if( type == "lists_create_with"){
    code = Blockly.Yail.parseJBridgeListsCreateWithBlock(listBlock);
  }else if (type == "lists_select_item"){
      code = Blockly.Yail.parseJBridgeListSelectItemBlock(listBlock);
  }else if(type == "lists_length"){
      code = Blockly.Yail.parseJBridgeListLengthBlock(listBlock);
  }else if(type == "lists_is_list"){
      code = Blockly.Yail.parseJBridgeListIsListBlock(listBlock);
  }else if(type == "lists_add_items"){
      code = Blockly.Yail.parseJBridgeListAddItemBlock(listBlock);
  }
  return code;
};

Blockly.Yail.parseJBridgeListAddItemBlock = function(listBlock){
  var code = "";
  var listName = Blockly.Yail.parseBlock(listBlock.childBlocks_[0]);
  var item = Blockly.Yail.parseBlock(listBlock.childBlocks_[1]);
  code = Blockly.Yail.genJBridgeListsAddItemBlock(listName, item);
  if(listBlock.childBlocks_.length > 2){
    for(var x = 2, childBlock; childBlock = listBlock.childBlocks_[x]; x++){
      code = code + Blockly.Yail.parseBlock(childBlock);
    }
  }
  return code;
};

Blockly.Yail.parseJBridgeListsCreateWithBlock = function(listBlock){
   var code = "";
   var childType = "String";
   var listName = "[Unknown]";
   if (listBlock.parentBlock_.getFieldValue('NAME') != undefined){
      listName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "")
   }else if(listBlock.parentBlock_.getFieldValue('VAR') != undefined){
      listName = listBlock.parentBlock_.getFieldValue('VAR').replace("global ", "")
   }
   for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
     var addItemData = Blockly.Yail.parseBlock(childBlock);
     childType = Blockly.Yail.getValueType(childBlock.type, addItemData);
     if(childType == "int"){
      childType = "Integer";
     }else if(childType == "float"){
      childType = "Float";
     }
     code = code 
            + Blockly.Yail.genJBridgeListsAddItemBlock(listName, addItemData);
   }
    code = Blockly.Yail.genJBridgeNewList(childType)
          +"\n"
          + code;

   return code;
};

Blockly.Yail.parseJBridgeListSelectItemBlock = function(listBlock){
  var listName = Blockly.Yail.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Yail.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Yail.genJBridgeListSelectItemBlock(listName, index);  
};
Blockly.Yail.genJBridgeListSelectItemBlock = function(listName, index){
  var code = listName + ".get(" + index + ")";
  return code;
};
Blockly.Yail.genJBridgeNewList = function(type){
  var code = "new ArrayList<"+type+">(); \n";
  return code;
};

Blockly.Yail.genJBridgeListsAddItemBlock = function(listName, addItem){
   var code = listName+".add("+addItem+"); \n";
   return code;
};

Blockly.Yail.parseJBridgeMathCompare = function (mathBlock){
  var operator = mathBlock.getFieldValue("OP");
  var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
  var op = Blockly.Yail.getJBridgeOperator(operator);
  if(op == "==" && leftValue.indexOf("String.valueOf(") == 0){
    return Blockly.Yail.genJBridgeStringEqualsCompare(leftValue, rightValue, op);
  }
  return Blockly.Yail.genJBridgeMathCompare(leftValue, rightValue, op);
};

Blockly.Yail.parseJBridgeMathAtan2 = function (mathBlock){
  var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
  return Blockly.Yail.genJBridgeMathAtan2(leftValue, rightValue);
};

Blockly.Yail.genJBridgeMathAtan2 = function (leftValue, rightValue){
  var code = "Math.toDegrees(Math.atan2(" 
             + leftValue
             + ", "
             + rightValue
             + "))";
  return code;
};

Blockly.Yail.genJBridgeStringEqualsCompare = function (leftValue, rightValue, operator){
  var code = "(" 
             + leftValue
             + ").equals("
             + rightValue
             + ")";
  return code;
};

Blockly.Yail.genJBridgeMathCompare = function (leftValue, rightValue, operator){
  var code = leftValue
             + operator
             + rightValue;
  return code;
};

Blockly.Yail.getJBridgeOperator = function(operator){
  var op = operator;
  if(operator == "GT"){
    op = ">";
  }else if(operator == "LT"){
    op = "<";
  }else if(operator == "EQ"){
    op = "==";
  }else if(operator == "NEQ"){
    op = "!=";
  }else if(operator == "GTE"){
    op = ">=";
  }else if(operator == "LTE"){
    op = "<=";
  }else if(operator == 'AND'){
    op = "&&"
  }

  return op;
};

Blockly.Yail.parseJBridgeListLengthBlock = function(listBlock){
  var listName = Blockly.Yail.parseBlock(listBlock.childBlocks_[0]);
  return Blockly.Yail.genJBridgeListLengthBlock(listName);
};

Blockly.Yail.genJBridgeListLengthBlock = function(listName){
  var code = listName + ".size()"
  return code;
};

Blockly.Yail.parseJBridgeLogicOperationBlock = function(logicBlock){
  var operator = logicBlock.getFieldValue("OP");
  var leftValue = Blockly.Yail.parseBlock(logicBlock.childBlocks_[0]);
  var rightValue = Blockly.Yail.parseBlock(logicBlock.childBlocks_[1]);

return Blockly.Yail.genJBridgeLogicOperationBlock(leftValue, rightValue, Blockly.Yail.getJBridgeOperator(operator));
};

Blockly.Yail.genJBridgeLogicOperationBlock = function (leftValue, rightValue, operator){

  var code = leftValue
             + " "
             + operator
             + " "
             + rightValue;
  return code;
};

Blockly.Yail.parseJBridgeComponentComponentBlock = function(componentBlock){
  var name = componentBlock.instanceName;
  return Blockly.Yail.genJBridgeComponentComponentBlock(name);
};

Blockly.Yail.genJBridgeComponentComponentBlock = function(name){
  var code = name;
  return code;
};

Blockly.Yail.parseJBridgeMathRandomFloatBlock = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    return Blockly.Yail.genJBridgeMathRandomFloatBlock();
};

Blockly.Yail.genJBridgeMathRandomFloatBlock = function(){
    var code = "(random.nextFloat())"
    return code;
};

Blockly.Yail.parseJBridgeTextChangeCaseBlock = function(textBlock){
    var operator = textBlock.getFieldValue("OP");
    var op = "toLowerCase()";
    if(operator == "UPCASE"){
        op = "toUpperCase()";
    }
    var genCode = "";
    for(var x = 0, childBlock; childBlock = textBlock.childBlocks_[x]; x++){
          genCode = genCode + Blockly.Yail.parseBlock(childBlock);
    }    
    return Blockly.Yail.genJBridgeTextChangeCaseBlock(genCode, op);
};

Blockly.Yail.genJBridgeTextChangeCaseBlock = function(inputText, changeCase){
    var code = "String.valueOf("
              + inputText 
              + ")."
              + changeCase;
    return code;
};

Blockly.Yail.parseJBridgeListIsListBlock = function(listBlock){
  var genCode = ""
  for(var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++){
          genCode = genCode + Blockly.Yail.parseBlock(childBlock);
  }
  return Blockly.Yail.genJBridgeListIsListBlock(genCode);
};

Blockly.Yail.genJBridgeListIsListBlock = function(genCode){
  var code = "(("
            + genCode
            + ")"
            + " instanceof ArrayList<?>"
            + ")"
  return code;
};

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

Blockly.Java.prityPrintIndentationJBridge = function(indendLength){
  var indentation = "";
  for(var j=0; j<indendLength; j++){
    indentation += "  ";
  }
  return indentation;
};

Blockly.Java.getManifest = function(formJson, packageName, forRepl) {
    // var jsonObject = JSON.parse(formJson); 
    // var javaCode = []
    // javaCode.push(Blockly.Yail.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject));
    // jv
};
