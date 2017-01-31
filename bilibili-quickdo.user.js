// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.2
// @description  双击全屏,全屏下'+','-'调节播放速度
// @author       jeayu
// @match        *://www.bilibili.com/video/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var playerQuickDo = {
    	fullscreenQD: function(player){
    		player.dblclick(function(){$('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();});
    	},
    	speedQD: function(player){
    		$(document).keydown(function(e){
    		    if (!$('div#bilibiliPlayer.bilibili-player.relative.mode-fullscreen')[0])
    		        return;
    		    if(e.keyCode === 187 && player.playbackRate <4){
    		        player.playbackRate += 0.25;
    		    }
    		    else if (e.keyCode === 189 && player.playbackRate > 0.5){
    		        player.playbackRate -= 0.25;
    		    }
    		});
    	},
    	getH5Player: function(){
    		return $('.bilibili-player-video video');
    	},
    	init: function(){
    		var timerCount = 0;
    		var timer = window.setInterval(function(){
    			var player = playerQuickDo.getH5Player();
    			if(player[0]){
    				try {
    					playerQuickDo.fullscreenQD(player);
    					playerQuickDo.speedQD(player[0]);
    				}catch (e){
    					console.log('playerQuickDo init error');
    				}finally{
    					console.log('playerQuickDo init done');
    					clearInterval(timer);
    				}
    			}else {
    				timerCount++;
					if (timerCount >= 100){
						console.log('H5 player not found');
                        clearInterval(timer);
					}
    			}
    		},100);

    	}
    };
    playerQuickDo.init();
})();