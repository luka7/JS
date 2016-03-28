/**
 * Created by w-marc(shlee) on 2015-12-08.
 *
 * ===================================================================
 *  $(obj).layer(param, complete).fn() //param = obj, complete = Fn
 *  $(obj).layer() //toggle display
 *  $(obj).layer('show') //show
 *  $(obj).layer('hide') //hide
 *  $(obj).layer('inline-block') //custom display :: inline, table.... etc
 *  $(obj).layer({
        display: false,
        blur: false, //boolean 레이어 이외의 body>* 요소에 토글 class
        modal:false, //boolean esc 키 컨트롤, 닫기 전에 모든 이벤트 무시
        align: false, // 레이어 출력위치
        activeClassName : 'layer-active',  //string 레이어가 show 상태일때 부여되는 클래스
        closeTrigger : 'layer-close',  //string 닫기버튼 data-trigger="layer-close" or 셀랙터
        effect: false,  //string or object  효과 duration, easing, complete  todo {show, hide}
        useJsonExpression:false,  //boolean json 데이터 출력여부
        tmpl:null,   //object template useJsonExpression 가 true 일 경우만
        a11y: true //boolean 접근성
   })&&utilFn() // Closer
 *
 *  Method :>
 *      destroy() //obj 제거
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
            blur: false, //boolean 레이어 이외의 body>* 요소에 토글 class
            modal:false, //boolean esc 키 컨트롤, 닫기 전에 모든 이벤트 무시
            align: false, // 레이어 출력위치
            activeClassName : 'layer-active',  //string 레이어가 show 상태일때 부여되는 클래스
            closeTrigger : 'layer-close',  //string 닫기버튼 data-trigger="layer-close" or 셀랙터
            effect: false,  //string or object  효과 duration, easing  todo {show, hide}
            useJsonExpression:false,  //boolean json 데이터 출력여부
            tmpl:null,   //object template useJsonExpression 가 true 일 경우만
            a11y: true //boolean 접근성
        }, param || {});

        utilFn = {
            con: function(st){
                console.log(st);
                return this;
            },
            destroy : function(){
                $(This).remove();
            },
            getPosition : function(){
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
                var $childrens = This.find('*');
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
                    focusableItems = $childrens.filter(focusableElementsString).filter(':visible');
                    var numberOfFocusableItems;
                    numberOfFocusableItems = focusableItems.length;
                    var focusedItemIndex;
                    focusedItemIndex = focusableItems.index(focusedItem);
                    if (focusedItemIndex == -1) {
                        focusableItems.get(0).focus();
                    }
                    if (e.shiftKey) {
                        if (focusedItemIndex == 0) {
                            focusableItems.get(numberOfFocusableItems - 1).focus();
                            e.preventDefault();
                        }
                    } else {
                        if (focusedItemIndex == numberOfFocusableItems - 1) {
                            console.log(focusableItems.get(0));
                            focusableItems.get(0).focus();
                            e.preventDefault();
                        }
                    }
                    return true;
                }
            }
        };

        return this.each(function(i, obj){
                console.log(Type, param);

                focusedElementBeforeLayer = $(':focus');

                /**
                 * Default Fn
                 */
                var Show = function(){
                    $(obj).show(param.effect,complete).focus();
                };

                var Hide = function(){
                    $(obj).hide(param.effect,complete);
                    if(focusedElementBeforeLayer) focusedElementBeforeLayer.focus();
                    $(obj).off('.stealKey');
                    $(window).off('.stealKey');
                };

                var CustomDisplay = function(Action){
                    if(!param.effect) $(obj).css('display', Action);
                    else {
                        $(obj).animate({'display':Action }, param.effect, complete);
                    }
                };


                /**
                 * Minor Fn
                 */
                var A11y = function(){
                    $(obj).attr('aria-hidden') ? $(obj).removeAttr('aria-hidden') : $(obj).attr('aria-hidden',true);
                    $('body>*').attr('aria-hidden') ? $('body>*').removeAttr('aria-hidden') : $('body>*').attr('aria-hidden', true);
                };
                var Blur = function(){
                    $('body>*').toggleClass(param.blur);
                };
                var Modal = function(){

                };

                var Align = function(){
                    var align = $(param.align.split(' '));
                    var pos = {};
                    align.each(function(i, v){
                        if(v=='top') pos.top = 0;
                        if(v=='middle') {
                            pos.top = '50%';
                            pos.marginTop = -(utilFn.getPosition().oSize.height/2);
                        }
                        if(v=='bottom') pos.bottom = 0;
                        if(v=='left') pos.left = 0;
                        if(v=='center') {
                            pos.left = '50%';
                            pos.marginLeft = -(utilFn.getPosition().oSize.width/2);
                        }
                        if(v=='right') pos.right = 0;
                    });
                    $(obj).css(pos);
                    $(window).on('resize', function(){
                        pos.marginTop = -(utilFn.getPosition().oSize.height/2);
                        pos.marginLeft = -(utilFn.getPosition().oSize.width/2);
                        $(obj).css(pos);
                    });
                };

                var Active = function(){
                    $(obj).toggleClass(param.activeClassName);
                };

                /**
                 * Plugin
                 */
                var JsonExpress = function(){

                };

                var EventBind = function(){
                    if(param.modal) {
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
                    if (param.align) Align();
                    if (param.blur) Blur();
                    if (param.effect) Effect();
                    if (param.modal) Modal();
                    if (param.useJsonExpression) JsonExpress();
                };
                if(Type=='undefined') {
                    if($(obj).is(':visible')) Hide();
                    else Show();
                }
                if(Type=='string') {
                    if(Action=='show') Show();
                    else if(Action=='hide') Hide();
                    else CustomDisplay(Action);
                }
                if(Type=='object') {
                    if(param.display)  {
                        if(param.display=='show') Show();
                        else if(param.display=='hide') Hide();
                        else CustomDisplay(param.display);
                    }
                    else {
                        if($(obj).is(':visible')) Hide();
                        else Show();
                    }
                    optionalFn();
                }
                BaseFn();
                EventBind();
                if(!param.effect) complete;
            })&&utilFn;
    };
});