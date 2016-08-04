/**
 * jQuery plugin : $.addViewportEvent
 * Created by bom-studio(lee sang-hwa) on 2016-06
 *
 * ===================================================================
 *  $(obj).addViewportEvent(param) //param = option

 triggerPosition //스크린 세로 값에 오브젝트 상단이 위치하였을 경우(px)
 triggerPositionPercent //스크린 세로 값에 오브젝트 상단이 위치하였을 경우(%)

 * Event : enter, leave, visible, invisible, fullVisible
 *  Extend Method :>
 *      destroy() //event 제거
 *
 * ===================================================================*/
(function () {
    'use strict';
    $(function () {
        'use strict';
        $.fn.addViewportEvent = function (param) {
            var events = 'scroll.addViewportEvent load.addViewportEvent resize.addViewportEvent';
            param = $.extend({
                parent : window,
                a11y: false,
                triggerPosition:false,
                triggerPositionPercent:false,
                enter : false,
                leave : false,
                progress : false,
                visiblePercent :false,
                visible :false,
                invisible :false,
                fullVisible :false
            }, param || {});
            if(typeof(param.triggerPosition && param.triggerPositionPercent) == 'number') {
                console.warn('px값과 %값이 중복 적용 될 수 없습니다.');
                return true;
            }
            var methods = $.fn.extend({
                destroy : function(){
                    $(param.parent).off(events);
                }
            });
            return this.each(function(idx, obj){
                var isEnter = false;
                var isVisible = false;
                var isActive = false;
                var isFullVisible = false;
                var visiblePercent = 0;
                var parent = param.parent;
                $(parent).on(events, function(){
                    var returnValue = {
                        Height : $(obj).outerHeight(),
                        ViewportHeight : $(parent).height(),
                        ScrollTop : $(document).scrollTop(),
                        OffsetTop : $(obj).offset().top
                    };
                    var visiblePerTopPercent = ((returnValue.ScrollTop + returnValue.ViewportHeight - returnValue.OffsetTop) / returnValue.Height * 100).toFixed(2);
                    var visiblePerBottomPercent = -((returnValue.ScrollTop - returnValue.OffsetTop - returnValue.Height) / returnValue.Height * 100).toFixed(2);
                    var viewPortPosition = returnValue.OffsetTop - returnValue.ScrollTop - param.triggerPosition;
                    var viewPortPositionPercent = (viewPortPosition / returnValue.ViewportHeight * 100 - param.triggerPositionPercent).toFixed(2);
                    isVisible = visiblePerTopPercent >= 0 && visiblePerBottomPercent >=0;

                    if(viewPortPositionPercent >= 50) viewPortPositionPercent = 50;
                    else if(viewPortPositionPercent <= -50) viewPortPositionPercent = -50;

                    if( isVisible && visiblePerTopPercent <=100) visiblePercent=visiblePerTopPercent;
                    else if(isVisible && visiblePerBottomPercent<=100) visiblePercent=visiblePerBottomPercent;
                    else if (isVisible) visiblePercent = 100;
                    else visiblePercent = 0;

                    if(isVisible) {
                        /* Set Property */
                        obj.isVisible = isVisible;
                        obj.isEnter = isEnter;
                        obj.viewPortPositionPercent = viewPortPositionPercent;
                        obj.viewPortPosition = viewPortPosition;
                        obj.visiblePercent = visiblePercent;
                    }
                    if(isVisible) {
                        /* Set Trigger & Run */
                        if (!isEnter && (param.triggerPositionPercent !== false && viewPortPositionPercent <= 0) || (param.triggerPosition && viewPortPosition <= 0)) {
                            $(obj).trigger('enter');
                            if ($.isFunction(param.enter)) param.enter();
                        }
                        if (isEnter && (param.triggerPositionPercent !== false && viewPortPositionPercent > 0 ) || (param.triggerPosition && viewPortPosition > 0)) {
                            $(obj).trigger('leave');
                            if ($.isFunction(param.leave)) param.leave();
                        }
                        if ($.isFunction(param.progress)) {
                            if (param.triggerPositionPercent) param.progress(Number(viewPortPositionPercent), returnValue);
                            if (param.triggerPosition) param.progress(Number(viewPortPosition), returnValue);
                        }
                    }
                    if (!isActive && visiblePercent > 0) {
                        $(obj).trigger('visible');
                        if ($.isFunction(param.visible)) param.visible();
                    }
                    if (isActive && visiblePercent == 0) {
                        $(obj).trigger('invisible');
                        if ($.isFunction(param.invisible)) param.invisible();
                        $(obj).trigger('leave');
                        if ($.isFunction(param.leave)) param.leave();
                    }
                    if (!isFullVisible && visiblePercent == 100) {
                        $(obj).trigger('fullVisible');
                        if ($.isFunction(param.fullVisible)) param.fullVisible();
                    }
                    if ($.isFunction(param.visiblePercent)) param.visiblePercent(Number(visiblePercent), returnValue);

                    isActive = visiblePercent != 0;
                    isEnter = ( (param.triggerPositionPercent && viewPortPositionPercent <= 0) && isVisible) || ((param.triggerPosition && viewPortPosition <= 0) && isVisible);
                    isFullVisible = visiblePercent >= 100;
                });

            });
        }
    });
    if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){
        var msg=[
            "\n %c Made with by Bom-studio($.addViewportEvent) %c %c %c http://www.bom-studio.net %c %c\n\n",
            "color: #fff; background: #b0976d; padding:5px 0;","background: #494949; padding:5px 0;",
            "background: #494949; padding:5px 0;","color: #fff; background: #1c1c1c; padding:5px 0;",
            "background: #fff; padding:5px 0;","color: #b0976d; background: #fff; padding:5px 0;"
        ];
        window.console.log.apply(console,msg)
    }
    else window.console&&window.console.log("$.addViewportEvent : Made with by Bom-studio - http://www.bom-studio.net");
})();