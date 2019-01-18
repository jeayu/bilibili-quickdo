// ==UserScript==
// @name         bilibili  H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.9.8.7
// @description  快捷键设置,回车快速发弹幕,双击全屏,自动选择最高清画质、播放、全屏、关闭弹幕、自动转跳和自动关灯等
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
v0.9.8 更新：
更新快捷键设置页面

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
            return nodes.length > index && nodes[index].textContent || '';
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
        nodes.append = function (text, where = 'beforeend', index = 0) {
            nodes[index].insertAdjacentHTML(where, text);
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
        nodes.offsetTop = function (index = 0) {
            if (nodes.length <= index) {
                return 0;
            }
            let n = nodes[index];
            let top = 0;
            while (n = n.offsetParent) {
                top += n.offsetTop;
            }
            return top;
        }
        return nodes;
    }
    const [ON, OFF] = [1, 0];
    const [FULLSCREEN, WEBFULLSCREEN, WIDESCREEN, DEFAULT] = [3, 2, 1, 0];
    const bilibiliQuickDo = {
        h5Player: undefined,
        hintTimer: undefined,
        keydownFn: undefined,
        reload: true,
        isNew: false,
        isBangumi: false,
        repeatStart: undefined,
        repeatEnd: undefined,
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
            'space': 32,
            '[': 219,
            ']': 221,
            '\\': 220,
            ';': 186,
            "'": 222,
            ',': 188,
            '.': 190,
            '/': 191,
        },
        config: {
            quickDo: {
                fullscreen: { value: 'f', text: '全屏', },
                webFullscreen: { value: 'w', text: '网页全屏', },
                widescreen: { value: 'q', text: '宽屏', },
                addSpeed: { value: ']', text: '速度+0.25', },
                subSpeed: { value: '[', text: '速度-0.25', },
                resetSpeed:  { value: '\\', text: '重置速度', },
                danmu: { value: 'd', text: '弹幕', },
                playAndPause: { value: 'p', text: '暂停播放', },
                nextPart: { value: 'l', text: '下一P', },
                prevPart: { value: 'k', text: '上一P', },
                showDanmuInput: { value: 'enter', text: '发弹幕', },
                mirror: { value: 'j', text: '镜像', },
                danmuTop: { value: 't', text: '顶部弹幕', },
                danmuBottom: { value: 'b', text: '底部弹幕', },
                danmuScroll: { value: 's', text: '滚动弹幕', },
                danmuPrevent: { value: 'c', text: '防挡弹幕', },
                rotateRight: { value: 'o', text: '向右旋转', },
                rotateLeft: { value: 'i', text: '向左旋转', },
                lightOff: { value: 'y', text: '灯', },
                download: { value: 'z', text: '下载', },
                seek: { value: 'x', text: '空降', },
                mute: { value: 'm', text: '静音', },
                jump: { value: '', text: '跳转', },
                scroll2Top: { value: '', text: '回到顶部', },
                jumpContent: { value: '', text: '跳过鸣谢', },
                playerSetOnTop: { value: '', text: '播放器置顶', },
                setRepeatStart: { value: '', text: '循环起点', },
                setRepeatEnd: { value: '', text: '循环终点', },
                resetRepeat: { value: '', text: '清除循环点', },
            },
            checkboxes: {
                checkbox: {
                    options: {
                        dblclick: { text: '双击全屏', status: ON, ban:[] },
                        hint: { text: '快捷键提示', status: ON, ban:[] },
                        autoHint: { text: '自动操作提示', status: ON, ban:[], tips: '自动关闭弹幕时的提示' },
                        reloadPart: { text: '换P重新加载', status: OFF, ban:[], tips: '脚本已自动下一P.</br>勾选: 屏幕回到自动设置的模式.</br>不勾选: 屏幕和上一P一样,</br>番剧下一P不是续集换P会无效.' },
                        danmuColor: { text: '统一弹幕颜色', status: OFF, ban:[], fn: 'initDanmuStyle' },
                        hideSenderBar: { text: '隐藏弹幕栏', status: OFF, ban:[], fn: 'hideOrShowSenderBar', tips: '发弹幕快捷键可显示' },
                        widescreenScroll2Top: { text: '宽屏时回到顶部', status: OFF, ban:['widescreenSetOnTop'], fn: 'setWidescreenPos' },
                        widescreenSetOnTop: { text: '宽屏时播放器置顶部', status: OFF, ban:['widescreenScroll2Top'], fn: 'setWidescreenPos' },
                        globalHotKey: { text: '默认快捷键设置全局', status: OFF, ban:[], tips: '上下左右空格不会滚动页面' },
                    },
                    btn: '常规设置',
                },
                startCheckbox: {
                    options: {
                        playAndPause: { text: '自动播放', status: ON, ban:[] },
                        jump: { text: '自动转跳', status: ON, ban:[], tips: '跳转另一集无效, 配合跳转快捷键用'},
                        lightOff: { text: '自动关灯', status: OFF, ban:[] },
                        fullscreen: { text: '自动全屏', status: OFF, ban:['webFullscreen', 'widescreen'], tips: '浏览器限制不能真全屏' },
                        webFullscreen: { text: '自动网页全屏', status: ON, ban:['fullscreen', 'widescreen'] },
                        widescreen: { text: '自动宽屏', status: OFF, ban:['webFullscreen', 'fullscreen'] },
                        danmuOFF: { text: '自动关闭弹幕', status: OFF, ban:[] },
                        bangumiDanmuOFF: { text: '番剧自动关弹幕', status: OFF, ban:[] },
                        highQuality: { text: '自动最高画质', status: OFF, ban:['vipHighQuality'] },
                        vipHighQuality: { text: '自动最高画质(大会员使用)', status: OFF, ban:['highQuality'] },
                    },
                    btn: '播放前自动设置',
                },
                endCheckbox: {
                    options: {
                        lightOn: { text: '播放结束自动开灯', status: OFF, ban:[], tips: '还有下一P不触发' },
                        exitScreen: { text: '播放结束还原屏幕', status: OFF, ban:['exit2WideScreen'], tips: '还有下一P不触发' },
                        exit2WideScreen: { text: '播放结束还原宽屏', status: OFF, ban:['exitScreen'], tips: '还有下一P不触发' },
                        autoJumpContent: { text: '跳过充电鸣谢', status: OFF, ban:[] },
                    },
                    btn: '播放结束自动设置',
                },
            },
        },
        bindPlayerEvent: function () {
            player.addEventListener('dblclick', () => GM_getValue('dblclick') === ON && this.fullscreen());
            player.addEventListener('video_resize', () => {
                this.hideSenderBar();
                setTimeout(() => this.isWidescreen() && !q('.mini-player')[0] && this.setWidescreenPos(), this.isNew ? 0 : 100);
            });
            player.addEventListener('video_media_ended', () => this.videoEndedHander());
        },
        initHintStyle: function () {
            if (q('.bilibili-player-infoHint')[0]) {
                return;
            }
            const css = `
                .bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{width: 160px; height: 42px; line-height: 42px; padding: 15px 18px 15px 12px; font-size: 28px; margin-left: -95px; margin-top: -36px;}
                .bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint{position: absolute; top: 50%; left: 50%; z-index: 30; width: 122px; height: 32px; line-height: 32px; padding: 9px 7px 9px 7px; font-size: 20px; margin-left: -70px; margin-top: -25px; border-radius: 4px; background: rgba(255,255,255,.8); color: #000; text-align: center;}
                .bilibili-player .bilibili-player-area .bilibili-player-video-wrap .bilibili-player-infoHint-text{vertical-align: top; display: inline-block; overflow: visible; text-align: center;}
            `;
            const html = '<div class="bilibili-player-infoHint" style="opacity: 0; display: none;"><span class="bilibili-player-infoHint-text">1</span></div>';
            this.addStyle(css);
            q('div.bilibili-player-video-wrap').append(html);
        },
        getKeyCode: function (type) {
            return this.keyCode[this.getQuickDoKey(type)];
        },
        getQuickDoKey: function (key) {
            return GM_getValue(`quickDo-${key}`);
        },
        saveQuickDoKey: function (key, value) {
            GM_setValue(`quickDo-${key}`, value.toLowerCase());
        },
        bindKeydown: function () {
            this.keydownFn = this.keydownFn || (e=> !q('input:focus, textarea:focus').length && this.keyHandler(e));
            q(document).on('keydown', this.keydownFn);
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
                    setTimeout(() => this.showHint(q('.bilibili-player-video-time-now').text()), 200);
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
            this.bindPlayerEvent();
        },
        bindDanmuInputKeydown: function () {
            q('input.bilibili-player-video-danmaku-input').on('keydown', e => {
                e.keyCode === this.keyCode.enter && this.hideDanmuInput();
            });
        },
        addSpeed: function () {
            if (this.h5Player[0].playbackRate < 4) {
                this.h5Player[0].playbackRate += 0.25;
                this.showHint(`${this.h5Player[0].playbackRate} X`);
            }
        },
        subSpeed: function () {
            if (this.h5Player[0].playbackRate > 0.5) {
                this.h5Player[0].playbackRate -= 0.25;
                this.showHint(`${this.h5Player[0].playbackRate} X`);
            }
        },
        resetSpeed: function () {
            this.h5Player[0].playbackRate = 1;
            this.showHint(`${this.h5Player[0].playbackRate} X`);
        },
        fullscreen: function () {
            q('.bilibili-player-video-btn-fullscreen').click();
            if (q('.bilibili-player-video-btn-setting-panel-others-content-lightoff input')[0]) {
                q('body').hasClass('player-mode-blackmask')
                ? q('#heimu').css('display', 'block')
                : q('#heimu').css('display', '');
            }
        },
        isFullScreen: function () {
            return q('#bilibiliPlayer').hasClass('mode-fullscreen');
        },
        isWebFullscreen: function () {
            return q('#bilibiliPlayer').hasClass('mode-webfullscreen');
        },
        isWidescreen: function () {
            return q('#bilibiliPlayer').hasClass('mode-widescreen');
        },
        webFullscreen: function () {
            this.isFullScreen() ? this.playerMode(WEBFULLSCREEN) : q('.bilibili-player-video-web-fullscreen').click();
        },
        widescreen: function () {
            this.isFullScreen() ? this.playerMode(WIDESCREEN) : q('.bilibili-player-video-btn-widescreen').click();
            this.setWidescreenPos();
        },
        playerMode: function (mode) {
            player.mode(mode);
            mode === WIDESCREEN && setTimeout(() => this.setWidescreenPos(), 100) ;
        },
        setWidescreenPos: function () {
            if (!this.isWidescreen()) {
                return;
            }
            GM_getValue('widescreenScroll2Top') === ON ? this.scroll2Top() : GM_getValue('widescreenSetOnTop') === ON && this.playerSetOnTop();
        },
        scroll2Top: function () {
            window.scrollTo(0, 0);
        },
        playerSetOnTop: function () {
            const pos = this.isNew || !q('.mini-player')[0] ? q('.player').offsetTop() : q('.player-fix').offsetTop();
            window.scrollTo(0, pos);
        },
        danmu: function (auto = false) {
            if (this.isNew) {
                const newDanmuBtn = q('.bilibili-player-video-danmaku-switch input').mouseover();
                this.showHint(q('.choose_danmaku').text(), auto);
                newDanmuBtn.click().mouseout();
            } else {
                const oldDanmuBtn = q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]').mouseover().click().mouseout();
                const hint = `${oldDanmuBtn.attr('name').indexOf('close') > -1 ? "关闭" : '打开'}弹幕`;
                this.showHint(hint, auto);
            }
        },
        danmuType: function (type) {
            const btn = this.isNew ? q('.bilibili-player-video-danmaku-setting') : q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]');
            const danmuOpt = btn.mouseover().mouseout().find(`div[ftype="${type}"]`);
            if (danmuOpt) {
                danmuOpt.click().mouseout();
                if (danmuOpt.hasClass('disabled')) {
                    this.showHint(`关闭${danmuOpt.text()}`);
                } else {
                    this.showHint(`开启${danmuOpt.text()}`);
                }
            }
        },
        danmuTop: function () {
            this.danmuType('top');
        },
        danmuBottom: function () {
            this.danmuType('bottom');
        },
        danmuScroll: function () {
            this.danmuType('scroll');
        },
        danmuPrevent: function () {
            const e = this.isNew ? q('.bilibili-player-video-danmaku-setting').mouseover().mouseout().find('.bilibili-player-video-danmaku-setting-left-preventshade-box input') :
                q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]').mouseover().mouseout().find('input[name="ctlbar_danmuku_prevent"]').next();
            const text = e.click().mouseout().text().length > 0 ? e.text() : e.next().text();
            if (e.attr('data-pressed') === 'true' || e[0].checked) {
                this.showHint(`开启${text}`);
            } else {
                this.showHint(`关闭${text}`);
            }
        },
        playAndPause: function () {
            q('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
        },
        mirror: function () {
            if (this.getTransformCss(this.h5Player) != 'none') {
                this.setH5PlayerRransform('');
            } else {
                this.setH5PlayerRransform('rotateY(180deg)');
            }
        },
        lightOff: function () {
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
        },
        seek: function () {
            this.oldControlShow() ||  this.newControlShow();
            this.triggerSleep(q('.bilibili-player-video-time-wrap').mouseover())
                .then(() => q('input.bilibili-player-video-time-seek').select()).catch(() => {});
            return true;
        },
        mute: function () {
            q('.bilibili-player-iconfont-volume').click();
            this.h5Player[0].volume == 0 ? this.showHint(`静音`) : this.showHint(`取消静音`);
        },
        jump: function () {
            q('.bilibili-player-video-toast-item-jump').click();
        },
        jumpContent: function () {
            q('.bilibili-player-electric-panel-jump-content').click()
        },
        rotateRight: function () {
            this.h5PlayerRotate(1);
        },
        rotateLeft: function () {
            this.h5PlayerRotate(-1);
        },
        download: function () {
            window.open(player.getPlayurl());
        },
        nextPart: function () {
            this.partHandler(true);
        },
        prevPart: function () {
            this.partHandler(false);
        },
        focusPlayer: function () {
            q('.bilibili-player-video-control').click();
        },
        setRepeatStart: function () {
            this.repeatStart = this.h5Player[0].currentTime;
            this.showHint(`循环起点 ${q('.bilibili-player-video-time-now').text()}`)
        },
        setRepeatEnd: function () {
            this.repeatEnd = this.h5Player[0].currentTime;
            this.showHint(`循环终点 ${q('.bilibili-player-video-time-now').text()}`)
        },
        resetRepeat: function () {
            this.repeatEnd = undefined;
            this.repeatStart = undefined;
            this.showHint(`清除循环点`)
        },
        keyHandler: function (e) {
            const {keyCode, ctrlKey, shiftKey, altKey} = e;
            if (ctrlKey || shiftKey || altKey) {
                return;
            }
            if (GM_getValue('globalHotKey') === ON) {
                const {left, up, right, down, space} = this.keyCode;
                if ([left, up, right, down, space].some(kc => kc === keyCode)) {
                    this.focusPlayer();
                    return;
                }
            }
            Object.keys(this.config.quickDo)
                .some(key => keyCode === this.getKeyCode(key) && (!this[key]() || !e.preventDefault())) ||
                keyCode >= this.keyCode['0'] && keyCode <= this.keyCode['9'] &&
                this.setVideoCurrentTime(this.h5Player[0].duration / 10 * (keyCode - this.keyCode['0']));
            e.defaultPrevented || this.oldControlHide();
        },
        autoHandlerForStage1: function () {
            if (GM_getValue('highQuality') === ON || GM_getValue('vipHighQuality') === ON) {
                q('.bilibili-player-video-quality-menu').mouseover().mouseout();
                const btn = this.isNew ? q('.bui-select-item') : q('.bpui-selectmenu-list-row');
                const index = GM_getValue('highQuality') === ON ? btn.findIndex(e => !$(e).find('.bilibili-player-bigvip')[0]) : 0;
                btn.click(index);
            }
            if (this.reload && GM_getValue('jump') === ON) {
                this.jump();
            }
            this.oldControlHide();
        },
        autoHandler: function () {
            this.h5Player = q('#bofqi .bilibili-player-video video');
            if (GM_getValue('playAndPause') === ON) {
                GM_getValue('playAndPause') === ON && this.h5Player[0].play();
            }
            this.isBangumi = window.location.href.indexOf('bangumi') >= 0;
            if (GM_getValue('danmuOFF') === ON || this.isBangumi && GM_getValue('bangumiDanmuOFF') === ON) {
                let flag = q('.bilibili-player-video-danmaku-switch input').mouseover().mouseout();
                flag = q('.choose_danmaku').text().indexOf('关闭') > -1 ||
                    !flag[0] && !q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku_close"]')[0];
                flag && this.danmu(true);
            }
            q('.bilibili-player-ending-panel').css('display', 'none');
            this.autoHandlerForReload();
            this.oldControlHide();
            this.hideSenderBar();
        },
        autoHandlerForReload: function () {
            if (!this.reload) {
                return;
            }
            if (GM_getValue('lightOff') === ON && q('#heimu').getCss('display') !== 'block') {
                this.lightOff();
            }
            if (GM_getValue('fullscreen') === ON && !this.isFullScreen()) {
                this.playerMode(FULLSCREEN);
            } else if (GM_getValue('webFullscreen') === ON) {
                this.playerMode(WEBFULLSCREEN);
            } else if (GM_getValue('widescreen') === ON) {
                this.playerMode(WIDESCREEN);
            }
        },
        getNewPart: function (isNext) {
            const cur = this.isNew ? q('#multi_page .cur-list ul li.on') : this.isBangumi ? q('.episode-item.on') : q('.item.on');
            if (!cur[0]) {
                return;
            }
            const newPart = isNext ? cur.next() : cur.prev();
            if (!newPart[0]) {
                return;
            }
            const excludeClasses = ['v-part-toggle', 'btn-episode-more'];
            return !excludeClasses.some(x => newPart[0].className.includes(x)) ? newPart : undefined;
        },
        partHandler: function (isNext) {
            const newPart = this.getNewPart(isNext);
            if (newPart) {
                this.reload = GM_getValue('reloadPart') === ON;
                if (!this.reload) {
                    const index = newPart.hasClass('episode-item') ? q('.episode-item').findIndex(e => e.className.indexOf('on') > 0)  : player.getPlaylistIndex();
                    isNext ? player.next(index + 2) : player.next(index);
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
        showDanmuInput: function () {
            this.showSenderBar();
            const danmuInput = q('input.bilibili-player-video-danmaku-input');
            if (!q('input.bilibili-player-video-danmaku-input:focus').length) {
                this.triggerSleep(danmuInput, 'mouseover').then(() => {
                    this.isNew && (this.isFullScreen() || this.isWebFullscreen()) && this.newControlShow();
                    danmuInput.select().click();
                }).catch(() => {});
            }
        },
        hideDanmuInput: function () {
            this.hideSenderBar();
            const danmuInput = q('input.bilibili-player-video-danmaku-input');
            this.triggerSleep(danmuInput, 'mouseout').then(() => {
                !this.isNew && this.isFullScreen() ? this.hideSenderBar(true) : this.newControlHide();
                danmuInput.blur();
                this.focusPlayer();
            }).catch(() => {});
        },
        hideOrShowSenderBar: function (status) {
            this.hideSenderBar(status) || this.showSenderBar();
        },
        hideSenderBar: function (flag = false) {
            return (flag || GM_getValue('hideSenderBar') === ON) && q('.bilibili-player-video-sendbar').css('opacity', 0).css('display', 'none')[0];
        },
        showSenderBar: function () {
            q('.bilibili-player-video-sendbar').css('opacity', 1).css('display', 'flex');
        },
        isRepeatPlay: function () {
            return q('.icon-24repeaton').length || this.isNew && !q('.bilibili-player-video-btn-repeat.closed').length;
        },
        oldControlShow: function() {
            return !this.isNew && this.isFullScreen() && q('.bilibili-player-video-control').css('opacity', 1);
        },
        oldControlHide: function() {
            return !this.isNew && this.isFullScreen() && q('.bilibili-player-video-control').css('opacity', 0);
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
                    return (rad * 180 / Math.PI) | 0;
                }
            }
            return 0;
        },
        addStyle: function (css, id) {
            id = id ? `id=${id}` : '';
            q('head').append(`<style ${id} type="text/css">${css}</style>`);
        },
        initSettingHTML: function () {
            this.isNew = q('.bilibili-player-video-btn-setting').mouseover()[0];
            let panel = q('.bilibili-player-video-btn-setting-panel-panel-others');
            if (!this.isNew) {
                q('.bilibili-player-video-btn-quality').append(`
                    <div id="quick-do-setting-btn" class="bilibili-player-video-btn">
                    <i class="bilibili-player-iconfont icon-24setting" style="font-size: 16px;"></i>
                    <div id="quick-do-setting-panel" style="display: none;position: absolute;right: 0px;bottom: ${q('.bilibili-player-video-control').getCss('height')};background-color: white;padding: 10px;text-align: left;width: 200px;">
                    </div>
                `, 'afterEnd');
                panel = q('#quick-do-setting-panel');
                q('#quick-do-setting-btn').on('mouseover', () => panel.css('display', 'block')).on('mouseout', () => panel.css('display', 'none'));
            }
            Object.entries(this.config.checkboxes).forEach(([configName, {
                options,
                btn
            }]) => this.initCheckboxHTML(panel, configName, options, btn));
            if (this.isNew) {
                panel.append(`
                    <div id="quick-do-setting-panel" class="bilibili-player-video-btn-setting-panel-others-content" style="display: inline-block;width: 100%;float: left;"></div>
                `);
                q('.bilibili-player-video-btn-setting').mouseout();
                q('.bilibili-player-video-control .bilibili-player-video-btn-setting-panel').css('height', 'auto');
            }
            this.initKeySettingHTML();
        },
        initCheckboxHTML: function (panel, configName, options, btn) {
            if (btn) {
                panel.append(`<div id="quick-do-${configName}-panel" class="bilibili-player-video-btn-setting-panel-others-content" style="display: none;width: 100%;float: left;"></div>`);
                panel.append(`<span id="quick-do-${configName}-btn" style="display: inline-block;width: 100%;float: left;">${btn}</span>`);
                panel = q(`#quick-do-${configName}-panel`);
                q(`#quick-do-${configName}-btn`).on('click', () => panel.getCss('display') == 'none' ? panel.css('display', 'block') : panel.css('display', 'none'));
            }
            for (let [key, { text, status, ban, fn, tips }] of Object.entries(options)) {
                const checkboxId = `cb-${key}`;
                panel.append(this.isNew ? this.getNewSettingHTML(checkboxId, text, tips) : this.getSettingHTML(checkboxId, text, tips));
                if (GM_getValue(key) === undefined) {
                    GM_setValue(key, status);
                }
                const checked = GM_getValue(key) === ON;
                const checkbox = q(`#${checkboxId}`);
                checked && this.isNew ? checkbox.click() : q(`#${checkboxId}-lable`).toggleClass('bpui-state-active', checked);
                checkbox.on('click', () => {
                    const gmvalue = GM_getValue(key) === ON ? OFF : ON;
                    GM_setValue(key, gmvalue);
                    gmvalue === ON && ban.forEach((k,i) => GM_getValue(k) === ON && q(`#cb-${k}`).click());
                    !this.isNew && q(`#${checkboxId}-lable`).toggleClass('bpui-state-active', gmvalue === ON);
                    fn && this[fn](gmvalue === ON);
                });
                fn && this[fn](checked);
                if (tips) {
                    const tipsNode = q(`#${checkboxId}-tips`);
                    let tipsTimer;
                    checkbox.on('mouseover', () => tipsTimer = setTimeout(() => tipsNode.css('display', 'block'), 300))
                        .on('mouseout', () => {
                            clearTimeout(tipsTimer);
                            tipsNode.css('display', 'none')
                        });
                }
            }
        },
        getSettingHTML: function (checkboxId, text, tips) {
            tips = tips ? `<div id="${checkboxId}-tips" style="display: none;background: rgba(0, 0, 0, 0.7);color: white;border-radius: 5px;padding: 0px 20px;">${tips}</div>` : '';
            return `
            <div id="${checkboxId}" style="display: inline-block;width: 100%;float: left;">
                ${tips}
                <input type="checkbox" class="bpui-component bpui-checkbox bpui-button">
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
        getNewSettingHTML: function (checkboxId, text, tips) {
            tips = tips ? `<div id="${checkboxId}-tips" style="display: none;background: rgba(0, 0, 0, 0.7);border-radius: 5px;padding: 0px 20px;">${tips}</div>` : '';
            return `
            <div class="bilibili-player-video-btn-setting-panel-others-content" style="width: 100%;float: left;">
                ${tips}
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
        initKeySettingHTML: function () {
            const color = this.isNew ? 'black' : 'white';
            q('#quick-do-setting-panel').append(`
                <span id="quick-do-setting-key-btn" style="display: inline-block;width: 100%;float: left;">快捷键设置</span>
                <div id="quick-do-setting-key-panel" style="display: none;position: absolute;right: 0px;bottom: 40px;background-color: ${color};padding: 10px;text-align: left;z-index: 1;border: 3px double #222;">
                </div>
            `);
            const keyPanel = q('#quick-do-setting-key-panel');
            q('#quick-do-setting-key-btn').on('click', () => keyPanel.getCss('display') == 'none' ? keyPanel.css('display', 'block') : keyPanel.css('display', 'none'));
            for (let [key, { value, text }] of Object.entries(this.config.quickDo)) {
                if (this.getQuickDoKey(key) === undefined) {
                    this.saveQuickDoKey(key, value);
                }
                value = this.getQuickDoKey(key);
                const inputId = `qd-input-${key}`;
                keyPanel.append(this.isNew ? this.getNewKeySettingHTML(inputId, text, value) : this.getKeySettingHTML(inputId, text, value));
                const input = q(`#${inputId}`);
                input.on('keydown', e => {
                    const key = e.key.toLowerCase();
                    const isA2Z = e.keyCode >= 65 && e.keyCode <= 90;
                    const isSymbol = "[]\\;',./".indexOf(key) > -1;
                    if ((isA2Z || isSymbol || e.keyCode === this.keyCode.enter) && this.keyCode[key]) {
                        input.val(key)
                    }
                    const isDelete = e.keyCode == 8 || e.keyCode == 46;
                    !isDelete && e.preventDefault();
                }).on('keyup', e => this.saveQuickDoKey(key, input.val())).on('click', e => {
                    input.select();
                    e.preventDefault();
                });
            }
        },
        getKeySettingHTML: function (inputId, text, value) {
            return `
            <div style="float: left;width: 50%;">
                <input id="${inputId}" value="${value}" maxlength=1 style="display: inline-block;width: 30px;"></input>
                <span>${text}</span>
            </div>`;
        },
        getNewKeySettingHTML: function (inputId, text, value) {
            return `
            <div class="bilibili-player-fl bui bui-dark" style="width: 50%;">
                <input type="input" id="${inputId}" value="${value}" maxlength=1 style="display: inline-block;width: 30px;color: black;"></input>
                <span>${text}</span>
            </div>`;
        },
        checkHint: function (auto = false) {
            return auto ? GM_getValue('autoHint') === ON : GM_getValue('hint') === ON;
        },
        showHint: function (info, auto = false) {
            if (!this.checkHint(auto)) {
                return;
            }
            clearTimeout(this.hintTimer);
            q('div.bilibili-player-infoHint').css('opacity', 1).css('display', 'block');
            q('span.bilibili-player-infoHint-text')[0].innerHTML = info;
            this.hintTimer = setTimeout(() => q('div.bilibili-player-infoHint').css('opacity', 0).css('display', 'none'), 1E3);
        },
        initDanmuStyle: function (status) {
            if (status) {
                const css = '.bilibili-danmaku{color:rgb(255, 255, 255)!important;}';
                this.addStyle(css, 'qd-danmuColor');
            } else {
                const styleNode = q('#qd-danmuColor')[0];
                styleNode && styleNode.parentNode.removeChild(styleNode);
            }
        },
        videoEndedHander: function () {
            this.repeatEnd = this.repeatStart = undefined;
            if (GM_getValue('autoJumpContent') === ON) {
                setTimeout(() => this.jumpContent(), 0);
            }
            if (this.isRepeatPlay() || this.partHandler(true)) {
                return;
            }
            if (GM_getValue('lightOn') === ON && q('#heimu').getCss('display') === 'block') {
                this.lightOff();
            }
            if (GM_getValue('exitScreen') === ON) {
                this.playerMode(DEFAULT);
            } else if  (GM_getValue('exit2WideScreen') === ON) {
                this.playerMode(WIDESCREEN);
            }
        },
        init: function () {
            let stageFlag = undefined;
            new MutationObserver((mutations, observer) => {
                mutations.forEach(mutation => {
                    const target = q(mutation.target);
                    const stage = mutation.previousSibling && target.attr('stage');
                    if ((stage === "0" || stage === "2") && (!stageFlag || stage === stageFlag)) {
                        stageFlag = stage;
                        try {
                            this.initHintStyle();
                            this.initSettingHTML();
                            this.autoHandler();
                            this.bindKeydown();
                            console.log('bilibili-quickdo initing');
                        } catch (e) {
                            console.error('bilibili-quickdo init error:', e);
                        }
                    } else if (stage === "1") {
                        this.autoHandlerForStage1();
                        this.bindDanmuInputKeydown();
                        console.log('bilibili-quickdo init done');
                    } else if (target.hasClass('bilibili-player-video')) {
                        this.h5Player = q('#bofqi .bilibili-player-video video');
                    } else if (this.repeatEnd && this.repeatStart && target.hasClass('bilibili-player-video-time-now')
                               && this.repeatEnd <= this.h5Player[0].currentTime) {
                        this.h5Player[0].currentTime = this.repeatStart;
                    }
                });
            }).observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
    };
    bilibiliQuickDo.init();
})();