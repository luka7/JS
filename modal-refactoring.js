/**
 * Modal Ctrl
 * version : v0.1
 * author: w-marc - lee sang-hwa
 * copyright (c) 2016 w-marc co ltd.
 */

/*
 $(오브젝트).toggleModal(옵션); //대상 오브젝트 선언, 옵션없어도 됨
 옵션 = {
 'auto' : 자동슬라이딩 여부 // 타입 = boolean, 기본값 = true
 'prevBtn' : 이전버튼 // 타입 = 오브젝트, 기본값 = false
 'nextBtn' : 이전버튼 // 타입 = 오브젝트, 기본값 = false
 'pager' : 번호기능 // 타입 = 오브젝트, 기본값 = false
 단! 메뉴가 없을 경우 자체 생성, 있을 경우 슬라이드 갯수와 동일해야함
 'oWid' : 슬라이드 가로사이즈 강제지정 // 타입 = 정수, 기본값 = 첫번째 슬라이드 가로길이
 'intV' : 딜레이속도 // 타입 = 정수, 기본값 = 3000
 'zIndex' : 슬라이드 개체의 z-index기본값 // 타입 = 정수, 기본값 = 100
 'slideSpeed' : 슬라이딩 속도 // 타입 = 정수, 기본값 = 'normal'
 'numVisible' : 현재 보이는 슬라이드 번호 표시 // 타입 = 오브젝트, 기본값 = false,
 'pagerClassName' : 활성화되는 번호에 부여되는 클래스명 // 기본값 = 'active'
 }

 */
(function ($) {
    var focusedElementBeforeModal;
    $.fn.toggleModal = function (op,complete) {
        op = $.extend({
            /*
            * blur
            * active class name
            * dom create & json * size
            * */
            a11y: false,
            blur: false,
            activeClassName : 'modal-active',
            closeClassName : 'modal-close',
            useJsonExpression:false,
            oWid: null,
            speed: false,
            easing:false,
            zIndex: 9999, // default z-index
            extClick: false,
            focusAbleElements : "body, a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]",
            attrs : {
                'role' : 'dialog',
                'tabindex': '-1'
            },
            a11yAttrs : {
                'aria-label' : 'modal'
            }
        }, op || {});

        return this.each(function () {
            if($(this).length<0) return false;
            var This = $(this);
            var obj = This.find('*');
            var blurCss = { '-webkit-filter':'blur(2px)', '-moz-filter': 'blur(2px)', '-o-filter': 'blur(2px)', '-ms-filter': 'blur(2px)', 'filter': 'blur(2px)'};
            var emptyCss = { '-webkit-filter':'', '-moz-filter': '', '-o-filter': '', '-ms-filter': '', 'filter': ''};

            if(op.a11y) $.extend(op.attrs, op.a11yAttrs);
            function stealKey(e) {
                var stealKeyArray = [32, 33, 34, 35, 36, 37, 38, 39, 40];//space ... etc key
                for (var i = 0; i < stealKeyArray.length; i++) {
                    if (e.which === stealKeyArray [i]) {
                        e.preventDefault();
                        return;
                    }
                }
                if (e.which == 27) {//esc key
                    obj.find(op.focusAbleElements).find(':visible').first().click();
                    e.preventDefault();
                }
                if (e.which == 9) {//tab key
                    if(!obj.filter(':focus').length) {
                        obj.focus();
                    }
                    var focusableItems;
                    focusableItems = obj.find(op.focusAbleElements).find(':visible');
                    var focusedItem;
                    focusedItem = $(':focus');
                    var numberOfFocusableItems;
                    numberOfFocusableItems = focusableItems.length;
                    var focusedItemIndex;
                    focusedItemIndex = focusableItems.index(focusedItem);

                    if (e.shiftKey) {
                        if (focusedItemIndex == 0) {
                            focusableItems.get(numberOfFocusableItems - 1).focus();
                            e.preventDefault();
                        }
                    } else {
                        if (focusedItemIndex == numberOfFocusableItems - 1) {
                            focusableItems.get(0).focus();
                            e.preventDefault();
                        }
                    }
                    return true;
                }
            }
            function showModal() {
                focusedElementBeforeModal = $(':focus');
                if(op.blur) $('body>*').not(This).css(blurCss);
                if(op.a11y) This.attr('aria-hidden', false);
                if(op.activeClassName) This.addClass(op.activeClassName);
                This.show(op.speed, op.easing).attr(op.attrs);
                $(window).on('keydown.stealKey', function (e) {
                    stealKey(e);
                });
                $(window).on("mousewheel.stealKey DOMMouseScroll.stealKey touchmove.stealKey", function (e) {
                    e.preventDefault();
                    return false;
                });
                if(op.extClick) {
                    $(window).on('click.extClick', function(e){
                        console.log(This==$(e.target));
                        if(This.find(e.target).size()>0||This==$(e.target)) return false;
                        else $(op.extClick)
                    })
                }

                obj.filter(op.focusAbleElements).find(':visible').first().focus();
            }
            function hideModal() {
                if(op.blur) $('body>*').not(This).css(emptyCss);
                if(op.a11y) This.attr('aria-hidden', true);
                if(op.activeClassName) This.removeClass(op.activeClassName);
                This.hide(op.speed, op.easing);
                $(window).off(".stealKey");
                $(focusedElementBeforeModal).focus();
            }
            /* evt handler */
            if (!This.is(':visible')) showModal();
            else hideModal();
            if($.isFunction(complete)) complete();
        })
    };
    $.fn.createAppend = function(element, attrs, content){
        var self = this;
        if (attrs == undefined && element.constructor == Array) {
            for (var i = 0; i < element.length; i += 3) {
                jQuery(self).createAppend(element[0], element[1] || {}, element[2] || []);
            }
            return this;
        }

        var parentElement = this[0];
        if (jQuery.browser.msie && element == 'input' && attrs.type) {
            element = document.createElement('<' + element + ' type="' + attrs.type + '" />');
        }

        else if(element == 'img' && attrs.src.constructor == Array) {
            $(attrs.src).each(function(){
                attrs.src = this;
                jQuery(self).createAppend(element, attrs || {}, content || []);
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
                jQuery(element).createAppend(content[j], content[j + 1] || {}, content[j + 2] || []);
            }
        }
        else if (content != null) {
            element = lukaSetText(element, content);
        }

        return jQuery(element);
    };
})(jQuery);


/* utils */
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
        for (var i = 1; i < parts.length; i++) {
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