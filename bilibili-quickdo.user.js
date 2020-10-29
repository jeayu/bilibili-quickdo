// ==UserScript==
// @name         bilibili  H5播放器快捷操作
// @namespace    https://github.com/jeayu/bilibili-quickdo
// @version      0.9.9.8
// @description  快捷键设置,回车快速发弹幕,双击全屏,自动选择最高清画质、播放、全屏、关闭弹幕、自动转跳和自动关灯等
// @author       jeayu
// @license      MIT
// @match        *://www.bilibili.com/bangumi/play/ep*
// @match        *://www.bilibili.com/bangumi/play/ss*
// @match        *://www.bilibili.com/video/av*
// @match        *://www.bilibili.com/video/bv*
// @match        *://www.bilibili.com/watchlater/*
// @match        *://www.bilibili.com/video/BV*
// @match        *://www.bilibili.com/cheese/play/ep*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';
    const q = function (selector) {
        let nodes = [];
        if (typeof selector === 'string') {
            Object.assign(nodes, document.querySelectorAll(selector));
            nodes.selectorStr = selector;
        } else if (selector instanceof NodeList) {
            Object.assign(nodes, selector);
        } else if (selector instanceof Node) {
            nodes = [selector];
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
            return nodes.length > index && nodes[index].className.match && (nodes[index].className.match(new RegExp(`(\\s|^)${className}(\\s|$)`)) != null);
        }
        nodes.append = function (text, where = 'beforeend', index = 0) {
            nodes.length > index && nodes[index].insertAdjacentHTML(where, text);
            return this;
        }
        nodes.find = function (name, index = 0) {
            return q(nodes[index].querySelectorAll(name));
        }
        nodes.toggleClass = function (className, flag, index = 0) {
            return flag ? this.addClass(className, index) : this.removeClass(className, index);
        }
        nodes.next = function (index = 0) {
            return nodes.length > index && nodes[index].nextElementSibling ? q(nodes[index].nextElementSibling) : [];
        }
        nodes.prev = function (index = 0) {
            return nodes.length > index && nodes[index].previousElementSibling ? q(nodes[index].previousElementSibling) : [];
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
        nodes.on = function (event, fn, useCapture=false, index = 0) {
            nodes.length > index && nodes[index].addEventListener(event, fn, useCapture);
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
        nodes.offset = function (index = 0) {
            if (nodes.length <= index) {
                return {top: 0, left: 0};
            }
            const rect = nodes[index].getBoundingClientRect();
            return {top: rect.top + document.body.scrollTop, left: rect.left + document.body.scrollLeft}
        }
        nodes.parseFloat = function (css, index = 0) {
            return (parseFloat(this.getCss(css, index)) || 0);
        }
        nodes.after = function (node, index = 0) {
            nodes.length > index && node instanceof Node && nodes[index].parentNode.insertBefore(node, nodes[index]);
            return this;
        }
        return nodes;
    }
    const debounce = (fn, delay) => {
        clearTimeout(fn.timer);
        fn.timer = setTimeout(() => fn.apply(bilibiliQuickDo), delay);
    };
    const [ON, OFF] = [1, 0];
    const [FULLSCREEN, WEBFULLSCREEN, WIDESCREEN, DEFAULT] = [3, 2, 1, 0];
    const bilibiliQuickDo = {
        h5Player: undefined,
        hintTimer: undefined,
        keydownFn: undefined,
        reload: true,
        isNew: false,
        isBangumi: false,
        isNewBangumi: false,
        isWatchlater: false,
        repeatStart: undefined,
        repeatEnd: undefined,
        keyCode: {
            'enter': 13,
            'esc': 27,
            '=': 187,
            '-': 189,
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
                subSpeed: { value: '[', text: '减少速度', },
                addSpeed: { value: ']', text: '增加速度', },
                resetSpeed:  { value: '\\', text: '重置速度', },
                danmu: { value: 'd', text: '弹幕', },
                playAndPause: { value: 'p', text: '暂停播放', },
                prevPart: { value: 'k', text: '上一P', },
                nextPart: { value: 'l', text: '下一P', },
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
                subVolume: { value: '', text: '减少音量', },
                addVolume: { value: '', text: '增加音量', },
                subProgress: { value: '', text: '快退', },
                addProgress: { value: '', text: '快进', },
            },
            checkboxes: {
                checkbox: {
                    options: {
                        dblclick: { text: '双击全屏', status: ON },
                        hint: { text: '快捷键提示', status: ON },
                        autoHint: { text: '自动操作提示', status: ON, tips: '自动关闭弹幕时的提示' },
                        reloadPart: { text: '换P重新加载', status: OFF, tips: '勾选: 屏幕回到自动设置的模式.</br>不勾选: 屏幕和上一P一样,</br>番剧下一P不是续集换P会无效.' },
                        globalHotKey: { text: '默认快捷键设置全局', status: OFF, tips: '上下左右空格不会滚动页面' },
                    },
                    btn: '常规设置',
                },
                defaultShortCutCheckbox: {
                    options: {
                        f: { text: 'f键', status: OFF, bindKey: 'f' },
                        leftSquareBracket: { text: '[键', status: OFF, bindKey: '[' },
                        rightSquareBracket: { text: ']键', status: OFF, bindKey: ']' },
                        enter: { text: '回车键', status: OFF, bindKey: 'enter' },
                        up: { text: '↑键', status: OFF, bindKey: 'up' },
                        down: { text: '↓键', status: OFF, bindKey: 'down' },
                        right: { text: '←键', status: OFF, bindKey: 'left' },
                        left: { text: '→键', status: OFF, bindKey: 'right' },
                        space: { text: '空格键', status: OFF, bindKey: 'space' },
                    },
                    btn: '屏蔽默认快捷键',
                },
                playerCheckbox: {
                    options: {
                        hideSenderBar: { text: '隐藏弹幕栏', status: OFF, fn: 'hideOrShowSenderBar', tips: '发弹幕快捷键可显示' },
                        widescreenScroll2Top: { text: '宽屏时回到顶部', status: OFF, ban:['widescreenSetOnTop'], fn: 'setWidescreenPos' },
                        widescreenSetOnTop: { text: '宽屏时播放器置顶部', status: OFF, ban:['widescreenScroll2Top'], fn: 'setWidescreenPos' },
                        lightOffWhenPlaying: { text: '播放时自动关灯', status: OFF, },
                        lightOnWhenPause: { text: '暂停时自动开灯', status: OFF, },
                        ultraWidescreen: { text: '超宽屏', status: OFF, ban:['customUltraWidescreenHeight'], fn: 'ultraWidescreen', tips: '宽屏模式宽度和窗口一样'},
                        customUltraWidescreenHeight: { text: '自定义超宽屏高度', status: OFF, ban:['ultraWidescreen'], fn: 'customUltraWidescreenHeight', tips: '最大高度和窗口一样'},
                        customPlayerHeight: { text: '自定义播放器高度', status: OFF, fn: 'customPlayerHeight', tips: '最大高度和窗口一样' },
                        bottomTitle: { text: '标题位于播放器下方', status: OFF, tips: '刷新生效' },
                        danmukuBoxAfterMultiPage: { text: '新版弹幕列表在视频选集下方', status: OFF, tips: '刷新生效' },
                    },
                    btn: '播放器设置',
                },
                danmuCheckbox: {
                    options: {
                        danmuColor: { text: '统一弹幕颜色', status: OFF, fn: 'initDanmuStyle' },
                        danmuMask: { text: '关闭弹幕蒙版', status: OFF, fn: 'danmuMask'},
                        danmuOFF: { text: '自动关闭弹幕', status: OFF },
                        bangumiDanmuOFF: { text: '番剧自动关弹幕', status: OFF },
                        danmuTopOFF: { text: '自动关闭顶部弹幕', status: OFF },
                        danmuBottomOFF: { text: '自动关闭底部弹幕', status: OFF },
                        danmuScrollOFF: { text: '自动关闭滚动弹幕', status: OFF },
                    },
                    btn: '弹幕设置',
                },
                startCheckbox: {
                    options: {
                        playAndPause: { text: '自动播放', status: ON },
                        jump: { text: '自动转跳', status: ON, tips: '跳转另一集无效, 配合跳转快捷键用'},
                        lightOff: { text: '自动关灯', status: OFF },
                        fullscreen: { text: '自动全屏', status: OFF, ban:['webFullscreen', 'widescreen'], tips: '浏览器限制不能真全屏' },
                        webFullscreen: { text: '自动网页全屏', status: ON, ban:['fullscreen', 'widescreen'] },
                        widescreen: { text: '自动宽屏', status: OFF, ban:['webFullscreen', 'fullscreen'] },
                        highQuality: { text: '自动最高画质', status: OFF, ban:['vipHighQuality'] },
                        vipHighQuality: { text: '自动最高画质(大会员使用)', status: OFF, ban:['highQuality'] },
                        vipHighQualityNot4K: { text: '自动最高画质不选择4K', status: OFF },
                        moreDescribe: { text: '自动展开视频简介', status: OFF },
                        danmuList: { text: '自动展开新版弹幕列表', status: OFF },
                    },
                    btn: '播放前自动设置',
                },
                endCheckbox: {
                    options: {
                        lightOn: { text: '播放结束自动开灯', status: OFF, tips: '还有下一P不触发' },
                        exitScreen: { text: '播放结束还原屏幕', status: OFF, ban:['exit2WideScreen'], tips: '还有下一P不触发' },
                        exit2WideScreen: { text: '播放结束还原宽屏', status: OFF, ban:['exitScreen'], tips: '还有下一P不触发' },
                        autoJumpContent: { text: '跳过充电鸣谢', status: OFF },
                    },
                    btn: '播放结束自动设置',
                },
            },
            variable: {
                speed: { text: '播放速度调整倍数', value: 0.25 },
                minSpeed: { text: '最小播放速度倍数', value: 0.25 },
                maxSpeed: { text: '最大播放速度倍数', value: 4 },
                volume: { text: '音量调整百分比', value: 1 },
                videoProgress: { text: '快进/快退调整秒数', value: 1 },
                rotationDeg: { text: '旋转角度', value: 90 },
                ultraWidescreenHeightPercent: { text: '超宽屏高度百分比', value: 100 },
                playerHeightPercent: { text: '播放器高度百分比', value: 100 },
            },
        },
        bindPlayerEvent() {
            q('.bilibili-player-dm-tip-wrap').on('dblclick', () => this.getCheckboxSetting('dblclick') === ON && this.fullscreen());
            player.addEventListener('video_resize', () => {
                this.hideSenderBar();
                q('body').toggleClass('qd-wide-flag', this.isWidescreen());
                this.initPlayerStyle();
                debounce(this.fixVideoResize, 100);
            });
            player.addEventListener('video_media_ended', () => this.videoEndedHander());
            player.addEventListener('video_media_playing', () => this.getCheckboxSetting('lightOffWhenPlaying') === ON && !this.isLightOff() && this.lightOff());
            player.addEventListener('video_media_pause', () => this.getCheckboxSetting('lightOnWhenPause') === ON && this.isLightOff() && this.lightOff());
        },
        fixVideoResize() {
            this.isWidescreen() && !this.hasMiniPlayer() && this.setWidescreenPos();
            q('#playerWrap').css('height', q('#bilibiliPlayer ').getCss('height'));
        },
        initPlayerStyle() {
            this.ultraWidescreen();
            this.customPlayerHeight();
            this.customUltraWidescreenHeight();
        },
        bottomTitle() {
            if (!this.reload || this.getCheckboxSetting('bottomTitle') === OFF) {
                return;
            }
            const paused = this.h5Player && this.h5Player[0] ? this.h5Player[0].paused : true;
            this.isNew ? q('#viewbox_report').after(q('#playerWrap')[0]) : this.isBangumi ? q('#bangumi_header').after(q('#bangumi_player')[0]) : q('#viewbox_report').after(q('#__bofqi')[0]);
            this.setWidescreenPos();
            paused || this.h5Player[0].play();
            this.rConCss();
        },
        danmukuBoxAfterMultiPage() {
            if (!this.reload || !this.isNew) {
                return;
            }
            if (this.getCheckboxSetting('danmukuBoxAfterMultiPage') === ON) {
                this.isBangumi ? q('#danmukuBox').after(q('#eplist_module')[0]) : q('#danmukuBox').after(q('#multi_page')[0]);
            }
        },
        rConCss() {
            this.removeStyle('#qd-rCon');
            if (!this.isNew || this.hasMiniPlayer()) {
                return;
            }
            if (this.getCheckboxSetting('bottomTitle') === ON) {
                const top = this.getCheckboxSetting('bottomTitle') === ON ? q('.player').parseFloat('height') : q('.player').parseFloat('height') + q('#v_upinfo').parseFloat('margin-bottom') + q('#v_upinfo').parseFloat('height');
                const css = `
                .qd-wide-flag .r-con{margin-top:${top}px!important}
                .v-wrap .video-info {height: auto!important;padding-top: 15px!important;}`;
                this.addStyle(css, 'qd-rCon');
            }
        },
        customUltraWidescreenHeight() {
            this.removeStyle('#qd-customUltraWidescreenHeight');
            if (this.getCheckboxSetting('customUltraWidescreenHeight') === ON && !this.hasMiniPlayer()) {
                const clientWidth = document.body.clientWidth;
                const marginLeft = q('#bilibiliPlayer ').offset().left;
                const clientHeight = document.body.clientHeight * Math.min(this.getVarSetting('ultraWidescreenHeightPercent') / 100, 1);
                const marginHeight = clientHeight - q(`${this.isBangumi ? '.bilibiliPlayer' : '.player-wrap'}`).parseFloat('height');
                const css = `
                .qd-wide-flag .mode-widescreen{width:${clientWidth}px!important;margin-left:-${marginLeft}px!important}
                ${this.isNew ? '.qd-wide-flag .guide{z-index:0!important}' : ''}
                ${this.isBangumi ? '.qd-wide-flag .bangumi-nav-right{z-index:0!important}' : ''}
                .qd-wide-flag ${this.isBangumi ? '.bangumi-player:not(.mini-player)' : ''} .player{height:${clientHeight}px!important}
                ${this.isBangumi ? `.qd-wide-flag #bangumi_player{height:${clientHeight}px}` : ''}
                ${this.isNewBangumi ? `.qd-wide-flag #player_module{height:${clientHeight}px!important}` : ''}
                ${this.isNewBangumi ? `.qd-wide-flag .plp-l{padding-top:${clientHeight}px!important}` : ''}
                ${this.isNewBangumi ? `.qd-wide-flag .plp-r{margin-top:${clientHeight}px!important}` : ''}
                ${this.isNew ? `.qd-wide-flag .player-wrap{margin-bottom: ${marginHeight + q('#arc_toolbar_report').parseFloat('margin-top')}px!important}` : ''}
                .bangumi-player{height:auto!important}
                `;
                this.addStyle(css, 'qd-customUltraWidescreenHeight');
            }
            this.rConCss();
        },
        ultraWidescreen() {
            this.removeStyle('#qd-ultraWidescreen');
            if (this.getCheckboxSetting('ultraWidescreen') === ON && !this.hasMiniPlayer()) {
                const clientWidth = document.body.clientWidth;
                const marginLeft = q('#bilibiliPlayer ').offset().left;
                const css = `
                .qd-wide-flag .mode-widescreen{width:${clientWidth}px!important;margin-left:-${marginLeft}px!important}
                ${this.isNew ? '.qd-wide-flag .guide{z-index:0!important}' : ''}
                ${this.isBangumi ? '.qd-wide-flag .bangumi-nav-right{z-index:0!important}' : ''}
                `;
                this.addStyle(css, 'qd-ultraWidescreen');
            }
            this.rConCss();
        },
        customPlayerHeight() {
            this.removeStyle('#qd-customPlayerHeight');
            if (this.getCheckboxSetting('customPlayerHeight') === ON && !this.hasMiniPlayer()) {
                const clientHeight = document.body.clientHeight * Math.min(this.getVarSetting('playerHeightPercent') / 100, 1);
                const marginHeight = clientHeight - q(`${this.isBangumi ? '.bilibiliPlayer' : '.player-wrap'}`).parseFloat('height');
                const css = `
                ${this.isBangumi ? '.bangumi-player:not(.mini-player)' : ''} .player{height:${clientHeight}px!important}
                ${this.isBangumi ? `#bangumi_player{height:${clientHeight}px}` : ''}
                ${this.isNewBangumi ? `#player_module{height:${clientHeight}px!important}` : ''}
                ${this.isNewBangumi ? `.qd-wide-flag .plp-l{padding-top:${clientHeight}px!important}` : ''}
                ${this.isNewBangumi ? `.qd-wide-flag .plp-r{margin-top:${clientHeight}px!important}` : ''}
                ${this.isNew ? `.player-wrap{margin-bottom: ${marginHeight + q('#arc_toolbar_report').parseFloat('margin-top')}px!important}` : ''}
                .bangumi-player{height:auto!important}
                `;
                this.addStyle(css, 'qd-customPlayerHeight');
            }
            this.rConCss();
        },
        danmuMask() {
            this.removeStyle('#qd-danmuMask');
            if (this.getCheckboxSetting('danmuMask') === ON) {
                const css = '.bilibili-player-video-danmaku{-webkit-mask-image: none!important}';
                this.addStyle(css, 'qd-danmuMask');
            }
        },
        initHintStyle() {
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
        getKeyCode(type) {
            return this.keyCode[this.getQuickDoKey(type)];
        },
        getQuickDoKey(key, newVersion=this.isNew) {
            return GM_getValue(`quickDo-${this.getVersionKey(key, newVersion)}`);
        },
        saveQuickDoKey(key, value, newVersion=this.isNew) {
            GM_setValue(`quickDo-${this.getVersionKey(key, newVersion)}`, value.toLowerCase());
        },
        getVarSetting(key, newVersion=this.isNew) {
            return parseFloat(GM_getValue(`quickDo-var-${this.getVersionKey(key, newVersion)}`)) || this.config.variable[key].value;
        },
        saveVarSetting(key, value, newVersion=this.isNew) {
            let v = this.config.variable[key].value;
            if ((v = parseFloat(value)) && v > 0) {
                GM_setValue(`quickDo-var-${this.getVersionKey(key, newVersion)}`, v);
                return true;
            }
        },
        getVersionKey(key, newVersion=this.isNew) {
            return newVersion ? key : `old-${key}`;
        },
        getCheckboxSetting(key, newVersion=this.isNew) {
            return GM_getValue(this.getVersionKey(key, newVersion));
        },
        saveCheckboxSetting(key, value, newVersion=this.isNew) {
            return GM_setValue(this.getVersionKey(key, newVersion), value);
        },
        syncNewConfig2Old() {
            Object.keys(this.config.quickDo).forEach(key => this.saveQuickDoKey(key, this.getQuickDoKey(key, true), false));
            Object.keys(this.config.variable).forEach(key => this.saveVarSetting(key, this.getVarSetting(key, true), false));
            Object.entries(this.config.checkboxes).forEach(([configName, {
                options,
            }]) => Object.keys(options).forEach(key => this.saveCheckboxSetting(key, this.getCheckboxSetting(key, true), false)));
            this.isNew ? this.showHint('同步完成') : location.reload();
        },
        bindKeydown() {
            this.keydownFn = this.keydownFn || (e=> !q('input:focus, textarea:focus').length && this.keyHandler(e));
            q(document).on('keydown', this.keydownFn, true);
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
        bindDanmuInputKeydown() {
            q('input.bilibili-player-video-danmaku-input').on('keydown', e => {
                e.keyCode === this.keyCode.enter && this.hideDanmuInput();
            });
        },
        addSpeed() {
            this.h5Player[0].playbackRate = Math.min(this.h5Player[0].playbackRate + this.getVarSetting('speed'), this.getVarSetting('maxSpeed'));
            this.showHint(`${this.h5Player[0].playbackRate} X`);
        },
        subSpeed() {
            this.h5Player[0].playbackRate = Math.max(this.h5Player[0].playbackRate - this.getVarSetting('speed'), this.getVarSetting('minSpeed'));
            this.showHint(`${this.h5Player[0].playbackRate} X`);
        },
        resetSpeed() {
            this.h5Player[0].playbackRate = 1;
            this.showHint(`${this.h5Player[0].playbackRate} X`);
        },
        fullscreen() {
            q('.bilibili-player-video-btn-fullscreen').click();
            if (q('.bilibili-player-video-btn-setting-panel-others-content-lightoff input')[0]) {
                q('body').hasClass('player-mode-blackmask')
                ? q('#heimu').css('display', 'block')
                : q('#heimu').css('display', '');
            }
        },
        isFullScreen() {
            return q('#bilibiliPlayer').hasClass('mode-fullscreen');
        },
        isWebFullscreen() {
            return q('#bilibiliPlayer').hasClass('mode-webfullscreen');
        },
        isWidescreen() {
            return q('#bilibiliPlayer').hasClass('mode-widescreen');
        },
        hasMiniPlayer() {
            return q('.mini-player')[0];
        },
        webFullscreen() {
            this.isFullScreen() ? this.playerMode(WEBFULLSCREEN) : q('.bilibili-player-video-web-fullscreen').click();
        },
        widescreen() {
            this.isFullScreen() ? this.playerMode(WIDESCREEN) : q('.bilibili-player-video-btn-widescreen').click();
            this.setWidescreenPos();
        },
        playerMode(mode) {
            player.mode(mode);
            mode === WIDESCREEN && this.setWidescreenPos(true);
            q('body').toggleClass('qd-wide-flag', this.isWidescreen());
        },
        setWidescreenPos(isDelay=false) {
            if (!this.isWidescreen()) {
                return;
            }
            if (this.getCheckboxSetting('widescreenScroll2Top') === ON) {
                this.scroll2Top();
            } else if (this.getCheckboxSetting('widescreenSetOnTop') === ON) {
                this.playerSetOnTop(isDelay);
            }
        },
        scroll2Top() {
            window.scrollTo(0, 0);
        },
        bofqiSetOnTop() {
            const top = q('#bilibiliPlayer ').offset().top;
            top > 0 && window.scrollTo(0, top);
        },
        playerSetOnTop(isDelay=false) {
            this.scroll2Top();
            isDelay || this.hasMiniPlayer() ? debounce(this.bofqiSetOnTop, 100) : this.bofqiSetOnTop();
        },
        danmu(auto = false) {
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
        danmuType(type, auto = false) {
            const btn = this.isNew ? q('.bilibili-player-video-danmaku-setting') : q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]');
            const danmuOpt = btn.mouseover().mouseout().find(`div[ftype="${type}"]`);
            q('.bilibili-player-video-danmaku-setting-wrap').css('display', 'none');
            if (danmuOpt) {
                danmuOpt.click().mouseout();
                if (danmuOpt.hasClass('disabled')) {
                    this.showHint(`关闭${danmuOpt.text()}`, auto);
                } else {
                    this.showHint(`开启${danmuOpt.text()}`, auto);
                }
            }
        },
        danmuTypeDisabledStatus(type) {
            const btn = this.isNew ? q('.bilibili-player-video-danmaku-setting') : q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]');
            const result =  btn.mouseover().mouseout().find(`div[ftype="${type}"]`).hasClass('disabled');
            q('.bilibili-player-video-danmaku-setting-wrap').css('display', 'none');
            return result;
        },
        danmuTop(auto = false) {
            this.danmuType('top', auto);
        },
        danmuBottom(auto = false) {
            this.danmuType('bottom', auto);
        },
        danmuScroll(auto = false) {
            this.danmuType('scroll', auto);
        },
        danmuPrevent() {
            const e = this.isNew ? q('.bilibili-player-video-danmaku-setting').mouseover().mouseout().find('.bilibili-player-video-danmaku-setting-left-preventshade-box input') :
                q('.bilibili-player-video-btn-danmaku[name^="ctlbar_danmuku"]').mouseover().mouseout().find('input[name="ctlbar_danmuku_prevent"]').next();
            const text = e.click().mouseout().text().length > 0 ? e.text() : e.next().text();
            if (e.attr('data-pressed') === 'true' || e[0].checked) {
                this.showHint(`开启${text}`);
            } else {
                this.showHint(`关闭${text}`);
            }
        },
        playAndPause() {
            q('div.bilibili-player-video-control div.bilibili-player-video-btn.bilibili-player-video-btn-start').click();
        },
        mirror() {
            if (this.getTransformCss(this.h5Player) != 'none') {
                this.setH5PlayerRransform('');
            } else {
                this.setH5PlayerRransform('rotateY(180deg)');
            }
        },
        isLightOff() {
            return q('#heimu').getCss('display') === 'block';
        },
        lightOff() {
            q('.bilibili-player-video-btn-setting-right-others-content-lightoff input').click();
        },
        seek() {
            this.oldControlShow() || this.newControlShow();
            this.triggerSleep(q('.bilibili-player-video-time-wrap').mouseover())
                .then(() => q('input.bilibili-player-video-time-seek').select()).catch(() => {});
            return true;
        },
        mute() {
            q('.bilibili-player-iconfont-volume').click();
            this.h5Player[0].volume == 0 ? this.showHint(`静音`) : this.showHint(`取消静音`);
        },
        jump() {
            q('.bilibili-player-video-toast-item-jump').click();
        },
        jumpContent() {
            q('.bilibili-player-electric-panel-jump-content').click()
        },
        rotateRight() {
            this.h5PlayerRotate(1);
        },
        rotateLeft() {
            this.h5PlayerRotate(-1);
        },
        download() {
            window.open(player.getPlayurl());
        },
        nextPart() {
            this.partHandler(true);
        },
        prevPart() {
            this.partHandler(false);
        },
        focusPlayer() {
            q('.bilibili-player-video-control').click();
        },
        setRepeatStart() {
            this.repeatStart = this.h5Player[0].currentTime;
            this.showHint(`起点 ${q('.bilibili-player-video-time-now').text()}`)
        },
        setRepeatEnd() {
            this.repeatEnd = this.h5Player[0].currentTime;
            this.showHint(`终点 ${q('.bilibili-player-video-time-now').text()}`)
        },
        resetRepeat() {
            this.repeatEnd = this.repeatStart = undefined;
            this.showHint(`清除循环点`)
        },
        subVolume() {
            this.h5Player[0].volume = Math.max(this.h5Player[0].volume - (this.getVarSetting('volume') / 100), 0);
            this.showHint(`音量 ${this.h5Player[0].volume * 100 | 0}%`)
        },
        addVolume() {
            this.h5Player[0].volume = Math.min(this.h5Player[0].volume + (this.getVarSetting('volume') / 100), 1);
            this.showHint(`音量 ${this.h5Player[0].volume * 100 | 0}%`)
        },
        subProgress() {
            this.h5Player[0].currentTime -= this.getVarSetting('videoProgress');
        },
        addProgress() {
            this.h5Player[0].currentTime += this.getVarSetting('videoProgress');
        },
        moreDescribe() {
            this.getCheckboxSetting('moreDescribe') === ON && q('div [report-id="abstract_spread"]').click();
        },
        danmuList() {
            this.getCheckboxSetting('danmuList') === ON && q('.bui-collapse-wrap-folded .bui-collapse-arrow-text').click();
        },
        checkDefaultShortCutSetting(setingKey, keyCodeConfig, keyCode) {
            return this.keyCode[keyCodeConfig] == keyCode && this.getCheckboxSetting(setingKey) === ON;
        },
        checkDefaultShortCut(keyCode) {
            return Object.entries(this.config.checkboxes.defaultShortCutCheckbox.options)
                .some(entry => this.checkDefaultShortCutSetting(entry[0], entry[1].bindKey, keyCode));
        },
        isGlobalHotKey(keyCode) {
            return ["left", "up", "right", "down", "space"].find(key => this.keyCode[key] == keyCode);
        },
        keyHandler(e) {
            const {keyCode, ctrlKey, shiftKey, altKey} = e;
            if (ctrlKey || shiftKey || altKey) {
                return;
            }
            if (this.checkDefaultShortCut(keyCode)) {
                e.stopPropagation();
            }
            if (this.getCheckboxSetting('globalHotKey') === ON) {
                if (this.isGlobalHotKey(keyCode)) {
                    this.focusPlayer();
                    e.preventDefault();
                }
            }

            Object.keys(this.config.quickDo)
                .some(key => keyCode === this.getKeyCode(key) && (!this[key]() || !e.preventDefault())) ||
                keyCode >= this.keyCode['0'] && keyCode <= this.keyCode['9'] &&
                this.setVideoCurrentTime(this.h5Player[0].duration / 10 * (keyCode - this.keyCode['0']));
            e.defaultPrevented || this.oldControlHide();
        },
        autoHandlerForStage1() {
            if (this.getCheckboxSetting('highQuality') === ON || this.getCheckboxSetting('vipHighQuality') === ON) {
                q('.bilibili-player-video-quality-menu').mouseover().mouseout();
                const btn = this.isNew ? q('.bui-select-item') : q('.bpui-selectmenu-list-row');
                let index = this.getCheckboxSetting('highQuality') === ON ? btn.findIndex(e => !q(e).find('.bilibili-player-bigvip')[0]) :
                    this.getCheckboxSetting('vipHighQualityNot4K') === ON ? btn.findIndex(e => !e.textContent.includes('4K')) : 0;
                btn.click(index);
            }
            if (this.getCheckboxSetting('jump') === ON) {
                this.jump();
            }
            this.getCheckboxSetting('danmuTopOFF') === ON != this.danmuTypeDisabledStatus('top') && this.danmuTop(true);
            this.getCheckboxSetting('danmuBottomOFF') === ON != this.danmuTypeDisabledStatus('bottom') && this.danmuBottom(true);
            this.getCheckboxSetting('danmuScrollOFF') === ON != this.danmuTypeDisabledStatus('scroll') && this.danmuScroll(true);
            this.moreDescribe();
            this.danmuList();
            !this.isNew && this.bottomTitle();
            this.oldControlHide();
        },
        autoHandler() {
            this.h5Player = q('#bilibiliPlayer  .bilibili-player-video video');
            if (this.getCheckboxSetting('playAndPause') === ON) {
                this.getCheckboxSetting('playAndPause') === ON && this.h5Player[0].play();
            }
            if (this.getCheckboxSetting('danmuOFF') === ON || this.isBangumi && this.getCheckboxSetting('bangumiDanmuOFF') === ON) {
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
        autoHandlerForReload() {
            if (!this.reload) {
                return;
            }
            if (this.getCheckboxSetting('lightOff') === ON && !this.isLightOff()) {
                this.lightOff();
            }
            if (this.getCheckboxSetting('fullscreen') === ON && !this.isFullScreen()) {
                this.playerMode(FULLSCREEN);
            } else if (this.getCheckboxSetting('webFullscreen') === ON) {
                this.playerMode(WEBFULLSCREEN);
            } else if (this.getCheckboxSetting('widescreen') === ON) {
                this.playerMode(WIDESCREEN);
            }
        },
        getNewPart(isNext) {
            const cur = this.isNewBangumi ? q('.ep-item.cursor') : this.isNew ? q('#multi_page .cur-list ul li.on') : this.isBangumi ? q('.episode-item.on') : q('.item.on');
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
        partHandler(isNext) {
            const newPart = this.getNewPart(isNext);
            if (newPart) {
                this.reload = this.getCheckboxSetting('reloadPart') === ON;
                if (!this.reload) {
                    const index = newPart.hasClass('episode-item') ? q('.episode-item').findIndex(e => e.className.indexOf('on') > 0) : player.getPlaylistIndex();
                    isNext ? player.next(index + 2) : player.next(index);
                } else if (!newPart.find('a').click()[0]) {
                    newPart.click();
                }
            }
            return newPart;
        },
        triggerSleep(el, event='click', ms=100) {
            return new Promise((resolve, reject) => {
                if (el && el[0]) {
                    el.trigger(event);
                    setTimeout(resolve, ms);
                } else {
                    reject();
                }
            });
        },
        setVideoCurrentTime(time) {
            if (time > -1 && time <= this.h5Player[0].duration) {
                this.h5Player[0].currentTime = time;
                return true;
            }
            return false;
        },
        showDanmuInput() {
            this.showSenderBar();
            const danmuInput = q('input.bilibili-player-video-danmaku-input');
            if (!q('input.bilibili-player-video-danmaku-input:focus').length) {
                this.triggerSleep(danmuInput, 'mouseover').then(() => {
                    this.isNew && (this.isFullScreen() || this.isWebFullscreen()) && this.newControlShow();
                    danmuInput.select().click();
                }).catch(() => {});
            }
        },
        hideDanmuInput() {
            this.hideSenderBar();
            const danmuInput = q('input.bilibili-player-video-danmaku-input');
            this.triggerSleep(danmuInput, 'mouseout').then(() => {
                !this.isNew && this.isFullScreen() ? this.hideSenderBar(true) : this.newControlHide();
                danmuInput.blur();
                this.focusPlayer();
            }).catch(() => {});
        },
        hideOrShowSenderBar(status) {
            this.hideSenderBar(status) || this.showSenderBar();
        },
        hideSenderBar(flag = false) {
            return (flag || this.getCheckboxSetting('hideSenderBar') === ON) && q('.bilibili-player-video-sendbar').css('opacity', 0).css('display', 'none')[0];
        },
        showSenderBar() {
            q('.bilibili-player-video-sendbar').css('opacity', 1).css('display', 'flex');
        },
        isRepeatPlay() {
            return q('.icon-24repeaton').length || this.isNew && q('.bilibili-player-video-btn-setting-left-repeat input')[0].checked;
        },
        oldControlShow() {
            return !this.isNew && this.isFullScreen() && q('.bilibili-player-video-control').css('opacity', 1);
        },
        oldControlHide() {
            return !this.isNew && this.isFullScreen() && q('.bilibili-player-video-control').css('opacity', 0);
        },
        newControlShow() {
            q('.bilibili-player-area').addClass('video-control-show');
        },
        newControlHide() {
            q('.bilibili-player-area').removeClass('video-control-show');
        },
        h5PlayerRotate(flag) {
            const h5Player = this.h5Player[0];
            const deg = this.getRotationDeg(this.h5Player) + this.getVarSetting('rotationDeg') * flag;
            let transform = `rotate(${deg}deg)`;
            if (deg == 0 || deg == 180 * flag) {
                transform += ` scale(1)`;
            } else {
                transform += ` scale(${h5Player.videoHeight / h5Player.videoWidth})`;
            }
            this.setH5PlayerRransform(transform);
        },
        setH5PlayerRransform(transform) {
            this.h5Player.css('-webkit-transform', transform)
                .css('-moz-transform', transform)
                .css('-ms-transform', transform)
                .css('-o-transform', transform)
                .css('transform', transform);
        },
        getTransformCss(e) {
            return e.getCss('-webkit-transform') || e.getCss('-moz-transform') || e.getCss('-ms-transform') || e.getCss('-o-transform') || 'none';
        },
        getRotationDeg(e) {
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
        addStyle(css, id) {
            id = id ? `id=${id}` : '';
            q('head').append(`<style ${id} type="text/css">${css}</style>`);
        },
        removeStyle(styleId) {
            const styleNode = q(styleId)[0];
            styleNode && styleNode.parentNode.removeChild(styleNode);
        },
        initSettingHTML() {
            if (q('#quick-do-setting-panel')[0]) {
                return;
            }
            this.isNew = q('.bilibili-player-video-btn-setting').mouseover()[0];
            this.isBangumi = window.location.href.indexOf('bangumi') >= 0;
            this.isNewBangumi = this.isBangumi && this.isNew;
            this.isWatchlater = window.location.href.indexOf('watchlater') >= 0;
            let panel = q('.bilibili-player-video-btn-setting-right-others-content');
            q('.bilibili-player-video-btn-setting-panel').css('height', 'auto').css('display', 'none');
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
            }
            q('#quick-do-setting-panel').append(`
                <span id="quick-do-setting-sycn-btn" style="display: inline-block;width: 100%;float: left;">同步新版配置到旧版</span>
            `);
            q('#quick-do-setting-sycn-btn').on('click', () => confirm("确认同步?") && this.syncNewConfig2Old());
            this.initKeySettingHTML();
            this.initVarSettingHTML();
        },
        initCheckboxHTML(panel, configName, options, btn) {
            if (btn) {
                panel.append(`<div id="quick-do-${configName}-panel" class="bilibili-player-video-btn-setting-panel-others-content" style="display: none;width: 100%;float: left;"></div>`);
                panel.append(`<span id="quick-do-${configName}-btn" style="display: inline-block;width: 100%;float: left;">${btn}</span>`);
                panel = q(`#quick-do-${configName}-panel`);
                q(`#quick-do-${configName}-btn`).on('click', () => panel.getCss('display') == 'none' ? panel.css('display', 'block') : panel.css('display', 'none'));
            }
            for (let [key, { text, status, ban, fn, tips }] of Object.entries(options)) {
                const checkboxId = `cb-${key}`;
                panel.append(this.isNew ? this.getNewSettingHTML(checkboxId, text, tips) : this.getSettingHTML(checkboxId, text, tips));
                if (this.getCheckboxSetting(key) === undefined) {
                    this.saveCheckboxSetting(key, status);
                }
                const checked = this.getCheckboxSetting(key) === ON;
                const checkbox = q(`#${checkboxId}`);
                checked && this.isNew ? checkbox.click() : q(`#${checkboxId}-lable`).toggleClass('bpui-state-active', checked);
                checkbox.on('click', () => {
                    const gmvalue = this.getCheckboxSetting(key) === ON ? OFF : ON;
                    this.saveCheckboxSetting(key, gmvalue);
                    gmvalue === ON && ban && ban.forEach((k,i) => this.getCheckboxSetting(k) === ON && q(`#cb-${k}`).click());
                    !this.isNew && q(`#${checkboxId}-lable`).toggleClass('bpui-state-active', gmvalue === ON);
                    fn && this[fn](gmvalue === ON);
                });
                fn && this[fn](checked);
                if (tips) {
                    const tipsNode = q(`#${checkboxId}-tips`);
                    let tipsTimer;
                    checkbox.on('mouseover', () => {
                            tipsTimer = setTimeout(() => tipsNode.css('display', 'block'), 300);
                        })
                        .on('mouseout', () => {
                            clearTimeout(tipsTimer);
                            tipsNode.css('display', 'none')
                        });
                }
            }
        },
        getSettingHTML(checkboxId, text, tips) {
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
        getNewSettingHTML(checkboxId, text, tips) {
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
        initKeySettingHTML() {
            const color = this.isNew ? 'black' : 'white';
            q('#quick-do-setting-panel').append(`
                <span id="quick-do-setting-key-btn" style="display: inline-block;width: 100%;float: left;">快捷键设置</span>
                <div id="quick-do-setting-key-panel" style="display: none;position: absolute;right: 0px;bottom: 60px;background-color: ${color};padding: 10px;text-align: left;z-index: 1;border: 3px double #222;">
                <div style="text-align: center">a-z [ ] \\ ; ' , . / - = enter ↑ ↓ ← → 空格</div>
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
                    const isGlobalHotKey = this.isGlobalHotKey(e.keyCode);
                    const key = isGlobalHotKey || e.key.toLowerCase();
                    const isA2Z = e.keyCode >= 65 && e.keyCode <= 90;
                    const isSymbol = "[]\\;',./-=".indexOf(key) > -1;
                    if ((isGlobalHotKey || isA2Z || isSymbol || e.keyCode === this.keyCode.enter) && this.keyCode[key]) {
                        input.val(key)
                    }
                    const isDelete = e.keyCode == 8 || e.keyCode == 46;
                    (!isDelete || isGlobalHotKey) && e.preventDefault();
                }).on('keyup', e => this.saveQuickDoKey(key, input.val())).on('click', e => {
                    input.select();
                    e.preventDefault();
                });
            }
        },
        getKeySettingHTML(inputId, text, value) {
            return `
            <div style="float: left;width: 50%;">
                <input id="${inputId}" value="${value}" maxlength=1 style="display: inline-block;width: 30px;"></input>
                <span>${text}</span>
            </div>`;
        },
        getNewKeySettingHTML(inputId, text, value) {
            return `
            <div class="bilibili-player-fl bui bui-dark" style="width: 50%;">
                <input type="input" id="${inputId}" value="${value}" maxlength=1 style="display: inline-block;width: 30px;color: black;"></input>
                <span>${text}</span>
            </div>`;
        },
        initVarSettingHTML() {
            const color = this.isNew ? 'black' : 'white';
            q('#quick-do-setting-panel').append(`
                <span id="quick-do-setting-var-btn" style="display: inline-block;width: 100%;float: left;">变量设置</span>
                <div id="quick-do-setting-var-panel" style="display: none;position: absolute;right: 0px;bottom: 40px;background-color: ${color};padding: 10px;text-align: left;z-index: 1;border: 3px double #222;">
                <div style="text-align: center">非B站默认快捷键的变量</div>
                </div>
            `);
            const keyPanel = q('#quick-do-setting-var-panel');
            q('#quick-do-setting-var-btn').on('click', () => keyPanel.getCss('display') == 'none' ? keyPanel.css('display', 'block') : keyPanel.css('display', 'none'));
            for (let [key, { value, text }] of Object.entries(this.config.variable)) {
                value = this.getVarSetting(key);
                const inputId = `qd-var-input-${key}`;
                keyPanel.append(this.isNew ? this.getNewVarSettingHTML(inputId, text, value) : this.getVarSettingHTML(inputId, text, value));
                const varInput = q(`#${inputId}`);
                varInput.on('blur', () => this.saveVarSetting(key, varInput.val()) || varInput.val(this.getVarSetting(key)) ).on('click', e => {
                    varInput.select();
                    e.preventDefault();
                }).on('keydown', e => e.stopPropagation());
            }
        },
        getVarSettingHTML(inputId, text, value) {
            return `
            <div style="float: left;width: 100%;">
                <input id="${inputId}" value="${value}" maxlength=5 style="display: inline-block;width: 30px;"></input>
                <span>${text}</span>
            </div>`;
        },
        getNewVarSettingHTML(inputId, text, value) {
            return `
            <div class="bilibili-player-fl bui bui-dark" style="width: 100%;">
                <input type="input" id="${inputId}" value="${value}" maxlength=5 style="display: inline-block;width: 30px;color: black;"></input>
                <span>${text}</span>
            </div>`;
        },
        checkHint(auto = false) {
            return auto ? this.getCheckboxSetting('autoHint') === ON : this.getCheckboxSetting('hint') === ON;
        },
        showHint(info, auto = false) {
            if (!this.checkHint(auto)) {
                return;
            }
            clearTimeout(this.hintTimer);
            q('div.bilibili-player-infoHint').css('opacity', 1).css('display', 'block');
            q('span.bilibili-player-infoHint-text')[0].innerHTML = info;
            this.hintTimer = setTimeout(() => q('div.bilibili-player-infoHint').css('opacity', 0).css('display', 'none'), 1E3);
        },
        initDanmuStyle(status) {
            const styleNode = q('#qd-danmuColor')[0];
            if (!status) {
                styleNode && styleNode.parentNode.removeChild(styleNode);
            } else if (!styleNode) {
                const css = '.bilibili-danmaku{color:rgb(255, 255, 255)!important;}';
                this.addStyle(css, 'qd-danmuColor');
            }
        },
        videoEndedHander() {
            this.repeatEnd = this.repeatStart = undefined;
            if (this.getCheckboxSetting('autoJumpContent') === ON) {
                setTimeout(() => this.jumpContent(), 0);
            }
            if (this.isRepeatPlay()) {
                return;
            }
            if (this.getNewPart(true)) {
                this.reload = this.getCheckboxSetting('reloadPart') === ON;
                return;
            }
            if (this.getCheckboxSetting('lightOn') === ON && this.isLightOff()) {
                this.lightOff();
            }
            if (this.getCheckboxSetting('exitScreen') === ON) {
                this.playerMode(DEFAULT);
            } else if (this.getCheckboxSetting('exit2WideScreen') === ON) {
                this.playerMode(WIDESCREEN);
            }
            this.reload = true;
        },
        newVersionPalyerStyleHander() {
            this.danmuList();
            this.initPlayerStyle();
            this.danmukuBoxAfterMultiPage();
            this.bottomTitle();
        },
        init() {
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
                        this.reload = true;
                        console.log('bilibili-quickdo init done');
                    } else if (target.hasClass('bilibili-player-video')) {
                        this.h5Player = q('#bilibiliPlayer  .bilibili-player-video video');
                    } else if (this.repeatEnd && this.repeatStart && target.hasClass('bilibili-player-video-time-now')
                               && this.repeatEnd <= this.h5Player[0].currentTime) {
                        this.h5Player[0].currentTime = this.repeatStart;
                    } else if (target.hasClass('bilibili-player-video-top-follow-text')) {
                        debounce(this.newVersionPalyerStyleHander, 100);
                    } else if (mutation.target.id) {
                        if (mutation.target.id == 'v_desc') {
                            this.moreDescribe();
                        }
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
