// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.3
// @description  双击全屏,全屏下'+','-'调节播放速度
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @match        *://bangumi.bilibili.com/*
// ==/UserScript==

/*
v0.3 更新：
兼容bangumi.bilibili.com

历史更新：
https://github.com/jeayu/bilibili-quickdo
 */

(function() {
    'use strict';

    var playerQuickDo = {
        player: null,
        animateTimer: null,
        currentDocument: null,
        fullscreenQD: function(player) {
            var that = this;
            player.dblclick(function() {
                that.currentDocument.find('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();
            });
        },
        speedQD: function(player) {
            var that = this;
            var cssArr = [
                '.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-speedHint{width: 120px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -75px; margin-top: -36px;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-speedHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 82px; height: 32px; line-height: 32px; padding: 9px 11px 9px 7px; font-size: 20px; margin-left: -50px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-speedHint-text{vertical-align: top; display: inline-block; width: 46px; overflow: visible; text-align: center;}'
            ];
            var html = '<div class="bilibili-player-speedHint" style="opacity: 0; display: none;"><span class="bilibili-player-speedHint-text">1</span></div>';
            this.addStyle(cssArr);
            this.currentDocument.find('div.bilibili-player-video-wrap').append(html);
            this.currentDocument.keydown(function(e) {
                if (!that.currentDocument.find('div#bilibiliPlayer.bilibili-player.relative.mode-fullscreen')[0])
                    return;
                if (e.keyCode === 187 && player.playbackRate < 4) {
                    player.playbackRate += 0.25;
                    that.showSpeedAnimate(player);
                } else if (e.keyCode === 189 && player.playbackRate > 0.5) {
                    player.playbackRate -= 0.25;
                    that.showSpeedAnimate(player);
                }

            });
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
        showSpeedAnimate: function(player) {
            var that = this;
            clearTimeout(this.animateTimer);
            this.currentDocument.find('div.bilibili-player-speedHint').stop().css("opacity", 1).show();
            this.currentDocument.find('span.bilibili-player-speedHint-text')[0].innerHTML = player.playbackRate + ' X';
            this.animateTimer = setTimeout(function() {
                that.currentDocument.find('div.bilibili-player-speedHint').animate({
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
                        that.fullscreenQD(player);
                        that.speedQD(player[0]);
                    } catch (e) {
                        console.log('playerQuickDo init error');
                    } finally {
                        console.log('playerQuickDo init done');
                        clearInterval(timer);
                    }
                } else {
                    timerCount++;
                    if (timerCount >= 100) {
                        console.log('H5 player not found');
                        clearInterval(timer);
                    }
                }
            }, 100);

        }
    };
    playerQuickDo.init();
})();