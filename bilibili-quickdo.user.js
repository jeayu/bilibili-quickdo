// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.8.1
// @description  双击全屏,'+','-'调节播放速度、f键全屏、w键网页全屏、p键暂停/播放、d键开启/关闭弹幕等
// @author       jeayu
// @match        *://www.bilibili.com/bangumi/play/ep*
// @match        *://www.bilibili.com/bangumi/play/ss*
// @match        *://www.bilibili.com/video/av*
// @match        *://www.bilibili.com/watchlater/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/*
v0.8.1 更新：
修复失效的功能

历史更新：
https://github.com/jeayu/bilibili-quickdo/blob/master/README.md#更新历史
 */

(function () {
    'use strict';

    var bilibiliQuickDo = {
        h5Player: null,
        infoAnimateTimer: null,
        isBangumi: false,
        isShowInput: false,
        keyCode: {
            'enter': 13,
            'esc': 27,
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
                'pushDanmu': 'enter',
                'esc': 'esc',
            },
            auto: {
                'switch': 1, //总开关 1开启 0关闭
                'play': 1, //1开启 0关闭
                'fullscreen': 1, //1全屏 0关闭
                'danmu': 1 //1开启 0关闭
            },
        },
        dblclickFullscreen: function () {
            var that = this;
            this.h5Player.dblclick(function () {
                $('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();
                window.dispatchEvent(new Event('resize'));
            });
        },
        initInfoStyle: function () {
            var that = this;
            var cssArr = [
                '.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{width: 120px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -75px; margin-top: -36px;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 82px; height: 32px; line-height: 32px; padding: 9px 7px 9px 7px; font-size: 20px; margin-left: -50px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint-text{vertical-align: top; display: inline-block; overflow: visible; text-align: center;}'
            ];
            var html = '<div class="bilibili-player-infoHint" style="opacity: 0; display: none;"><span class="bilibili-player-infoHint-text">1</span></div>';
            this.addStyle(cssArr);
            $('div.bilibili-player-video-wrap').append(html);
        },
        getKeyCode: function (type) {
            return this.keyCode[this.config.quickDo[type]];
        },
        bindEvnet: function () {
            $('input.bilibili-player-video-danmaku-input').click(function () {
                $(this).select();
            });
        },
        bindKeydown: function () {
            var that = this;
            if (this.isBangumi) {
                $(document).keydown(function (e) {
                    if ($(document).find("input:focus, textarea:focus").length > 0) {
                        that.pushDanmuHandler(e.keyCode);
                    } else {
                        that.keyHandler(e.keyCode);
                    }
                });
            } else {
                $(document).keydown(function (e) {
                    if ($("input:focus, textarea:focus").length > 0) {
                        that.pushDanmuHandler(e.keyCode);
                    } else {
                        that.keyHandler(e.keyCode);
                    }
                });
            }
        },
        keyHandler: function (keyCode) {
            var h5Player = this.h5Player[0];
            if (keyCode === this.getKeyCode('addSpeed') && h5Player.playbackRate < 4) {
                h5Player.playbackRate += 0.25;
                this.showInfoAnimate(h5Player.playbackRate + ' X');
            } else if (keyCode === this.getKeyCode('subSpeed') && h5Player.playbackRate > 0.5) {
                h5Player.playbackRate -= 0.25;
                this.showInfoAnimate(h5Player.playbackRate + ' X');
            } else if (keyCode === this.getKeyCode('fullscreen')) {
                $('.bilibili-player-iconfont.bilibili-player-iconfont-fullscreen').click();
                window.dispatchEvent(new Event('resize'));
            } else if (keyCode === this.getKeyCode('webFullscreen')) {
                $('.bilibili-player-iconfont.bilibili-player-iconfont-web-fullscreen').click();
            } else if (keyCode === this.getKeyCode('danmu')) {
                if ($('.video-state-danmaku-off')[0]) {
                    this.showInfoAnimate('弹幕开启');
                } else {
                    this.showInfoAnimate('弹幕关闭');
                }
                $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-danmaku').click();
                $('.bilibili-player-danmaku-setting-lite-panel').hide();
            } else if (keyCode === this.getKeyCode('playAndPause')) {
                $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
            } else if (keyCode === this.getKeyCode('pushDanmu')) {
                this.pushDanmuHandler(keyCode);
            } else if (keyCode === this.getKeyCode('esc')) {
                window.dispatchEvent(new Event('resize'));
            } else {
                this.partHandler(keyCode);
            }
        },
        autoHandler: function () {
            var config = this.config.auto;
            if (config.switch === 0) {
                return;
            }
            var h5Player = this.h5Player[0];
            if (GM_getValue('fullscreen') === 1 && !player.isFullScreen()) {
                this.keyHandler(this.getKeyCode('fullscreen'));
            }
            if (GM_getValue('playAndPause') === 1 && h5Player.paused) {
                h5Player.play();
            }
            if (GM_getValue('danmu') === 0) {
                this.keyHandler(this.getKeyCode('danmu'));
            }
        },
        partHandler: function (keyCode) {
            var that = this;
            var newPart;
            var href;
            if ($('.episode-item.on')[0]) {
                if (keyCode === this.getKeyCode('nextPart')) {
                    newPart = $('.episode-item.on').next();
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    newPart = $('.episode-item.on').prev();
                }
                if (newPart && newPart[0]) {
                    newPart.click();
                }
            } else if ($('.item.on')[0]) {
                if (keyCode === this.getKeyCode('nextPart')) {
                    href = $('.item.on').next().attr('href');
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    href = $('.item.on').prev().attr('href');
                }
                if (href) {
                    location.href = href;
                }
            }
        },
        pushDanmuHandler: function (keyCode) {
            if (keyCode !== this.getKeyCode('pushDanmu')) {
                return;
            }
            var isFullScreen = $('div.bilibili-player.relative.mode-fullscreen')[0];
            if (isFullScreen && $("input.bilibili-player-video-danmaku-input:focus").length <= 0 && !this.isShowInput) {
                this.isShowInput = true;
                $('div.bilibili-player-video-sendbar.relative').css("opacity", 1).show();
                $('input.bilibili-player-video-danmaku-input').click();
            } else if (isFullScreen) {
                this.isShowInput = false;
                $('div.bilibili-player-video-sendbar.relative').css("opacity", 0).hide();
            } else {
                $('input.bilibili-player-video-danmaku-input').click();
            }
        },
        addStyle: function (cssArr) {
            var css = '<style type="text/css">';
            for (let i in cssArr) {
                css += cssArr[i];
            }
            css += '</style>';
            try {
                $('head').append(css);
            } catch (e) {
                console.log(e);
            }
        },
        initSettingHTML: function () {
            var config = {
                playAndPause: { checkboxId: 'checkboxAP', text: '自动播放' },
                fullscreen: { checkboxId: 'checkboxAF', text: '自动全屏' },
                danmu: { checkboxId: 'checkboxAD', text: '自动打开弹幕' }
            };
            var that = this;
            for (let key in config) {
                var value = config[key];
                $('.bilibili-player-advopt-wrap').append(this.getSettingHTML(value.checkboxId, value.text));
                if (GM_getValue(key) === 1) {
                    $(`#${value.checkboxId}-lable`).addClass('bpui-state-active');
                } else if (GM_getValue(key) === 0) {
                    $(`#${value.checkboxId}-lable`).removeClass('bpui-state-active');
                } else {
                    GM_setValue(key, this.config.auto[key]);
                    $(`#${value.checkboxId}-lable`).removeClass('bpui-state-active');
                }
                $(`#${value.checkboxId}`).click(function () {
                    var gmvalue = GM_getValue(key) === 1 ? 0 : 1;
                    GM_setValue(key, gmvalue);
                    if (gmvalue === 1) {
                        $(this).next().addClass('bpui-state-active');
                    } else {
                        $(this).next().removeClass('bpui-state-active');
                    }
                });
            }
        },
        getSettingHTML: function (checkboxId, text) {
            var html = `
            <div class="bilibili-player-fl bilibili-player-tooltip-trigger" data-tooltip="1" data-position="bottom-center" data-change-mode="1">
                <input type="checkbox" class="bilibili-player-setting-fullscreensend bpui-component bpui-checkbox bpui-button" id="${checkboxId}">
                <label for="${checkboxId}" id="${checkboxId}-lable" class="button bpui-button-text-only" role="button" data-pressed="false">
                    <span class="bpui-button-text">
                    <i class="bpui-icon-checkbox bilibili-player-iconfont-checkbox icon-12checkbox"></i>
                    <i class="bpui-icon-checkbox bilibili-player-iconfont-checkbox icon-12selected2"></i>
                    <i class="bpui-icon-checkbox bilibili-player-iconfont-checkbox icon-12select"></i>
                    <span class="bpui-checkbox-text">${text}</span>
                    </span>
                </label>
            </div>`;
            return html;
        },
        showInfoAnimate: function (info) {
            var that = this;
            clearTimeout(this.infoAnimateTimer);
            $('div.bilibili-player-infoHint').stop().css("opacity", 1).show();
            $('span.bilibili-player-infoHint-text')[0].innerHTML = info;
            this.infoAnimateTimer = setTimeout(function () {
                $('div.bilibili-player-infoHint').animate({
                    opacity: 0
                }, 300, function () {
                    $(this).hide();
                });
            }, 1E3);
        },
        init: function () {
            var timerCount = 0;
            var that = this;
            var bangumi = /bangumi/g;
            this.isBangumi = bangumi.exec(location.href);
            var observer = new MutationObserver(function (mutations, observer) {
                mutations.forEach(function (mutation) {
                    if (mutation.previousSibling && $(mutation.target).attr('stage') === '1') {
                        try {
                            that.h5Player = $("#bofqi").find('.bilibili-player-video video');
                            that.dblclickFullscreen();
                            that.initInfoStyle();
                            that.bindEvnet();
                            that.bindKeydown();
                            that.initSettingHTML();
                            that.autoHandler();
                        } catch (e) {
                            console.log('bilibili-quickdo init error');
                            throw e;
                        } finally {
                            console.log('bilibili-quickdo init done');
                        }
                    }
                });
            });
            observer.observe($('body')[0], {
                childList: true,
                subtree: true,
            });
        }
    };
    bilibiliQuickDo.init();
})();