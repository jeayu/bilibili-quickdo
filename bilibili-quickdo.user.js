// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.1
// @description  双击全屏等
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.onload=function(){
        $('video').dblclick(function(){$('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();});
    };
})();