// ==UserScript==
// @name         bilibili  H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.9.6.8
// @description  自动化设置,回车快速发弹幕、双击全屏,'+','-'调节播放速度、z键下载、f键全屏、w键网页全屏、p键暂停/播放、d键开/关弹幕、y键关/开灯、I键、O键左右旋转等
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
v0.9.6 更新：
新增x键空降时间点(.号分割);新增自动选择最高画质

历史更新：
https://github.com/jeayu/bilibili-quickdo/blob/master/README.md#更新历史
 */

(function () {
    'use strict';
    const q = function (selector) {
        let nodes = [];
        if (typeof selector === 'string') {
            const elements = document.querySelectorAll(selector)
            for (let i = 0; i < elements.length; i++) {
                nodes[i] = elements[i];
            }
            nodes.length = elements.length;
            nodes.selectorStr = selector;
        } else if (selector instanceof Node) {
            nodes = {
                0: selector,
                length: 1,
                selectorStr: '',
            }
        }
        nodes.click = function (index = 0) {
            nodes.length > index && nodes[index].click();
            return this;
        }
        nodes.addClass = function (classes, index = 0) {
            nodes.length > index && nodes[index].classList.add(classes);
            return this;
        }
        nodes.removeClass = function (classes, index = 0) {
            nodes.length > index && nodes[index].classList.remove(classes);
            return this;
        }
        nodes.text = function (index = 0) {
            return nodes[index].textContent;
        }
        nodes.css = function (name, value, index = 0) {
            nodes.length > index && nodes[index].style.setProperty(name, value);
            return this;
        }
        nodes.getCss = function (name, index = 0) {
            return nodes.length > index && nodes[index].ownerDocument.defaultView.getComputedStyle(nodes[index], null).getPropertyValue(name);
        }
        nodes.mouseover = function (index = 0) {
            return this.trigger('mouseover', index);
        }
        nodes.mouseout = function (index = 0) {
            return this.trigger('mouseout', index);
        }
        nodes.attr = function (name, index = 0) {
            const result = nodes.length > index ? nodes[index].attributes[name] : undefined;
            return result && result.value;
        }
        nodes.hasClass = function (className, index = 0) {
            return nodes.length > index && nodes[index].className.match && nodes[index].className.match(new RegExp(`(\\s|^)${className}(\\s|$)`));
        }
        nodes.append = function (text, index = 0) {
            nodes[index].insertAdjacentHTML("beforeend", text);
            return this;
        }
        nodes.find = function (name) {
            return q(`${this.selectorStr} ${name}`);
        }
        nodes.toggleClass = function (className, flag, index = 0) {
            return flag ? this.addClass(className, index) : this.removeClass(className, index);
        }
        nodes.next = function (index = 0) {
            return nodes.length > index && nodes[index].nextElementSibling ? q(nodes[index].nextElementSibling) : {0: undefined};
        }
        nodes.prev = function (index = 0) {
            return nodes.length > index && nodes[index].previousElementSibling ? q(nodes[index].previousElementSibling) : {0: undefined};
        }
        nodes.trigger = function (event, index = 0) {
            if (nodes.length > index) {
                const evt = document.createEvent('Event');
                evt.initEvent(event, true, true);
                nodes[index].dispatchEvent(evt);
            }
            return this;
        }
        nodes.last = function () {
            return q(nodes[nodes.length - 1]);
        }
        nodes.on = function (event, fn, index = 0) {
            nodes.length > index && nodes[index].addEventListener(event, fn);
            return this;
        }
        nodes.select = function (index = 0) {
            nodes.length > index && nodes[index].select();
            return this;
        }
        nodes.blur = function (index = 0) {
            nodes.length > index && nodes[index].blur();
            return this;
        }
        nodes.val = function (value, index = 0) {
            if (value) {
                nodes[index].value = value;
                return this;
            }
            return nodes[index].value;
        }
        return nodes;
    }
    const [ON, OFF] = [1, 0];
    const [FULLSCREEN, WEBFULLSCREEN, WIDESCREEN] = [3, 2, 1];
    const bilibiliQuickDo = {
        h5Player: undefined,
        infoAnimateTimer: undefined,
        keydownFn: undefined,
        reload: true,
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
            'z': 90,
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,
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
                'download': 'z',
                'seek': 'x',
            },
            checkbox: {
                playAndPause: { text: '自动播放', status: ON, ban:[] },
                reloadPart: { text: '换P重新加载', status: OFF, ban:[] },
                fullscreen: { text: '自动全屏', status: OFF, ban:['webFullscreen', 'widescreen'] },
                webFullscreen: { text: '自动网页全屏', status: ON, ban:['fullscreen', 'widescreen'] },
                widescreen: { text: '自动宽屏', status: OFF, ban:['webFullscreen', 'fullscreen'] },
                danmu: { text: '自动打开弹幕', status: ON, ban:[] },
                bangumiDanmuOFF: { text: '番剧自动关弹幕', status: OFF, ban:[] },
                jump: { text: '自动转跳', status: ON, ban:[] },
                lightOff: { text: '自动关灯', status: OFF, ban:[] },
                danmuColor: { text: '统一弹幕颜色', status: OFF, ban:[] },
                lightOn: { text: '播放结束自动开灯', status: OFF, ban:[] },
                exitScreen: { text: '播放结束还原屏幕', status: OFF, ban:[] },
                highQuality: { text: '自动最高画质', status: OFF, ban:['vipHighQuality'] },
                vipHighQuality: { text: '自动最高画质(大会员使用)', status: OFF, ban:['highQuality'] },
            },
        },
        dblclickFullscreen: function () {
            player.addEventListener('dblclick', () => {
                this.keyHandler(this.getKeyCode('fullscreen'));
            });
        },
        initInfoStyle: function () {
            if (q('.bilibili-player-infoHint')[0]) {
                return;
            }
            const cssArr = [
                '.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{width: 160px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -95px; margin-top: -36px;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 122px; height: 32px; line-height: 32px; padding: 9px 7px 9px 7px; font-size: 20px; margin-left: -70px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}',
                '.bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint-text{vertical-align: top; display: inline-block; overflow: visible; text-align: center;}'
            ];
            const html = '<div class="bilibili-player-infoHint" style="opacity: 0; display: none;"><span class="bilibili-player-infoHint-text">1</span></div>';
            this.addStyle(cssArr);
            q('div.bilibili-player-video-wrap').append(html);
        },
        getKeyCode: function (type) {
            return this.keyCode[this.config.quickDo[type]];
        },
        bindKeydown: function () {
            this.keydownFn = this.keydownFn || (e=> {
                if (!q('input:focus, textarea:focus').length) {
                    if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
                        this.keyHandler(e.keyCode) && e.preventDefault();
                    }
                }
            });
            q(document).on('keydown', this.keydownFn);
            q('input.bilibili-player-video-danmaku-input').on('keydown', e => {
                this.pushDanmuHandler(e.keyCode);
            });
            q('input.bilibili-player-video-time-seek').on('keydown', e => {
                const input = q('input.bilibili-player-video-time-seek');
                const isNum = e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105;
                const isDot = e.keyCode == 110 || e.keyCode == 190;
                const isDelete = e.keyCode == 8 || e.keyCode == 46;
                const isDirection = e.keyCode == this.keyCode.left || e.keyCode == this.keyCode.right;
                input.val(input.val().replace('.', ':'));
                if (e.keyCode == this.keyCode.enter) {
                    input.mouseout();
                    this.oldControlHide() || this.newControlHide();
                    setTimeout(() => this.showInfoAnimate(q('.bilibili-player-video-time-now').text()), 200);
                } else if (!isNum && !isDot && !isDelete && !isDirection) {
                    if (e.keyCode == this.getKeyCode('seek')) {
                        input.css("display", "none");
                        q('.bilibili-player-video-time-wrap').css("display", "block");
                        this.oldControlHide() || this.newControlHide();
                    } else {
                        e.preventDefault();
                    }
                }
            });
            this.dblclickFullscreen();
        },
        keyHandler: function (keyCode) {
            const h5Player = this.h5Player[0];
            let danmuOpt;
            const newDanmuSetting = q('.bilibili-player-video-danmaku-setting');
            const newDanmuBtn = q('.bilibili-player-video-danmaku-switch input');
            const oldDanmuBtn = q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]');
            if (keyCode === this.getKeyCode('addSpeed') && h5Player.playbackRate < 4) {
                h5Player.playbackRate += 0.25;
                this.showInfoAnimate(`${h5Player.playbackRate} X`);
            } else if (keyCode === this.getKeyCode('subSpeed') && h5Player.playbackRate > 0.5) {
                h5Player.playbackRate -= 0.25;
                this.showInfoAnimate(`${h5Player.playbackRate} X`);
            } else if (keyCode === this.getKeyCode('rotateRight')) {
                this.h5PlayerRotate(1);
            } else if (keyCode === this.getKeyCode('rotateLeft')) {
                this.h5PlayerRotate(-1);
            } else if (keyCode === this.getKeyCode('fullscreen')) {
                q('.bilibili-player-video-btn-fullscreen').click();
                if (q('.bilibili-player-video-btn-setting-panel-others-content-lightoff input')[0]) {
                    q('body').hasClass('player-mode-blackmask')
                    ? q('#heimu').css('display', 'block')
                    : q('#heimu').css('display', '');
                }
            } else if (keyCode === this.getKeyCode('webFullscreen')) {
                q('.bilibili-player-video-web-fullscreen').click();
            } else if (keyCode === this.getKeyCode('widescreen')) {
                q('.bilibili-player-video-btn-widescreen').click();
            } else if (keyCode === this.getKeyCode('danmu')) {
                if (newDanmuBtn[0]) {
                    newDanmuBtn.mouseover();
                    this.showInfoAnimate(q('.choose_danmaku').text());
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
                const el = oldDanmuBtn.mouseover().mouseout().find('input[name="ctlbar_danmuku_prevent"]').next()[0] ||
                    newDanmuSetting.mouseover().mouseout().find('.bilibili-player-video-danmaku-setting-left-preventshade-box input')[0];
                const e = q(el).click().mouseout();
                const text = e.text().length > 0 ? e.text() : e.next().text();
                if (e.attr('data-pressed') === 'true' || e.attr('checked')) {
                    this.showInfoAnimate(`开启${text}`);
                } else {
                    this.showInfoAnimate(`关闭${text}`);
                }
            } else if (keyCode === this.getKeyCode('playAndPause')) {
                q('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
            } else if (keyCode === this.getKeyCode('pushDanmu')) {
                this.pushDanmuHandler(keyCode);
            } else if (keyCode === this.getKeyCode('mirror')) {
                if (this.getTransformCss(this.h5Player) != 'none') {
                    this.setH5PlayerRransform('');
                } else {
                    this.setH5PlayerRransform('rotateY(180deg)');
                }
            } else if (keyCode === this.getKeyCode('lightOff')) {
                if (!q('.bilibili-player-video-btn-setting-panel-others-content-lightoff input').click()[0]) {
                    if (!q('#heimu').getCss('display')) {
                        q('body').append('<div id="heimu" style="display: block;"></div>');
                    } else if (q('#heimu').getCss('display') === 'block') {
                        q('#heimu').css('display', '')
                    } else {
                        q('#heimu').css('display', 'block')
                    }
                    q('#bilibiliPlayer').toggleClass('mode-light-off', q('#heimu').getCss('display') === 'block');
                }
            } else if (keyCode >= this.keyCode['0'] && keyCode <= this.keyCode['9']) {
               this.setVideoCurrentTime(h5Player.duration / 10 * (keyCode - this.keyCode['0']));
            } else if (keyCode === this.getKeyCode('seek')) {
                this.oldControlShow() ||  this.newControlShow();
                this.triggerSleep(q('.bilibili-player-video-time-wrap').mouseover())
                    .then(() => q('input.bilibili-player-video-time-seek').select()).catch(() => {});
                return true;
            } else if (keyCode === this.getKeyCode('download')) {
                window.open(player.getPlayurl());
            } else if (keyCode === this.getKeyCode('nextPart') || keyCode === this.getKeyCode('prevPart')) {
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
            this.oldControlHide();
            return false;
        },
        autoHandler: function () {
            if (GM_getValue('highQuality') === ON || GM_getValue('vipHighQuality') === ON) {
                q('.bilibili-player-video-quality-menu').mouseover().mouseout();
                let btn = q('.bui-select-item');
                btn = !btn[0] ? q('.bpui-selectmenu-list-row') : btn;
                const index = GM_getValue('highQuality') === ON ? btn.findIndex(e => !$(e).find('.bilibili-player-bigvip')[0]) : 0;
                btn.click(index);
            }
            if (GM_getValue('playAndPause') === ON) {
                this.h5Player[0].play();
            }
            if (GM_getValue('jump') === ON) {
                q('.bilibili-player-video-toast-item-jump').click();
            }
            if (GM_getValue('danmu') === OFF || GM_getValue('bangumiDanmuOFF') === ON && window.location.href.indexOf('bangumi') >= 0) {
                this.keyHandler(this.getKeyCode('danmu'));
            }
            this.AutoHandlerForReload();
            this.oldControlHide();
        },
        AutoHandlerForReload: function () {
            if (!this.reload) {
                return;
            }
            const h5Player = this.h5Player[0];
            if (GM_getValue('lightOff') === ON && q('#heimu').getCss('display') !== 'block') {
                this.keyHandler(this.getKeyCode('lightOff'));
            }
            if (GM_getValue('fullscreen') === ON && !player.isFullScreen()) {
                player.mode(FULLSCREEN);
            } else if (GM_getValue('webFullscreen') === ON) {
                player.mode(WEBFULLSCREEN);
            } else if (GM_getValue('widescreen') === ON) {
                player.mode(WIDESCREEN);
            }
        },
        getNewPart: function (keyCode) {
            let newPart;
            let cur = q('.episode-item.on')[0] || q('.item.on')[0] || q('#multi_page .cur-list ul li.on')[0];
            if (cur) {
                cur = q(cur);
                if (keyCode === this.getKeyCode('nextPart')) {
                    newPart = cur.next();
                    if (!newPart[0]) {
                        this.triggerSleep(q('#multi_page .paging li.on').next())
                            .then(() => q('#multi_page .cur-list ul li a').click()).catch(() => {});
                        return;
                    }
                } else if (keyCode === this.getKeyCode('prevPart')) {
                    newPart = cur.prev();
                    if (!newPart[0]) {
                        this.triggerSleep(q('#multi_page .paging li.on').prev())
                            .then(() => q('#multi_page .cur-list ul li a').last().click()).catch(() => {});
                        return;
                    }
                }
            }
            return newPart && newPart[0] ? newPart : undefined;
        },
        partHandler: function (keyCode) {
            const newPart = this.getNewPart(keyCode);
            if (newPart) {
                this.reload = GM_getValue('reloadPart') === ON;
                if (!this.reload) {
                    const index = newPart.hasClass('episode-item') ? q('.episode-item').findIndex(e => e.className.indexOf('on') > 0)  : player.getPlaylistIndex();
                    if (keyCode === this.getKeyCode('nextPart')) {
                        player.next(index + 2);
                    } else {
                        player.next(index);
                    }
                } else if (newPart[0].children && newPart[0].children.length) {
                    newPart[0].children[0].click();
                } else {
                    newPart.click();
                }
            }
            return newPart;
        },
        triggerSleep: function (el, event='click', ms=100) {
            return new Promise((resolve, reject) => {
                if (el && el[0]) {
                    el.trigger(event);
                    setTimeout(resolve, ms);
                } else {
                    reject();
                }
            });
        },
        setVideoCurrentTime: function (time) {
            if (time > -1 && time <= this.h5Player[0].duration) {
                this.h5Player[0].currentTime = time;
                return true;
            }
            return false;
        },
        pushDanmuHandler: function (keyCode) {
            const danmuInput = q('input.bilibili-player-video-danmaku-input');
            if (keyCode !== this.getKeyCode('pushDanmu')
                || danmuInput.getCss('display') === 'none') {
                return;
            }
            if (!q('input.bilibili-player-video-danmaku-input:focus').length) {
                this.triggerSleep(danmuInput, 'mouseover').then(() => {
                    if (player.isFullScreen() && this.isOldControl()) {
                        q('.bilibili-player-video-sendbar').css('opacity', 1).css('display', 'block');
                        q('.bilibili-player-video-sendbar').css('display','flex');
                    } else {
                        this.newControlShow();
                    }
                    danmuInput.select().click();
                }).catch(() => {});
            } else {
                this.triggerSleep(danmuInput, 'mouseout').then(() => {
                    danmuInput.blur();
                    if (player.isFullScreen() && this.isOldControl()) {
                        q('.bilibili-player-video-sendbar').css('opacity', 0).css('display', 'none');
                        q('.bilibili-player-video-sendbar').css('display','');
                    } else {
                        this.newControlHide();
                    }
                    q('.bilibili-player-video-control').click();
                }).catch(() => {});
            }
        },
        isOldControl: function() {
            return !q('.bilibili-player-video-control-wrap')[0];
        },
        oldControlShow: function() {
            return player.isFullScreen() && this.isOldControl() && q('.bilibili-player-video-control').css('opacity', 1);
        },
        oldControlHide: function() {
            return player.isFullScreen() && this.isOldControl() && q('.bilibili-player-video-control').css('opacity', 0);
        },
        newControlShow: function() {
            q('.bilibili-player-area').addClass('video-control-show');
        },
        newControlHide: function() {
            q('.bilibili-player-area').removeClass('video-control-show');
        },
        h5PlayerRotate: function (flag) {
            const h5Player = this.h5Player[0];
            const deg = this.rotationDeg(this.h5Player) + 90 * flag;
            let transform = `rotate(${deg}deg)`;
            if (deg == 0 || deg == 180 * flag) {
                transform += ` scale(1)`;
            } else {
                transform += ` scale(${h5Player.videoHeight / h5Player.videoWidth})`;
            }
            this.setH5PlayerRransform(transform);
        },
        setH5PlayerRransform: function (transform) {
            this.h5Player.css('-webkit-transform', transform);
            this.h5Player.css('-moz-transform', transform);
            this.h5Player.css('-ms-transform', transform);
            this.h5Player.css('-o-transform', transform);
            this.h5Player.css('transform', transform);
        },
        getTransformCss: function (e) {
            return e.getCss('-webkit-transform') || e.getCss('-moz-transform') || e.getCss('-ms-transform') || e.getCss('-o-transform') || 'none';
        },
        rotationDeg: function (e) {
            const transformCss = this.getTransformCss(e);
            let matrix = transformCss.match('matrix\\((.*)\\)');
            if (matrix) {
                matrix = matrix[1].split(',');
                if (matrix) {
                    const rad = Math.atan2(matrix[1], matrix[0]);
                    return parseFloat((rad * 180 / Math.PI).toFixed(1));
                }
            }
            return 0;
        },
        addStyle: function (cssArr) {
            q('head').append(`<style type="text/css">${cssArr.join('')}</style>`);
        },
        initSettingHTML: function () {
            const isNew = q('.bilibili-player-video-btn-setting').mouseover()[0] !== undefined ? true : q('.bilibili-player-setting-btn').click()[0] === undefined;
            for (let [key, { text, status, ban }] of Object.entries(this.config.checkbox)) {
                const checkboxId = `cb-${key}`
                if (isNew) {
                    q('.bilibili-player-video-btn-setting-panel-panel-others').append(this.getNewSettingHTML(checkboxId, text));
                } else {
                    q('.bilibili-player-advopt-wrap').append(this.getSettingHTML(checkboxId, text));
                }
                if (GM_getValue(key) === undefined) {
                    GM_setValue(key, status);
                }
                const checked = GM_getValue(key) === ON;
                checked && isNew ? q(`#${checkboxId}`).click() : q(`#${checkboxId}-lable`).toggleClass('bpui-state-active', checked);
                q(`#${checkboxId}`).on('click', function () {
                    const gmvalue = GM_getValue(key) === ON ? OFF : ON;
                    GM_setValue(key, gmvalue);
                    if (gmvalue === ON) {
                        ban.forEach((k,i) => {
                            if (GM_getValue(k) === ON) {
                                q(`#cb-${k}`).click();
                            }
                        });
                    }
                    if (!isNew) {
                        q(this).next().toggleClass('bpui-state-active', gmvalue === ON);
                    }
                });
            }
            if (isNew) {
                q('.bilibili-player-video-btn-setting').mouseout();
                q('.bilibili-player-video-control .bilibili-player-video-btn-setting-panel').css('height', 'auto');
            } else {
                q('i.bilibili-player-iconfont.bilibili-player-panel-back.icon-close').click();
            }
        },
        getSettingHTML: function (checkboxId, text) {
            return `
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
        },
        getNewSettingHTML: function (checkboxId, text) {
            return `
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
                        <span class="bui-checkbox-name" style="width: 50px;">${text}</span>
                    </label>
                </div>
            </div>`;
        },
        showInfoAnimate: function (info) {
            clearTimeout(this.infoAnimateTimer);
            q('div.bilibili-player-infoHint').css('opacity', 1).css('display', 'block');
            q('span.bilibili-player-infoHint-text')[0].innerHTML = info;
            this.infoAnimateTimer = setTimeout(() => q('div.bilibili-player-infoHint').css('opacity', 0).css('display', 'none'), 1E3);
        },
        danmuDIY: function (danmu) {
            // 挖了一个坑
            if (danmu && danmu[0]) {
                if (GM_getValue('danmuColor') === ON ) {
                    const danmuColor = q('.bui-color-picker-option-active').getCss('background-color') || 'rgb(255, 255, 255)';
                    danmu.css('color',danmuColor);
                }
            }
        },
        init: function () {
            new MutationObserver((mutations, observer) => {
                mutations.forEach(mutation => {
                    let danmu;
                    const target = q(mutation.target);
                    if (mutation.previousSibling && target.attr('stage') === '1') {
                        try {
                            this.h5Player = q('#bofqi .bilibili-player-video video');
                            this.initInfoStyle();
                            this.initSettingHTML();
                            this.autoHandler();
                            this.bindKeydown();
                            console.log('bilibili-quickdo init done');
                        } catch (e) {
                            console.error('bilibili-quickdo init error:', e);
                        }
                    } else if (target.hasClass('bilibili-player-video')) {
                        this.h5Player = q('#bofqi .bilibili-player-video video');
                    } else if (target.hasClass('bilibili-player-video-danmaku')) {
                        danmu = q(mutation.addedNodes[0] || mutation.nextSibling || mutation.removedNodes || mutation.previousSibling);
                    }  else if (target.hasClass('bilibili-danmaku') && mutation.addedNodes.length > 0) {
                        danmu = target;
                    } else if (target.hasClass('bilibili-player-video-time-now')
                               && target.text() != '00:00' && target.text() === q('.bilibili-player-video-time-total').text()) {
                        if (this.partHandler(this.getKeyCode('nextPart'))) {
                            return;
                        }
                        if (GM_getValue('lightOn') === ON && q('#heimu').getCss('display') === 'block') {
                            this.keyHandler(this.getKeyCode('lightOff'));
                        }
                        if (GM_getValue('exitScreen') === ON) {
                            player.mode(0);
                        }
                    }
                    this.danmuDIY(danmu);
                });
            }).observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
    };
    bilibiliQuickDo.init();
})();