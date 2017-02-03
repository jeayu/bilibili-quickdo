// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.5
// @description  双击全屏,'+','-'调节播放速度、f键全屏、w键网页全屏、p键暂停/播放、d键开启/关闭弹幕等
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @match        *://bangumi.bilibili.com/*
// ==/UserScript==

/*
v0.5 更新：
可以配置自动播放、全屏和关闭弹幕;开启/关闭弹幕有提示

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
        keyCode:{
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
                'play/pause': 'p',
                'focus': 'o'
            },
            auto: {
                'switch': 1, //总开关 1开启 0关闭
                'play': 1, //1开启 0关闭
                'fullscreen': 1, //1全屏 2网页全屏 关闭
                'danmu': 1 //1开启 0关闭
            },
            initLoopTime: 100,
            initLoopCount: 100,
            autoLoopTime: 300,
            autoLoopCount: 50,
        },
        dblclickFullscreen: function() {
            var that = this;
            this.player.dblclick(function() {
                that.currentDocument.find('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();
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
            this.currentDocument.find('div.bilibili-player-video-wrap').append(html);
        },
        getKeyCode: function(type){
            return this.keyCode[this.config.quickDo[type]];
        },
        playerFocus: function(){
            this.currentDocument.find('div.player').click();
        },
        bindKeydown: function(){
            var that = this;
            this.currentDocument.keydown(function(e) {
                if (that.currentDocument.find("input:focus, textarea:focus").length > 0)
                    return;
                that.keyHandler(e.keyCode);
            });
            if (this.isBangumi){
                $(document).keydown(function(e){
                    if ($(document).find("input:focus, textarea:focus").length > 0)
                        return;
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
                this.currentDocument.find('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();
            } else if (keyCode === this.getKeyCode('webFullscreen')){
                this.currentDocument.find('.bilibili-player-iconfont.bilibili-player-iconfont-web-fullscreen').click();
            } else if (keyCode === this.getKeyCode('danmu')){
                if ($('.video-state-danmaku-off')[0]){
                    this.showInfoAnimate('弹幕开启');
                } else {
                    this.showInfoAnimate('弹幕关闭');
                }
                this.currentDocument.find('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-danmaku').click();
                this.currentDocument.find('.bilibili-player-danmaku-setting-lite-panel').hide();
            } else if (keyCode === this.getKeyCode('play/pause')){
                this.currentDocument.find('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
            }
        },
        autoHandler: function(){
            var config = this.config.auto;
            if(config.switch === 0)
                return;
            var that = this;
            var count = 0;
            var timer = window.setInterval(function(){
                var readyState = that.currentDocument.find('.bilibili-player-video-panel div[stage="3"]');
                count++;
                if (readyState && readyState.html() === '加载视频内容...[完成]'){
                    if(config.play === 1){
                        that.keyHandler(that.getKeyCode('play/pause'));
                    }
                    if (config.fullscreen === 1){
                        that.keyHandler(that.getKeyCode('fullscreen'));
                    } else if (config.fullscreen === 2){
                        that.keyHandler(that.getKeyCode('webFullscreen'));
                    }
                    if (config.danmu === 0){
                        that.keyHandler(that.getKeyCode('danmu'));
                    }
                    clearInterval(timer);
                }
                if(count >= that.config.autoLoopCount){
                    console.log('playerQuickDo auto failed');
                }
            }, this.config.autoLoopTime);
        },
        addStyle: function(cssArr){
            var css = '<style type="text/css">';
            for (let i in cssArr){
                css += cssArr[i];
            }
            css += '</style>';
            try{
                this.currentDocument.find('head').append(css);
            } catch (e) {
                console.log(e);
            }
        },
        showInfoAnimate: function(info) {
            var that = this;
            clearTimeout(this.infoAnimateTimer);
            this.currentDocument.find('div.bilibili-player-infoHint').stop().css("opacity", 1).show();
            this.currentDocument.find('span.bilibili-player-infoHint-text')[0].innerHTML = info;
            this.infoAnimateTimer = setTimeout(function() {
                that.currentDocument.find('div.bilibili-player-infoHint').animate({
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
            this.player = this.currentDocument.find("body").find('.bilibili-player-video video');
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
                        that.bindKeydown();
                        that.autoHandler();
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