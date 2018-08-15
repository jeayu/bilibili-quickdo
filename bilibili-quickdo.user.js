// ==UserScript==
// @name         bilibili  H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.9.4
// @description  自动化设置,回车快速发弹幕、双击全屏,'+','-'调节播放速度、f键全屏、w键网页全屏、p键暂停/播放、d键开/关弹幕、y键关/开灯、I键、O键左右旋转等
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
v0.9.4 更新：
新增自动网页全屏、自动宽屏、统一弹幕颜色、播放完自动关灯设置

历史更新：
https://github.com/jeayu/bilibili-quickdo/blob/master/README.md#更新历史
 */

(function () {
    'use strict';

    var bilibiliQuickDo = {
        h5Player: null,
        infoAnimateTimer: null,
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
                'mirror': 'j',
                'danmuTop': 't',
                'danmuBottom': 'b',
                'danmuScroll': 's',
                'danmuPrevent': 'c',
                'rotateRight': 'o',
                'rotateLeft': 'i',
                'lightOff': 'y',
            },
            auto: {
                'switch': 1, //总开关 1开启 0关闭
                'play': 1, //1开启 0关闭
                'fullscreen': 1, //1全屏 0关闭
                'webFullscreen': 0,//1开启 0关闭
                'widescreen': 0,//1开启 0关闭
                'danmu': 1, //1开启 0关闭
                'jump': 1, //1全屏 0关闭
                'lightOff': 0, //1开启 0关闭
                'danmuColor': 0,
                'lightOn': 0,
            },
        },
        dblclickFullscreen: function () {
            player.addEventListener('dblclick', () => {
                this.keyHandler(this.getKeyCode('fullscreen'));
            });
        },
        initInfoStyle: function () {
            if ($('.bilibili-player-infoHint')[0]) {
                return;
            }
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
            if ($(document).data('events').keydown) {
                return;
            }
            $(document).keydown((e) => {
                if ($("input:focus, textarea:focus").length > 0) {
                    this.pushDanmuHandler(e.keyCode);
                } else {
                    if (!e.ctrlKey && !e.shiftKey) {
                        this.keyHandler(e.keyCode);
                    }
                }
            });
        },
        keyHandler: function (keyCode) {
            var h5Player = this.h5Player[0];
            var danmuOpt;
            var newDanmuSetting = $('.bilibili-player-video-danmaku-setting');
            var newDanmuBtn = $(".bilibili-player-video-danmaku-switch input");
            var oldDanmuBtn = $('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]');
            if (keyCode === this.getKeyCode('addSpeed') && h5Player.playbackRate < 4) {
                h5Player.playbackRate += 0.25;
                this.showInfoAnimate(h5Player.playbackRate + ' X');
            } else if (keyCode === this.getKeyCode('subSpeed') && h5Player.playbackRate > 0.5) {
                h5Player.playbackRate -= 0.25;
                this.showInfoAnimate(h5Player.playbackRate + ' X');
            } else if (keyCode === this.getKeyCode('rotateRight')) {
                this.h5PlayerRotate(1);
            } else if (keyCode === this.getKeyCode('rotateLeft')) {
                this.h5PlayerRotate(-1);
            } else if (keyCode === this.getKeyCode('fullscreen')) {
                $('.bilibili-player-video-btn-fullscreen').click();
                if ($('.bilibili-player-video-btn-setting-panel-others-content-lightoff input')[0]) {
                    $('body').hasClass('player-mode-blackmask')
                    ? $('#heimu').css('display', 'block')
                    : $('#heimu').css('display', '');
                }
            } else if (keyCode === this.getKeyCode('webFullscreen')) {
                $('.bilibili-player-video-web-fullscreen').click();
            } else if (keyCode === this.getKeyCode('widescreen')) {
                $('.bilibili-player-video-btn-widescreen').click();
            } else if (keyCode === this.getKeyCode('danmu')) {
                if (newDanmuBtn[0]) {
                    newDanmuBtn.mouseover();
                    this.showInfoAnimate($('.choose_danmaku').text());
                    newDanmuBtn.click().mouseout();
                } else {
                    oldDanmuBtn.mouseover().click().mouseout();
                    this.showInfoAnimate(oldDanmuBtn.attr('data-text'));
                }
            } else if (keyCode === this.getKeyCode('danmuTop')) {
                let opt = oldDanmuBtn[0] ? oldDanmuBtn : newDanmuSetting;
                danmuOpt = opt.mouseover().mouseout().find('div[ftype="top"]');
            } else if (keyCode === this.getKeyCode('danmuBottom')) {
                let opt = oldDanmuBtn[0] ? oldDanmuBtn : newDanmuSetting;
                danmuOpt = opt.mouseover().mouseout().find('div[ftype="bottom"]');
            } else if (keyCode === this.getKeyCode('danmuScroll')) {
                let opt = oldDanmuBtn[0] ? oldDanmuBtn : newDanmuSetting;
                danmuOpt = opt.mouseover().mouseout().find('div[ftype="scroll"]');
            } else if (keyCode === this.getKeyCode('danmuPrevent')) {
                let el = oldDanmuBtn.mouseover().mouseout().find('input[name="ctlbar_danmuku_prevent"]').next()[0] ||
                    newDanmuSetting.mouseover().mouseout().find('.bilibili-player-video-danmaku-setting-left-preventshade-box input')[0];
                let e = $(el).click().mouseout();
                let text = e.text().length > 0 ? e.text() : e.next().text();
                if (e.attr('data-pressed') === 'true' || e.attr("checked")) {
                    this.showInfoAnimate(`开启${text}`);
                } else {
                    this.showInfoAnimate(`关闭${text}`);
                }
            } else if (keyCode === this.getKeyCode('playAndPause')) {
                $('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
            } else if (keyCode === this.getKeyCode('pushDanmu')) {
                this.pushDanmuHandler(keyCode);
            } else if (keyCode === this.getKeyCode('mirror')) {
                if (this.getTransformCss(this.h5Player) != "none") {
                    this.setH5PlayerRransform("");
                } else {
                    this.setH5PlayerRransform("rotateY(180deg)");
                }
            } else if (keyCode === this.getKeyCode('lightOff')) {
                if (!$('.bilibili-player-video-btn-setting-panel-others-content-lightoff input').click()[0]) {
                    if ($('#heimu').css('display') === undefined) {
                        $('body').append('<div id="heimu" style="display: block;"></div>');
                        $('#bilibiliPlayer').addClass('mode-light-off');
                    } else if ($('#heimu').css('display') === 'block') {
                        $('#heimu').css('display', '')
                        $('#bilibiliPlayer').removeClass('mode-light-off');
                    } else {
                        $('#heimu').css('display', 'block')
                        $('#bilibiliPlayer').addClass('mode-light-off');
                    }
                }
            } else if (keyCode >= this.keyCode['0'] && keyCode <= this.keyCode['9']) {
               h5Player.currentTime = h5Player.duration / 10 * (keyCode - this.keyCode['0']);
            } else {
                this.partHandler(keyCode);
            }
            if (danmuOpt) {
                danmuOpt.click().mouseout();
                if (danmuOpt.hasClass('disabled')) {
                    this.showInfoAnimate(`关闭${danmuOpt.text()}`);
                } else {
                    this.showInfoAnimate(`开启${danmuOpt.text()}`);
                }
            }
        },
        autoHandler: function () {
            var config = this.config.auto;
            if (config.switch === 0) {
                return;
            }
            var h5Player = this.h5Player[0];
            var bilibiliPlayer = $('#bilibiliPlayer');
            if (GM_getValue('lightOff') === 1 && $('#heimu').css('display') !== 'block') {
                this.keyHandler(this.getKeyCode('lightOff'));
            }
            if (GM_getValue('fullscreen') === 1 && !player.isFullScreen()) {
                // TODO 新版直接fullscreen有点问题
                this.keyHandler(this.getKeyCode('webFullscreen'));
                this.keyHandler(this.getKeyCode('fullscreen'));
            } else if (GM_getValue('webFullscreen') === 1 && !bilibiliPlayer.hasClass('mode-webfullscreen')) {
                this.keyHandler(this.getKeyCode('webFullscreen'));
            } else if (GM_getValue('widescreen') === 1 && !bilibiliPlayer.hasClass('mode-widescreen')) {
                this.keyHandler(this.getKeyCode('widescreen'));
            }
            if (GM_getValue('playAndPause') === 1 && h5Player.paused) {
                h5Player.play();
            }
            if (GM_getValue('danmu') === 0) {
                this.keyHandler(this.getKeyCode('danmu'));
            }
            if (GM_getValue('jump') === 1) {
                $('.bilibili-player-video-toast-item-jump').click();
            }
        },
        partHandler: function (keyCode) {
            var newPart;
            var cur = $('.episode-item.on')[0] || $('.item.on')[0] || $('#multi_page .cur-list ul li.on')[0];
            if (cur) {
                cur = $(cur);
                if (keyCode === this.getKeyCode('nextPart')) {
                    newPart = cur.next();
                    if (!newPart[0]) {
                        this.triggerSleep($('#multi_page .paging li.on').next()).then(() => $('#multi_page .cur-list ul li:first a')[0].click()).catch(() => {});
                        return;
                    }
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    newPart = cur.prev();
                    if (!newPart[0]) {
                        this.triggerSleep($('#multi_page .paging li.on').prev()).then(() => $('#multi_page .cur-list ul li:last a')[0].click()).catch(() => {});
                        return;
                    }
                }
            }
            if (newPart && newPart[0]) {
                if (newPart.find('a')[0]) {
                    newPart.find('a')[0].click();
                } else {
                    newPart[0].click();
                }
            }
        },
        triggerSleep: function (el, event="click", ms=100) {
            return new Promise((resolve, reject) => {
                if (el && el[0]) {
                    el.trigger(event);
                    setTimeout(resolve, ms);
                } else {
                    reject();
                }
            });
        },
        pushDanmuHandler: function (keyCode) {
            var danmuInput = $('input.bilibili-player-video-danmaku-input');
            if (keyCode !== this.getKeyCode('pushDanmu')
                || danmuInput.css('display') === 'none') {
                return;
            }
            if ($("input.bilibili-player-video-danmaku-input:focus").length <= 0) {
                this.triggerSleep(danmuInput, "mouseover").then(() => {
                    if (player.isFullScreen() && !$('.bilibili-player-video-control-wrap')[0]) {
                        $('div.bilibili-player-video-sendbar').css("opacity", 1).show();
                        $(".bilibili-player-video-sendbar").css('display','flex');
                    }
                    danmuInput.select();
                }).catch(() => {});
            } else {
                this.triggerSleep(danmuInput, "mouseout").then(() => {
                    danmuInput.blur();
                    if (player.isFullScreen() && !$('.bilibili-player-video-control-wrap')[0]) {
                        $('div.bilibili-player-video-sendbar').css("opacity", 0).hide();
                        $(".bilibili-player-video-sendbar").css('display','');
                    }
                }).catch(() => {});
            }
        },
        h5PlayerRotate: function (flag) {
            var h5Player = this.h5Player[0];
            var deg = this.rotationDeg(this.h5Player) + 90 * flag;
            var transform = `rotate(${deg}deg)`;
            if (deg == 0 || deg == 180 * flag) {
                transform += ` scale(1)`;
            } else {
                transform += ` scale(${h5Player.videoHeight / h5Player.videoWidth})`;
            }
            this.setH5PlayerRransform(transform);
        },
        setH5PlayerRransform: function (transform) {
            this.h5Player.css("-webkit-transform", transform);
            this.h5Player.css("-moz-transform", transform);
            this.h5Player.css("-ms-transform", transform);
            this.h5Player.css("-o-transform", transform);
            this.h5Player.css("transform", transform);
        },
        getTransformCss: function (e) {
            return e.css("-webkit-transform") || e.css("-moz-transform") || e.css("-ms-transform") || e.css("-o-transform") || 'none';
        },
        rotationDeg: function (e) {
            var transformCss = this.getTransformCss(e);
            var matrix = transformCss.match('matrix\\((.*)\\)');
            if (matrix) {
                matrix = matrix[1].split(',');
                if (matrix) {
                    let rad = Math.atan2(matrix[1], matrix[0]);
                    return parseFloat((rad * 180 / Math.PI).toFixed(1));
                }
            }
            return 0;
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
                fullscreen: { checkboxId: 'checkboxAF', text: '自动全屏' , contention:['webFullscreen', 'widescreen'] },
                webFullscreen: { checkboxId: 'checkboxAWF', text: '自动网页全屏' , contention:['fullscreen', 'widescreen'] },
                widescreen: { checkboxId: 'checkboxAW', text: '自动宽屏' , contention:['webFullscreen', 'fullscreen'] },
                danmu: { checkboxId: 'checkboxAD', text: '自动打开弹幕' },
                jump: { checkboxId: 'checkboxAJ', text: '自动转跳' },
                lightOff: { checkboxId: 'checkboxALOFF', text: '自动关灯' },
                danmuColor: { checkboxId: 'checkboxDMC', text: '统一弹幕颜色' },
                lightOn: { checkboxId: 'checkboxALON', text: '播放结束自动开灯' },
            };
            if($('.bilibili-player-video-btn-setting').mouseover()[0]) {
                for (let key in config) {
                    let value = config[key];
                    $('.bilibili-player-video-btn-setting-panel-panel-others').append(this.getNewSettingHTML(value.checkboxId, value.text));
                    if (GM_getValue(key) === 1) {
                        $(`#${value.checkboxId}`).click();
                    } else if (GM_getValue(key) !== 0) {
                        GM_setValue(key, this.config.auto[key]);
                    }
                    $(`#${value.checkboxId}`).click(function () {
                        let gmvalue = GM_getValue(key) === 1 ? 0 : 1;
                        GM_setValue(key, gmvalue);
                        if (gmvalue === 1) {
                            if (config[key].contention) {
                                config[key].contention.forEach((k,i) => {
                                    if (GM_getValue(k) === 1) {
                                        let checkboxId = config[k].checkboxId;
                                        $(`#${checkboxId}`).click();
                                    }
                                });
                            }
                        }
                    });
                }
                $('.bilibili-player-video-btn-setting').mouseout();
                $('.bilibili-player-video-control .bilibili-player-video-btn-setting-panel').css('height', 'auto');
            } else {
                $('.bilibili-player-setting-btn').click();
                for (let key in config) {
                    let value = config[key];
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
                        let gmvalue = GM_getValue(key) === 1 ? 0 : 1;
                        GM_setValue(key, gmvalue);
                        if (gmvalue === 1) {
                            $(this).next().addClass('bpui-state-active');
                            if (config[key].contention) {
                                config[key].contention.forEach((k,i) => {
                                    if (GM_getValue(k) === 1) {
                                        let checkboxId = config[k].checkboxId;
                                        $(`#${checkboxId}`).click();
                                    }
                                });
                            }
                        } else {
                            $(this).next().removeClass('bpui-state-active');
                        }
                    });
                }
                $('i.bilibili-player-iconfont.bilibili-player-panel-back.icon-close:first').click();
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
        getNewSettingHTML: function (checkboxId, text) {
            var html = `
            <div class="bilibili-player-video-btn-setting-panel-others-content">
                <div class="bilibili-player-fl bui bui-checkbox bui-dark">
                    <input id="${checkboxId}" class="bui-checkbox-input" type="checkbox">
                    <label class="bui-checkbox-label">
                        <span class="bui-checkbox-icon bui-checkbox-icon-default">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path d="M8 6c-1.104 0-2 0.896-2 2v16c0 1.104 0.896 2 2 2h16c1.104 0 2-0.896 2-2v-16c0-1.104-0.896-2-2-2h-16zM8 4h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4h-16c-2.21 0-4-1.79-4-4v-16c0-2.21 1.79-4 4-4z"></path>
                            </svg>
                            </span>
                                <span class="bui-checkbox-icon bui-checkbox-icon-selected">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                        <path d="M13 18.25l-1.8-1.8c-0.6-0.6-1.65-0.6-2.25 0s-0.6 1.5 0 2.25l2.85 2.85c0.318 0.318 0.762 0.468 1.2 0.448 0.438 0.020 0.882-0.13 1.2-0.448l8.85-8.85c0.6-0.6 0.6-1.65 0-2.25s-1.65-0.6-2.25 0l-7.8 7.8zM8 4h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4h-16c-2.21 0-4-1.79-4-4v-16c0-2.21 1.79-4 4-4z">
                                        </path>
                                    </svg>
                            </span>
                        <span class="bui-checkbox-name">${text}</span>
                    </label>
                </div>
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
        danmuDIY: function(danmu) {
            // 挖了一个坑
            if (danmu && danmu[0]) {
                if (GM_getValue('danmuColor') === 1 ) {
                    let danmuColor = $('.bilibili-player-color-picker-inline-color-current').css('background-color')
                    || $('.bilibili-player-color-picker-current-color').css('background-color') || 'rgb(255, 255, 255)';
                    danmu.css('color',danmuColor);
                }
            }
        },
        init: function () {
            new MutationObserver((mutations, observer) => {
                mutations.forEach((mutation) => {
                    let danmu;
                    let target = $(mutation.target);
                    if (mutation.previousSibling && target.attr('stage') === '1') {
                        try {
                            this.h5Player = $('#bofqi .bilibili-player-video video');
                            this.dblclickFullscreen();
                            this.initInfoStyle();
                            this.bindKeydown();
                            this.initSettingHTML();
                            this.autoHandler();
                            console.log('bilibili-quickdo init done');

                        } catch (e) {
                            console.error('bilibili-quickdo init error:', e);
                        }
                    } else if (target.hasClass('bilibili-player-video')) {
                        this.h5Player = $('#bofqi .bilibili-player-video video');
                    } else if (target.hasClass('bilibili-player-video-danmaku')) {
                        danmu = $(mutation.addedNodes[0] || mutation.nextSibling || mutation.removedNodes || mutation.removedNodes);
                    }  else if (target.hasClass('bilibili-danmaku') && mutation.addedNodes.length > 0) {
                        danmu = target;
                    } else if (GM_getValue('lightOn') === 1 && target.hasClass('bilibili-player-video-time-now')
                               && target.text() != '00:00' && target.text() === $('.bilibili-player-video-time-total').text()){
                        if ($('#heimu').css('display') === 'block') {
                            this.keyHandler(this.getKeyCode('lightOff'));
                        }
                    }
                    this.danmuDIY(danmu);
                });
            }).observe($('body')[0], {
                childList: true,
                subtree: true,
            });
        }
    };
    bilibiliQuickDo.init();
})();