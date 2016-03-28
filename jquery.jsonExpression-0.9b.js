/**
 * jQuery Plugin jsonExpression 1.0
 * @version     Id: jquery.jsonExpression-0.9.js
 * @author      lee sang-hwa [master at luka7 dot net]
 * @package     jQuery Plugins
 * @subpackage  lukaScript
 **/

var _jsonExpressionData = null;
var jsonData;

$.fn.jsonExpression = function(expression, _jsonExpressionData, itemName, params) {
    var isJson = true;
    var jsonData = _jsonExpressionData;
    var self = this;

    if(jsonData == null) isJson = false;

    if(isJson) {
        if(!itemName) {
            console.log("Item Name is Null, item name is row key name");
            return false;
        }
        if (typeof jsonData !== "object"){
            $.when($.getJSON(jsonData, params)).done(function(jsonData){
                dataDeliver(jsonData);
            });
        }
        else dataDeliver(jsonData);
    }
    else {
        $(expression).each(function(j){
            var results = expression();
            for (j = 0; j < results.length; j = j + 3) {
                jQuery(self).createAppend(results[j], results[j+1], results[j+2]);
            }
        });
    }
    function dataDeliver(jsonData){
        jsonData = jsonData[itemName];

        $.each($.isArray(jsonData) ? jsonData : [jsonData], function() {
            var results = expression.apply(this);
            $(self).createAppend(results[0], results[1], results[2]);

        });
    }
    return this;
};


$.fn.createAppend = function(element, attrs, content){
    var self = this;
    if (attrs == undefined && $.isArray(element)) {
        for (var i = 0; i < element.length; i += 3) {
            $(self).createAppend(element[0], element[1] || {}, element[2] || []);
        }
        return this;
    }
    if(element == 'img')   console.log(attrs.src)
    var parentElement = this[0];
    if (jQuery.browser.msie && element == 'input' && attrs.type) {
        element = document.createElement('<' + element + ' type="' + attrs.type + '" />');
    }

    else if(element == 'img' &&  $.isArray(attrs.src)) {
        $(attrs.src).each(function(){
            attrs.src = this;
            $(self).createAppend(element, attrs || {}, content || []);
        });
        return this;
    }
    else {
        element = document.createElement(element);
    }

    element = parentElement.appendChild(element);
    element = lukaParseAttrs(element, attrs);

    if (typeof content == 'object' && content != null) {
        for (var j = 0; j < content.length; j = j + 3) {
            $(element).createAppend(content[j], content[j + 1] || {}, content[j + 2] || []);
        }
    }
    else if (content != null) {
        element = lukaSetText(element, content);
    }

    return $(element);
};

/* utils */

$.browser={};(function(){
    jQuery.browser.msie=false;
    $.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)\./)){
        $.browser.msie=true;jQuery.browser.version=RegExp.$1;}
})();

String.prototype.toCamelCase = function(){
    var self = this;
    var camelStr = {'class': 'className', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'for': 'htmlFor', 'httpequiv': 'httpEquiv',
        'alink': 'aLink', 'vlink': 'vLink', 'bgcolor': 'bgColor', 'acceptcharset': 'acceptCharset',
        'selectedindex': 'selectedIndex', 'tabindex': 'tabIndex', 'selected': 'defaultSelected', 'checked': 'defaultChecked',
        'value': 'defaultValue', 'accesskey': 'accessKey', 'noshade': 'noShade', 'datetime': 'dateTime', 'usemap': 'useMap',
        'lowsrc': 'lowSrc', 'longdesc': 'longDesc', 'ismap': 'isMap', 'codebase': 'codeBase', 'codetype': 'codeType',
        'valuetype': 'valueType', 'nohref': 'noHref', 'thead': 'tHead', 'tfoot': 'tFoot', 'cellpadding': 'cellPadding',
        'cellspacing': 'cellSpacing', 'charoff': 'chOff', 'valign': 'vAlign', 'frameborder': 'frameBorder',
        'marginheight': 'marginHeight', 'marginwidth': 'marginWidth', 'noresize': 'noResize'};
    if (camelStr[self] != '' && typeof camelStr[self] != 'undefined') {
        return camelStr[self];
    }
    if (self.indexOf('-') > 0) {
        var parts = self.split('-');
        self = parts[0];
        for (i = 1; i < parts.length; i++) {
            self += parts[i].substr(0, 1).toUpperCase() + parts[i].substr(1).toLowerCase();
        }
    }
    return self;
};

String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g, '');
};


/* @ subPack : lukaScript - Dom */
lukaParseAttrs = function(element, attrs) {

    for (attr in attrs) {
        var attrName    = attr;
        var attrValue   = attrs[attr];
        switch (attrName) {
            case 'style':
                if (typeof attrValue == 'string') {
                    var params = attrValue.split(';');
                    for (var i = 0; i < params.length; i++) {
                        if (params[i].trim() != '') {
                            var styleName   = params[i].split(':')[0].trim();
                            var styleValue  = params[i].split(':')[1].trim();
                            styleName = styleName.toCamelCase();
                            if (styleName != '') {
                                element.style[styleName] = styleValue;
                            }
                        }
                    }
                }
                else if (typeof attrValue == 'object') {
                    for (styleName in attrValue) {
                        var styleNameCamel = styleName.toCamelCase();
                        if (styleName.trim() != '') {
                            element.style[styleNameCamel] = attrValue[styleName];
                        }
                    }
                }
                break;

            default:
                if (attrName.substr(0, 2) == 'on') {
                    var event = attrName.substr(2);
                    attrValue = (typeof attrValue != 'function') ? eval('f = function() { ' + attrValue + '}') : attrValue;
                    jQuery(element).bind(event, attrValue);
                }
                else {
                    element[attrName.toCamelCase()] = attrValue;
                }
        }
    }
    return element;

};


lukaSetText = function(element, content){
    var isHtml = /(<\S[^><]*>)|(&.+;)/g;
    if (content.match(isHtml) != null && element.tagName.toUpperCase() != 'TEXTAREA') {
        element.innerHTML = content;
    } else {
        var textNode = document.createTextNode(content);
        element.appendChild(textNode);
    }
    return element;
};