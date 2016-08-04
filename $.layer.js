/**
 * jQuery plugin : $.layer
 * Created by bom-studio(shlee) on 2016-03
 *
 * ===================================================================
 *  $(obj).layer(param, complete).fn() //param = obj, complete = Fn
 *  $(obj).layer() //toggle display
 *  $(obj).layer('show') //show
 *  $(obj).layer('hide') //hide
 *  $(obj).layer('inline-block') //custom display :: inline, table.... etc
 *  $(obj).layer({
        display: false, //false = toggle or 'block', 'none', 'inline', 'inline-block' ...
        blur: false, //boolean 레이어 이외의 body>* 요소에 토글 class
        modal:true, //boolean esc 키 컨트롤, 닫기 전에 모든 이벤트 무시
        align: false, // 레이어 출력위치 'top left', 'middle center', '50% 20%'
        activeClassName : 'layer-active', //string :: 레이어가 show 상태일때 부여되는 클래스
        closeTrigger : 'layer-close',  //string :: 닫기버튼 data-trigger="layer-close" or 셀랙터
        effect: false, //string or object ::  효과 duration, easing
        a11y: false, //boolean :: 접근성 aria 관련
   }),utilFn() // Closer
 *
 *  Method :>
 *      destroy() //obj 제거
 *      getSize() //obj 크기 값 리턴
 *
 * ===================================================================
 */
$(function () {
    'use strict';
    $.fn.layer = function (param, complete) {
        var This = this, utilFn, focusedElementBeforeLayer;
        var Type = typeof (param);
        var Action = param;
        param = $.extend({
            display: false,
            blur: false,
            modal:true,
            align: false,
            gallery:false,
            activeClassName : 'layer-active',
            closeTrigger : 'layer-close',
            effect: false,
            a11y: false
        }, param || {});

        utilFn = $.fn.extend({
            con: function(st){
                console.log(st);
                return this;
            },
            destroy : function(){
                $(This).off('.stealKey');
                $(window).off('.stealKey');
                $(This).remove();
            },
            getSize : function(){
                var Body = $('body'),
                    Window = $(window);
                return {
                    cSize : {
                        width :Body.width(),
                        height:Body.height()
                    },
                    wSize : {
                        width :Window.width(),
                        height:Window.height()
                    },
                    oSize : {
                        width : This.outerWidth(),
                        height: This.outerHeight()
                    }
                };
            },
            stealKey : function(e) {
                var stealKeyArray = [32, 33, 34, 35, 36, 37, 38, 39, 40];//space ... etc key
                var focusableElementsString = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";
                var $children = This.find('*');
                e.which = e.keyCode||e.which;
                for (var i = 0; i < stealKeyArray.length; i++) {
                    if (e.which === stealKeyArray [i]) {
                        e.preventDefault();
                        return;
                    }
                }
                if (e.which == 27) {//esc key
                    //This.filter(focusableElementsString).filter(':visible').last().click();
                    $(this).find('[data-trigger='+ param.closeTrigger +']').click();
                    e.preventDefault();
                }
                if (e.which == 9) {//tab key
                    var focusedItem;
                    focusedItem = $(':focus');
                    var focusableItems;
                    focusableItems = $children.filter(focusableElementsString).filter(':visible');
                    var numberOfFocusableItems;
                    numberOfFocusableItems = focusableItems.length;
                    var focusedItemIndex;
                    focusedItemIndex = focusableItems.index(focusedItem);
                    if (focusedItemIndex == -1) {
                        focusableItems.get(0).focus();
                        return false;
                    }
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

                }
            }
        });

        return this.each(function(i, obj){
            focusedElementBeforeLayer = $(':focus');
            $(obj).attr('tabindex',1);
            if(!$.isFunction(complete)) complete = function(){};
            /**
             * Default Fn
             */
            var Show = function(){
                if(param.align) {
                    $(obj).css('opacity', '0');
                }
                $(obj).show(param.effect, complete()).focus();
                EventBind();
                $(obj).trigger('show');
            };

            var Hide = function(){
                $(obj).hide(param.effect, complete());
                if(focusedElementBeforeLayer) focusedElementBeforeLayer.focus();
                $(obj).removeClass(param.activeClassName);
                $(obj).removeAttr('tabindex');
                $(window).off('.stealKey');
                $(obj).off('.stealKey');
                $(obj).trigger('hide');
            };

            var CustomDisplay = function(Action){
                if(!param.effect) {
                    $(obj).css('display', Action);
                }
                else {
                    $(obj).animate({'display':Action }, param.effect,  complete());
                }
                if(Action!='none') EventBind();
                $(obj).trigger(Action);
            };

            /**
             * Minor Fn
             */
            var A11y = function(){
                $(obj).is(':visible') ? $(obj).removeAttr('aria-hidden') : $(obj).attr('aria-hidden',true);
                !$(obj).is(':visible') ? $('body>*').not(obj).removeAttr('aria-hidden') : $('body>*').not(obj).attr('aria-hidden', true);
            };
            var Blur = function(){
                $('body>*').toggleClass(param.blur);
            };

            var Align = function(){
                var align = $(param.align.split(' '));
                var pos = {};
                align.each(function(i, v){
                    if(v=='top') pos.top = 0;
                    if(v=='middle') {
                        pos.top = '50%';
                        pos.marginTop = -(utilFn.getSize().oSize.height/2);
                    }
                    if(v=='bottom') pos.bottom = 0;
                    if(v=='left') pos.left = 0;
                    if(v=='center') {
                        pos.left = '50%';
                        pos.marginLeft = -(utilFn.getSize().oSize.width/2);
                    }
                    if(v=='right') pos.right = 0;
                });
                $(obj).css(pos);
                $(obj).animate({'opacity':1},100);
                $(window).on('resize', function(){
                    pos.marginTop = -(utilFn.getSize().oSize.height/2);
                    pos.marginLeft = -(utilFn.getSize().oSize.width/2);
                    $(obj).css(pos);
                });
            };

            var Active = function(){
                $(obj).toggleClass(param.activeClassName);
            };

            /**
             * Plugin
             */

            var EventBind = function(){
                if(param.modal && $(obj).is(':visible')) {
                    $(window).on('mousewheel.stealKey DOMMouseScroll.stealKey touchmove.stealKey' ,function(e){
                        e.preventDefault();
                        return false;
                    });
                    if($(obj).find('[data-trigger='+ param.closeTrigger +']').length<1) {
                        $(obj).find('.'+param.closeTrigger).attr('data-trigger',param.closeTrigger);
                    }
                    $(obj).on('click.stealKey','[data-trigger='+ param.closeTrigger +']', function(){
                        Hide();
                        return false;
                    });
                    $(obj).on('keydown.stealKey', utilFn.stealKey);
                }
            };
            var BaseFn = function(){
                if (param.a11y) A11y();
                if (param.activeClassName) Active();
            };
            var optionalFn = function(){
                if(param.align) {
                    setTimeout(function(){
                        Align(param.align);
                    },100);
                }
                if (param.blur) Blur();
            };

            /**
             * Init
             */
            if(Type=='undefined') {
                if($(obj).is(':visible')) Hide();
                else Show();
            }
            if(Type=='string') {
                if(Action=='show') Show();
                else if(Action=='hide' || Action=='none') Hide();
                else CustomDisplay(Action);
            }
            if(Type=='object') {
                if(param.display)  {
                    if(param.display=='show') Show();
                    else if(param.display=='hide' || param.display=='none') Hide();
                    else CustomDisplay(param.display);
                }
                else {
                    if($(obj).is(':visible')) Hide();
                    else Show();
                }
                optionalFn();
            }

            BaseFn();
            if(!param.effect)  complete();
            return this;
        });
    };
    if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){
        var e=["\n %c Made with by Bom-studio($.layer) %c %c %c http://www.bom-studio.net %c %c\n\n",
            "color: #fff; background: #b0976d; padding:5px 0;","background: #494949; padding:5px 0;",
            "background: #494949; padding:5px 0;","color: #fff; background: #1c1c1c; padding:5px 0;",
            "background: #fff; padding:5px 0;","color: #b0976d; background: #fff; padding:5px 0;"];
        window.console.log.apply(console,e)
    }
    else window.console&&window.console.log("Made with by Bom-studio - http://www.bom-studio.net");
});