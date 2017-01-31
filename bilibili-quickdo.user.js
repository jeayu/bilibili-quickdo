// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.2
// @description  双击全屏,全屏下'+','-'调节播放速度
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    var playerQuickDo = {
        animateTimer: null,
        fullscreenQD: function(player) {
            player.dblclick(function() {
                $('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();
            });
        },
        speedQD: function(player) {
            GM_addStyle('.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-speedHint{width: 120px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -75px; margin-top: -36px;}');
            GM_addStyle('.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-speedHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 82px; height: 32px; line-height: 32px; padding: 9px 11px 9px 7px; font-size: 20px; margin-left: -50px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}');
            GM_addStyle('.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-speedHint-text{vertical-align: top; display: inline-block; width: 46px; overflow: visible; text-align: center;}');
            var html = '<div class="bilibili-player-speedHint" style="opacity: 0; display: none;"><span class="bilibili-player-speedHint-text">1</span></div>';
            $('div.bilibili-player-video-wrap').append(html);
            $(document).keydown(function(e) {
                if (!$('div#bilibiliPlayer.bilibili-player.relative.mode-fullscreen')[0])
                    return;
                if (e.keyCode === 187 && player.playbackRate < 4) {
                    player.playbackRate += 0.25;
                    playerQuickDo.showSpeedAnimate(player);
                } else if (e.keyCode === 189 && player.playbackRate > 0.5) {
                    player.playbackRate -= 0.25;
                    playerQuickDo.showSpeedAnimate(player);
                }

            });
        },
        showSpeedAnimate: function(player) {
            clearTimeout(this.animateTimer);
            $('div.bilibili-player-speedHint').stop().css("opacity", 1).show();
            $('span.bilibili-player-speedHint-text')[0].innerHTML = player.playbackRate + ' X';
            // 隐藏
            this.animateTimer = setTimeout(function() {
                $('div.bilibili-player-speedHint').animate({
                    opacity: 0
                }, 300, function() {
                    $(this).hide();
                });
            }, 1E3);
        },
        getH5Player: function() {
            return $('.bilibili-player-video video');
        },
        init: function() {
            var timerCount = 0;
            var timer = window.setInterval(function() {
                var player = playerQuickDo.getH5Player();
                if (player[0]) {
                    try {
                        playerQuickDo.fullscreenQD(player);
                        playerQuickDo.speedQD(player[0]);
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