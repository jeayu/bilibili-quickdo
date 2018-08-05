// ==UserScript==
// @name         bilibili-H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.9.1
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
v0.9.1 更新：
兼容新版播放页, 新增I，O键左右旋转视频

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
                'mirror': 'j',
                'danmuTop': 't',
                'danmuBottom': 'b',
                'danmuScroll': 's',
                'danmuPrevent': 'c',
                'rotateRight': 'o',
                'rotateLeft': 'i',
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
                    this.keyHandler(e.keyCode);
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
                if (this.h5Player.css("-webkit-transform") != "none") {
                    this.setH5PlayerRransform("");
                } else {
                    this.setH5PlayerRransform("rotateY(180deg)");
                }
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
            if (GM_getValue('fullscreen') === 1 && !player.isFullScreen()) {
                // TODO 新版直接fullscreen有点问题
                this.keyHandler(this.getKeyCode('webFullscreen'));
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
            var cur = $('.episode-item.on');
            if (cur[0]) {
                if (keyCode === this.getKeyCode('nextPart')) {
                    newPart = cur.next();
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    newPart = cur.prev();
                }
                if (newPart && newPart[0]) {
                    newPart.click();
                    return;
                }
            }
            cur = $('.item.on');
            if (cur[0]) {
                if (keyCode === this.getKeyCode('nextPart')) {
                    newPart = cur.next();
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    newPart = cur.prev();
                }
                if (newPart && newPart[0]) {
                    newPart[0].click();
                }

            }
            cur = $('#multi_page .cur-list ul li.on');
            if (cur[0]) {
                if (keyCode === this.getKeyCode('nextPart')) {
                    newPart = cur.next();
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    newPart = cur.prev();
                }
                if (newPart && newPart.find('a')[0]) {
                    newPart.find('a')[0].click();
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
        rotationDeg: function (e) {
            var transformCss = e.css("-webkit-transform") || e.css("-moz-transform") || e.css("-ms-transform") || e.css("-o-transform") || '';
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