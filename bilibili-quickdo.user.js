// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.9
// @description  双击全屏,'+','-'调节播放速度、f键全屏、w键网页全屏、p键暂停/播放、d键开启/关闭弹幕等
// @author       jeayu
// @license      MIT
// @match        *://www.bilibili.com/bangumi/play/ep*
// @match        *://www.bilibili.com/bangumi/play/ss*
// @match        *://www.bilibili.com/video/av*
// @match        *://www.bilibili.com/watchlater/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/*
v0.9 更新：
新增Q键宽屏模式、J键镜像、T键顶部弹幕、B键底部弹幕、S键滚动弹幕、C键防挡字幕

历史更新：
https://github.com/jeayu/bilibili-quickdo/blob/master/README.md#更新历史
 */

(function () {
    'use strict';

    var bilibiliQuickDo = {
        h5Player: null,
        infoAnimateTimer: null,
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
                'widescreen': 'q',
                'addSpeed': '=+',
                'subSpeed': '-_',
                'danmu': 'd',
                'playAndPause': 'p',
                'nextPart': 'l',
                'prevPart': 'k',
                'pushDanmu': 'enter',
                'esc': 'esc',
                'mirror': 'j',
                'danmuTop': 't',
                'danmuBottom': 'b',
                'danmuScroll': 's',
                'danmuPrevent': 'c',
            },
            auto: {
                'switch': 1, //总开关 1开启 0关闭
                'play': 1, //1开启 0关闭
                'fullscreen': 1, //1全屏 0关闭
                'danmu': 1 //1开启 0关闭
            },
        },
        dblclickFullscreen: function () {
            player.addEventListener('dblclick', () => {
                this.keyHandler(this.getKeyCode('fullscreen'));
            });
        },
        initInfoStyle: function () {
            var cssArr = [
                '.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{width: 160px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -95px; margin-top: -36px;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 122px; height: 32px; line-height: 32px; padding: 9px 7px 9px 7px; font-size: 20px; margin-left: -70px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint-text{vertical-align: top; display: inline-block; overflow: visible; text-align: center;}'
            ];
            var html = '<div class="bilibili-player-infoHint" style="opacity: 0; display: none;"><span class="bilibili-player-infoHint-text">1</span></div>';
            this.addStyle(cssArr);
            $('div.bilibili-player-video-wrap').append(html);
        },
        getKeyCode: function (type) {
            return this.keyCode[this.config.quickDo[type]];
        },
        bindKeydown: function () {
            if ($(document).data('events')['keydown']) {
                return;
            }
            $(document).keydown((e) => {
                if ($("input:focus, textarea:focus").length > 0) {
                    this.pushDanmuHandler(e.keyCode);
                } else {
                    this.keyHandler(e.keyCode);
                }
            });
        },
        keyHandler: function (keyCode) {
            var h5Player = this.h5Player[0];
            var danmuOpt;
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
            } else if (keyCode === this.getKeyCode('widescreen')) {
                $('.bilibili-player-iconfont.bilibili-player-iconfont-widescreen').click();
            } else if (keyCode === this.getKeyCode('danmu')) {
                var e = $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-danmaku');
                e.click();
                this.showInfoAnimate(e.attr('data-text'));
                $('.bilibili-player-danmaku-setting-lite-panel').hide();
            } else if (keyCode === this.getKeyCode('danmuTop')) {
                danmuOpt = $('.bilibili-player-danmaku-setting-lite-type-list [ftype="top"]');
            } else if (keyCode === this.getKeyCode('danmuBottom')) {
                danmuOpt = $('.bilibili-player-danmaku-setting-lite-type-list [ftype="bottom"]');
            } else if (keyCode === this.getKeyCode('danmuScroll')) {
                danmuOpt = $('.bilibili-player-danmaku-setting-lite-type-list [ftype="scroll"]');
            } else if (keyCode === this.getKeyCode('danmuPrevent')) {
                var e = $('input[name="ctlbar_danmuku_prevent"]').next();
                e.click();
                if (e.attr('data-pressed') === 'true') {
                    this.showInfoAnimate(`开启${e.text()}`);
                } else {
                    this.showInfoAnimate(`关闭${e.text()}`);
                }
            } else if (keyCode === this.getKeyCode('playAndPause')) {
                $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
            } else if (keyCode === this.getKeyCode('pushDanmu')) {
                this.pushDanmuHandler(keyCode);
            } else if (keyCode === this.getKeyCode('esc')) {
                window.dispatchEvent(new Event('resize'));
            } else if (keyCode === this.getKeyCode('mirror')) {
                var mirrorCss = 'video-mirror';
                if (this.h5Player.parent().hasClass(mirrorCss)) {
                    this.h5Player.parent().removeClass(mirrorCss);
                } else {
                    this.h5Player.parent().addClass(mirrorCss);
                }
            } else {
                this.partHandler(keyCode);
            }
            if (danmuOpt) {
                $('.bilibili-player-danmaku-setting-lite-panel').mouseover();
                danmuOpt.click();
                if (danmuOpt.hasClass('disabled')) {
                    this.showInfoAnimate(`关闭${danmuOpt.text()}`);
                } else {
                    this.showInfoAnimate(`开启${danmuOpt.text()}`);
                }
                $('.bilibili-player-danmaku-setting-lite-panel').mouseout();
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
            var danmuInput = $('input.bilibili-player-video-danmaku-input');
            if (keyCode !== this.getKeyCode('pushDanmu')
                || danmuInput.css('display') === 'none') {
                return;
            }
            if (player.isFullScreen() && $("input.bilibili-player-video-danmaku-input:focus").length <= 0 && !this.isShowInput) {
                this.isShowInput = true;
                $('div.bilibili-player-video-sendbar.relative').css("opacity", 1).show();
                danmuInput.select();
            } else if (player.isFullScreen()) {
                this.isShowInput = false;
                $('div.bilibili-player-video-sendbar.relative').css("opacity", 0).hide();
            } else if ($("input.bilibili-player-video-danmaku-input:focus").length <= 0) {
                danmuInput.select();
            } else {
                danmuInput.blur();
            }
        },
        addStyle: function (cssArr) {
            var css = '<style type="text/css">';
            cssArr.forEach((c) => {
                css += c;
            });
            css += '</style>';
            $('head').append(css);
        },
        initSettingHTML: function () {
            var config = {
                playAndPause: { checkboxId: 'checkboxAP', text: '自动播放' },
                fullscreen: { checkboxId: 'checkboxAF', text: '自动全屏' },
                danmu: { checkboxId: 'checkboxAD', text: '自动打开弹幕' }
            };
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
            clearTimeout(this.infoAnimateTimer);
            $('div.bilibili-player-infoHint').stop().css("opacity", 1).show();
            $('span.bilibili-player-infoHint-text')[0].innerHTML = info;
            this.infoAnimateTimer = setTimeout(() => {
                $('div.bilibili-player-infoHint').animate({
                    opacity: 0
                }, 300, () => {
                    $(this).hide();
                });
            }, 1E3);
        },
        init: function () {
            new MutationObserver((mutations, observer) => {
                mutations.forEach((mutation) => {
                    if (mutation.previousSibling && $(mutation.target).attr('stage') === '1') {
                        try {
                            this.h5Player = $("#bofqi").find('.bilibili-player-video video');
                            this.dblclickFullscreen();
                            this.initInfoStyle();
                            this.bindKeydown();
                            this.initSettingHTML();
                            this.autoHandler();
                            console.log('bilibili-quickdo init done');
                        } catch (e) {
                            console.error('bilibili-quickdo init error:', e);
                        }
                    }
                });
            }).observe($('body')[0], {
                childList: true,
                subtree: true,
            });
        }
    };
    bilibiliQuickDo.init();
})();