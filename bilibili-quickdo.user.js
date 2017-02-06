// ==UserScript==
// @name         bilibili - H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.8
// @description  双击全屏,'+','-'调节播放速度、f键全屏、w键网页全屏、p键暂停/播放、d键开启/关闭弹幕等
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @match        *://bangumi.bilibili.com/*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

/*
v0.8 更新：
播放器右侧设置-高级选项 可以设置自动播放、全屏和关闭弹幕

历史更新：
https://github.com/jeayu/bilibili-quickdo/blob/master/README.md#更新历史
 */

(function() {
    'use strict';

    var playerQuickDo = {
        player: null,
        infoAnimateTimer: null,
        currentDocument: null,
        isBangumi: false,
        isShowInput: false,
        keyCode:{
            'enter': 13,
            '=+': 187,
            '-_': 189,
            '+': 107,
            '-': 109,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'a': 65,
            'b': 66,
            'c': 67,
            'd': 68,
            'e': 69,
            'f': 70,
            'g': 71,
            'h': 72,
            'i': 73,
            'j': 74,
            'k': 75,
            'l': 76,
            'm': 77,
            'n': 78,
            'o': 79,
            'p': 80,
            'q': 81,
            'r': 82,
            's': 83,
            't': 84,
            'u': 85,
            'v': 86,
            'w': 87,
            'x': 88,
            'y': 89,
            'z': 90
        },
        config: {
            quickDo: {
                'fullscreen': 'f',
                'webFullscreen': 'w',
                'addSpeed': '=+',
                'subSpeed': '-_',
                'danmu': 'd',
                'playAndPause': 'p',
                'nextPart': 'l',
                'prevPart': 'k',
                'pushDanmu': 'enter'
            },
            auto: {
                'switch': 1, //总开关 1开启 0关闭
                'play': 1, //1开启 0关闭
                'fullscreen': 1, //1全屏 0关闭
                'danmu': 1 //1开启 0关闭
            },
            initLoopTime: 100,
            initLoopCount: 500,
            autoLoopTime: 300,
            autoLoopCount: 50,
        },
        dblclickFullscreen: function() {
            var that = this;
            this.player.dblclick(function() {
                $('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen', that.currentDocument).click();
            });
        },
        initInfoStyle: function() {
            var that = this;
            var cssArr = [
                '.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{width: 120px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -75px; margin-top: -36px;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 82px; height: 32px; line-height: 32px; padding: 9px 7px 9px 7px; font-size: 20px; margin-left: -50px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint-text{vertical-align: top; display: inline-block; overflow: visible; text-align: center;}'
            ];
            var html = '<div class="bilibili-player-infoHint" style="opacity: 0; display: none;"><span class="bilibili-player-infoHint-text">1</span></div>';
            this.addStyle(cssArr);
            $('div.bilibili-player-video-wrap', this.currentDocument).append(html);
        },
        getKeyCode: function(type){
            return this.keyCode[this.config.quickDo[type]];
        },
        bindEvnet: function(){
            $('input.bilibili-player-video-danmaku-input', this.currentDocument).click(function () {
               $(this).select();
            });
        },
        bindKeydown: function(){
            var that = this;
            this.currentDocument.keydown(function(e) {
                if ($("input:focus, textarea:focus", that.currentDocument).length > 0)
                    that.pushDanmuHandler(e.keyCode);
                else
                    that.keyHandler(e.keyCode);
            });
            if (this.isBangumi){
                $(document).keydown(function(e){
                    if ($(document).find("input:focus, textarea:focus").length > 0)
                        that.pushDanmuHandler(e.keyCode);
                    else
                        that.keyHandler(e.keyCode);
                });
            }
        },
        keyHandler: function(keyCode){
            var player = this.player[0];
            if (keyCode === this.getKeyCode('addSpeed') && player.playbackRate < 4) {
                player.playbackRate += 0.25;
                this.showInfoAnimate(player.playbackRate + ' X');
            } else if (keyCode === this.getKeyCode('subSpeed') && player.playbackRate > 0.5) {
                player.playbackRate -= 0.25;
                this.showInfoAnimate(player.playbackRate + ' X');
            } else if (keyCode === this.getKeyCode('fullscreen')){
                $('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen', this.currentDocument).click();
            } else if (keyCode === this.getKeyCode('webFullscreen')){
                $('.bilibili-player-iconfont.bilibili-player-iconfont-web-fullscreen', this.currentDocument).click();
            } else if (keyCode === this.getKeyCode('danmu')){
                if ($('.video-state-danmaku-off', this.currentDocument)[0]){
                    this.showInfoAnimate('弹幕开启');
                } else {
                    this.showInfoAnimate('弹幕关闭');
                }
                $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-danmaku', this.currentDocument).click();
                $('.bilibili-player-danmaku-setting-lite-panel', this.currentDocument).hide();
            } else if (keyCode === this.getKeyCode('playAndPause')){
                $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start', this.currentDocument).click();
            } else if (keyCode === this.getKeyCode('pushDanmu')){
                this.pushDanmuHandler(keyCode);
            } else{
                this.partHandler(keyCode);
            }
        },
        autoHandler: function(){
            var config = this.config.auto;
            if(config.switch === 0)
                return;
            var that = this;
            var count = 0;
            var timer = window.setInterval(function(){
                var readyState = $('.bilibili-player-video-panel div[stage="3"]', that.currentDocument);
                count++;
                if (readyState && readyState.html() === '加载视频内容...[完成]'){
                    if(GM_getValue('playAndPause') === 1){
                        that.keyHandler(that.getKeyCode('playAndPause'));
                    }
                    if (GM_getValue('fullscreen') === 1){
                        that.keyHandler(that.getKeyCode('fullscreen'));
                    }
                    if (GM_getValue('danmu') === 0){
                        that.keyHandler(that.getKeyCode('danmu'));
                    }
                    clearInterval(timer);
                }
                if(count >= that.config.autoLoopCount){
                    console.log('playerQuickDo auto failed');
                    clearInterval(timer);
                }
            }, this.config.autoLoopTime);
        },
        partHandler: function(keyCode){
            var that = this;
            var href;
            if(this.isBangumi){
                var curPart = $('.v1-bangumi-list-part-child.cur:eq(0)');
                var curId = curPart.attr('data-episode-id');
                if(keyCode === this.getKeyCode('nextPart')){
                    var nextId = curPart.next().attr('data-episode-id');
                    href = nextId ? location.href.replace(curId,nextId) : href;
                } else if (keyCode === this.getKeyCode('prevPart')){
                    var prevId = curPart.prev().attr('data-episode-id');
                    href = prevId ? location.href.replace(curId,prevId) : href;
                }
            }else if($('div.v-plist span.curPage')[0]){
                if(keyCode === this.getKeyCode('nextPart')){
                    href = $('div.v-plist span.curPage').next().attr('href');
                } else if (keyCode === this.getKeyCode('prevPart')){
                    href = $('div.v-plist span.curPage').prev().attr('href');
                }
            }
            if(href){
                location.href = href;
                if(this.isBangumi){
                    location.reload();
                }
            }
        },
        pushDanmuHandler: function(keyCode){
            if (keyCode !== this.getKeyCode('pushDanmu')){
                return;
            }
            var isFullScreen = $('div.bilibili-player.relative.mode-fullscreen', this.currentDocument)[0];
            if(isFullScreen && $("input.bilibili-player-video-danmaku-input:focus", this.currentDocument).length <= 0 && !this.isShowInput){
                this.isShowInput = true;
                $('div.bilibili-player-video-sendbar.relative', this.currentDocument).css("opacity", 1).show();
                $('input.bilibili-player-video-danmaku-input', this.currentDocument).click();
            }else if(isFullScreen){
                this.isShowInput = false;
                $('div.bilibili-player-video-sendbar.relative', this.currentDocument).css("opacity", 0).hide();
            } else{
                $('input.bilibili-player-video-danmaku-input', this.currentDocument).click();
            }
        },
        addStyle: function(cssArr){
            var css = '<style type="text/css">';
            for (let i in cssArr){
                css += cssArr[i];
            }
            css += '</style>';
            try{
                $('head', this.currentDocument).append(css);
            } catch (e) {
                console.log(e);
            }
        },
        initSettingHTML: function(){
            var config = {
                playAndPause: {checkboxId: 'checkboxAP', text: '自动播放'},
                fullscreen: {checkboxId: 'checkboxAF',text: '自动全屏'},
                danmu: {checkboxId: 'checkboxAD',text: '自动打开弹幕'}
            };
            var that = this;
            for (let key in config){
                var value = config[key];
                $('.bilibili-player-advopt-wrap', this.currentDocument).append(this.getSettingHTML(value.checkboxId, value.text));
                if(GM_getValue(key) === 1){
                    $(`#${value.checkboxId}-lable`, this.currentDocument).addClass('bpui-state-active');
                }else if(GM_getValue(key) === 0){
                    $(`#${value.checkboxId}-lable`, this.currentDocument).removeClass('bpui-state-active');
                }else{
                    GM_setValue(key, this.config.auto[key]);
                    $(`#${value.checkboxId}-lable`, this.currentDocument).removeClass('bpui-state-active');
                }
                $(`#${value.checkboxId}`, this.currentDocument).click(function(){
                    var gmvalue = GM_getValue(key) === 1 ? 0 : 1;
                    GM_setValue(key, gmvalue);
                    if(gmvalue === 1){
                        $(this, that.currentDocument).next().addClass('bpui-state-active');
                    }else{
                        $(this, that.currentDocument).next().removeClass('bpui-state-active');
                    }
                });
            }
            this.autoHandler();
        },
        getSettingHTML: function(checkboxId,text){
            var html = `
            <div class="bilibili-player-fl bilibili-player-tooltip-trigger" data-tooltip="1" data-position="bottom-center" data-change-mode="1">
                <input type="checkbox" class="bilibili-player-setting-fullscreensend bpui-component bpui-checkbox bpui-button" id="${checkboxId}">
                <label for="${checkboxId}" id="${checkboxId}-lable" class="button bpui-button-text-only" role="button" data-pressed="false">
                    <span class="bpui-button-text">
                        <i class="bpui-icon-checkbox bilibili-player-iconfont-checkbox icon-12checkbox"></i>
                        <i class="bpui-icon-checkbox bilibili-player-iconfont-checkbox icon-12selected2"></i>
                        <i class="bpui-icon-checkbox bilibili-player-iconfont-checkbox icon-12select"></i>
                        <span class="bpui-checkbox-text">${text}
                        </span>
                    </span>
                </label>
            </div>`;
            return html;
        },
        showInfoAnimate: function(info) {
            var that = this;
            clearTimeout(this.infoAnimateTimer);
            $('div.bilibili-player-infoHint', this.currentDocument).stop().css("opacity", 1).show();
            $('span.bilibili-player-infoHint-text', this.currentDocument)[0].innerHTML = info;
            this.infoAnimateTimer = setTimeout(function() {
                $('div.bilibili-player-infoHint', that.currentDocument).animate({
                    opacity: 0
                }, 300, function() {
                    $(this).hide();
                });
            }, 1E3);
        },
        getH5Player: function() {
            if(this.player && this.player[0])
                return this.player;
            var bangumi = /bangumi.bilibili.com/g;
            var iframePlayer = $('iframe.bilibiliHtml5Player');
            if (bangumi.exec(location.href) && iframePlayer[0]) {
                try{
                    this.currentDocument = iframePlayer.contents();
                    this.isBangumi = true;
                } catch (e) {
                }
            } else{
                this.currentDocument = $(document);
            }
            this.player = $("body", this.currentDocument).find('.bilibili-player-video video');
            return this.player;
        },
        init: function() {
            var timerCount = 0;
            var that = this;
            var timer = window.setInterval(function() {
                var player = that.getH5Player();
                if (player[0]) {
                    try {
                        that.dblclickFullscreen();
                        that.initInfoStyle();
                        that.bindEvnet();
                        that.bindKeydown();
                        that.initSettingHTML();
                    } catch (e) {
                        console.log('playerQuickDo init error');
                    } finally {
                        console.log('playerQuickDo init done');
                        clearInterval(timer);
                    }
                } else {
                    timerCount++;
                    if (timerCount >= that.config.initLoopCount) {
                        console.log('H5 player not found');
                        clearInterval(timer);
                    }
                }
            }, this.config.initLoopTime);

        }
    };
    playerQuickDo.init();
})();