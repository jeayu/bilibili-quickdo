// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.1
// @description  双击全屏,全屏下'+','-'调节播放速度
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.onload=function(){
        $('video').dblclick(function(){$('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();});
    };
    $(document).keydown(function(e){
        if (!$('div#bilibiliPlayer.bilibili-player.relative.mode-fullscreen')[0])
            return;
        var video = $('video')[0];
        if(e.keyCode === 187 && video.playbackRate <4){
            video.playbackRate += 0.25;
        }
        else if (e.keyCode === 189 && video.playbackRate > 0.5){
            video.playbackRate -= 0.25;
        }
    });
})();