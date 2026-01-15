/* 2025-10-29 03:39 PM */
const CanvasExpress = (() => {
    'use strict';

    let config = {};
    let isV0 = false;
    const effects = {};
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const canvasManager = {
        slideInterval: null,
        slideImages: [],
        slideOrder: [],
        currentSlideIndex: 0,
        indicatorsContainer: null,
        indicatorDots: [],

        init() {
            const type = config.canvas_image_type || 'none';
            document.body.dataset.imageType = type;
            const hasImage = config.canvas_image_count > 0 && config.canvas_image_path;
            const slideDuration = parseInt(config.canvas_image_slide, 10) || 0;

            if (slideDuration > 0 && config.canvas_image_count > 1) {
                this.initSlideshow(slideDuration);
            } else if (hasImage) {
                this.initStaticImage(type);
            }

            if (config.canvas_effect && effects[config.canvas_effect]) {
                effects[config.canvas_effect].init();
            }
        },

        initStaticImage(type) {
            const imgNum = Math.floor(Math.random() * config.canvas_image_count) + 1;
            const imgSrc = this.getImageSrc(imgNum);

            if (type === 'cover') {
                const img = document.createElement('img');
                img.id = 'bg-image';
                img.src = imgSrc;
                img.alt = "";
                img.onload = () => img.classList.add('loaded');
                $('body').prepend(img);
            } else if (type === 'repeat') {
                const dottedBg = $('.dotted-bg');
                if (dottedBg) {
                    dottedBg.style.backgroundImage = `url(${imgSrc})`;
                    dottedBg.style.backgroundSize = 'auto';
                }
            }
        },

        initSlideshow(duration) {
            const container = document.createElement('div');
            container.className = 'bg-image-slider';
            
            this.slideImages = [document.createElement('img'), document.createElement('img')];
            this.slideImages.forEach(img => {
                img.className = 'bg-image-item';
                img.alt = "";
                container.appendChild(img);
            });
            
            $('body').prepend(container);
            
            if (config.canvas_indicators === true && config.canvas_image_count > 1) {
                this.indicatorsContainer = document.createElement('div');
                this.indicatorsContainer.className = 'slide-indicators';
                
                const fragment = document.createDocumentFragment();
                for (let i = 0; i < config.canvas_image_count; i++) {
                    const dot = document.createElement('span');
                    this.indicatorDots.push(dot);
                    fragment.appendChild(dot);
                }
                this.indicatorsContainer.appendChild(fragment);
                $('body').appendChild(this.indicatorsContainer);
            }
            
            this.slideOrder = this.createShuffleList(config.canvas_image_count);
            this.currentSlideIndex = 0;
            
            this.runSlide(true);
            
            this.slideInterval = setInterval(() => this.runSlide(false), duration * 1000);
        },
        
        runSlide(isFirstRun = false) {
            if (!this.slideOrder.length) return;

            const imgNum = this.slideOrder[this.currentSlideIndex];
            const imgSrc = this.getImageSrc(imgNum);

            const activeImg = this.slideImages.find(img => img.classList.contains('active'));
            const inactiveImg = this.slideImages.find(img => !img.classList.contains('active'));

            if (isFirstRun && inactiveImg) {
                inactiveImg.src = imgSrc;
                inactiveImg.onload = () => inactiveImg.classList.add('active');
            } else if (activeImg && inactiveImg) {
                inactiveImg.src = imgSrc;
                inactiveImg.onload = () => {
                    activeImg.classList.remove('active');
                    inactiveImg.classList.add('active');
                };
            }
            
            if (this.indicatorsContainer && this.indicatorDots.length > 0) {
                this.indicatorDots.forEach(dot => dot.classList.remove('active'));
                if (this.indicatorDots[this.currentSlideIndex]) {
                    this.indicatorDots[this.currentSlideIndex].classList.add('active');
                }
            }
            
            this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slideOrder.length;
        },

        createShuffleList(count) {
            const list = Array.from({ length: count }, (_, i) => i + 1);
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            return list;
        },
        
        getImageSrc(imgNum) {
            const format = config.canvas_image_format || 'webp';
            return `${config.canvas_image_path}${imgNum}.${format}`;
        }
    };
    
    const uiManager = {
        init() {
            this.injectIconButtons();
            this.injectFooterLogo();
        },
        injectFooterLogo() {
            const logoLink = document.createElement('a');
            logoLink.href = 'https://www.dam.so';
            logoLink.className = 'canvas-express-footer-logo';
            logoLink.target = '_blank';
            logoLink.rel = 'noopener noreferrer';
            logoLink.setAttribute('aria-label', 'Damso Home');

            const logoImg = document.createElement('img');
            logoImg.src = 'https://cdn.dam.so/_image/css/damso-symbol-mobile.png';
            logoImg.alt = 'Damso Logo';

            logoLink.appendChild(logoImg);
            document.body.appendChild(logoLink);
        },
        injectIconButtons() {
            const container = $('#buttons-container');
            if (!container) return;
            
            container.classList.add(isV0 ? 'buttons-v0' : 'buttons-v1');
            
            if (!config.icon_buttons || config.icon_buttons.length === 0) {
                return;
            }
            
            const btnClass = isV0 ? 'icon-button' : 'fab';
            const fragment = document.createDocumentFragment();
            config.icon_buttons.forEach(btn => {
                const el = document.createElement('a');
                el.href = btn.url;
                el.className = btnClass;
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
                el.ariaLabel = btn.name;
                el.innerHTML = `<span translate="no" class="material-symbols-outlined notranslate icon-color">${btn.icon}</span>`;
                fragment.appendChild(el);
            });
            container.appendChild(fragment);
        },
        toggleButtonState(btn, isLoading) {
            if (!btn) return;
            btn.disabled = isLoading;
            btn.querySelector('.btn-text')?.classList.toggle('hidden', isLoading);
            btn.querySelector('.btn-loader')?.classList.toggle('hidden', !isLoading);
        },
        setStatusMessage(element, message, color) {
            if (!element) return;
            element.textContent = message;
            element.style.color = color;
            element.style.display = message ? 'block' : 'none';
        }
    };

    const createCooldownManager = (options) => {
        let cooldownUntil = 0; let timer = null;
        const { key, duration, statusElement, messageFn } = options;
        
        const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

        return {
            init() { 
                const stored = localStorage.getItem(key); 
                if (stored && parseInt(stored) > Date.now()) { 
                    cooldownUntil = parseInt(stored); 
                    this.start();
                } 
            },
            isActive: () => Date.now() < cooldownUntil,
            set() { cooldownUntil = Date.now() + duration; localStorage.setItem(key, cooldownUntil); },
            stop,
            start() {
                stop();
                if (!statusElement || !this.isActive()) return;

                const update = () => {
                    const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
                    if (remaining > 0) {
                        uiManager.setStatusMessage(statusElement, messageFn(remaining), '#F59E0B');
                    } else {
                        uiManager.setStatusMessage(statusElement, '', '');
                        stop();
                    }
                };
                update();
                timer = setInterval(update, 1000);
            }
        };
    };

    const viewManager = {
        init() {
            this.main = $('main');
            this.views = $$('.view');
            $('#contact-btn')?.addEventListener('click', () => this.open('contact'));
            $$('.view-close-btn').forEach(el => el.addEventListener('click', () => this.closeAll()));
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAll(); });
        },
        open(type, content) {
            this.main.classList.add('view-active', `${type}-active`);
            this.views.forEach(v => v.classList.remove('active'));
            const view = $(`#${type}-view`);
            if (view) {
                view.classList.add('active');
                if (content) {
                    const area = view.querySelector('.result-area');
                    if (area) area.innerHTML = content;
                }
            }
        },
        closeAll() {
            this.main.className = 'main-container';
            this.views.forEach(v => v.classList.remove('active'));
            $('#search-view')?.classList.add('active');
            const resultArea = $('#search-result-view .result-area');
            if (resultArea) resultArea.innerHTML = '';
        }
    };
    
    const turnstileManager = {
        widgetId: null,
        isExecuting: false,

        render() { 
            if (typeof turnstile !== 'undefined' && config.TURNSTILE_SITE_KEY) { 
                this.widgetId = turnstile.render('#turnstile-container', { 
                    sitekey: config.TURNSTILE_SITE_KEY, 
                    size: 'invisible' 
                }); 
            }
        },

        getToken() {
            return new Promise((resolve, reject) => {
                if (!this.widgetId) {
                    return reject(new Error("Turnstile is not configured or ready."));
                }
                
                if (this.isExecuting) {
                    return reject(new Error("Another CAPTCHA request is in progress. Please wait."));
                }
                
                this.isExecuting = true;

                try { 
                    turnstile.execute(this.widgetId, { 
                        callback: token => {
                            if (token) {
                                resolve(token);
                            } else {
                                this.isExecuting = false; 
                                reject(new Error("CAPTCHA challenge failed."));
                            }
                        } 
                    }); 
                } catch (e) { 
                    this.isExecuting = false; 
                    reject(new Error("Could not execute CAPTCHA.")); 
                }
            });
        },

        reset() {
            if (turnstile && this.widgetId) {
                turnstile.reset(this.widgetId);
            }
            this.isExecuting = false; 
        }
    };
    
    const api = {
        async post(endpoint, body) {
            const token = await turnstileManager.getToken();
            body['cf-turnstile-response'] = token;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'An unknown API error occurred.');
            }
            return result;
        }
    };
    
    async function handleApiFormSubmit(options) {
        const { form, button, statusEl, cooldown, getPayload, onSuccess } = options;
        if (cooldown.isActive()) { cooldown.start(); return; }
        
        cooldown.stop();
        uiManager.setStatusMessage(statusEl, '', '');
        uiManager.toggleButtonState(button, true);

        try {
            const payload = getPayload(new FormData(form));
            const result = await api.post(form.action, payload);
            cooldown.set();
            onSuccess(result, form);
        } catch (error) {
            uiManager.setStatusMessage(statusEl, error.message, 'red');
        } finally {
            uiManager.toggleButtonState(button, false);
            turnstileManager.reset();
        }
    }

    const forms = {
        init() {
            this.initSearchForm();
            this.initContactForm();
        },
        initSearchForm() {
            const form = $('#search-form');
            if (!form) return;
            const button = $('#search-btn');
            const statusEl = $('#search-status');
            const cooldown = createCooldownManager({
                key: 'searchCooldown', duration: 30000, statusElement: statusEl,
                messageFn: s => `You can search again in ${s} seconds.`
            });
            cooldown.init();
            
            form.action = '/api/conn.search';
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleApiFormSubmit({
                    form, button, statusEl, cooldown,
                    getPayload: formData => ({ key: formData.get('key') }),
                    onSuccess: result => {
                        const html = result.found ? `<p>Search: <strong>${result.key}</strong></p><div>${result.value}</div>` : `<p>${result.message}</p>`;
                        viewManager.open('search-result', html);
                    }
                });
            });

            $('#search-key')?.addEventListener('input', e => {
                const { value } = e.target;
                const filtered = value.replace(/[^a-zA-Z0-9.-]/g, '');
                const lowerCased = filtered.toLowerCase();
                if (value !== lowerCased) {
                    e.target.value = lowerCased;
                    if (filtered !== value) {
                        uiManager.setStatusMessage(statusEl, 'Only letters, numbers, periods, and hyphens are allowed.', '#F59E0B');
                        setTimeout(() => uiManager.setStatusMessage(statusEl, '', ''), 3000);
                    }
                }
            });

        },
        initContactForm() {
            const template = $('#contact-form-template');
            if (!template) return;
            $('#contact-view .view-content')?.appendChild(template.content.cloneNode(true));
            
            const form = $('#contact-form');
            if (!form) return;
            const button = form.querySelector('button[type="submit"]');
            const statusEl = form.querySelector('.contact-status');
            const cooldown = createCooldownManager({
                key: 'contactCooldown', duration: 60000, statusElement: statusEl,
                messageFn: s => `You can send another message in ${s} seconds.`
            });
            cooldown.init();

            form.action = '/api/conn.contact';
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleApiFormSubmit({
                    form, button, statusEl, cooldown,
                    getPayload: formData => ({ email: formData.get('email'), message: formData.get('message') }),
                    onSuccess: (result, f) => {
                        uiManager.setStatusMessage(statusEl, result.message, 'green');
                        f.reset();
                        const charCounter = f.querySelector('.char-counter');
                        if(charCounter) charCounter.textContent = '0/1024';
                        setTimeout(() => viewManager.closeAll(), 2000);
                    }
                });
            });

            const textarea = form.querySelector('textarea[name="message"]');
            const charCounter = form.querySelector('.char-counter');
            if (textarea && charCounter) {
                textarea.addEventListener('input', () => { charCounter.textContent = `${textarea.value.length}/1024`; });
            }
        }
    };
    
    return {
        init: (userConfig) => {
            config = userConfig;
            isV0 = document.body.classList.contains('canvas-mode-v0');
            
            canvasManager.init();
            uiManager.init();

            if (!isV0) {
                Object.values({ viewManager, forms }).forEach(module => module.init());
                
                window.onloadTurnstileCallback = () => turnstileManager.render();
                if (typeof turnstile !== 'undefined') turnstileManager.render();

                const initialView = window.location.hash.substring(1);
                if (initialView === 'contact') {
                    viewManager.open('contact');
                }
            }
        },
        registerEffect: (name, effect) => {
            effects[name] = effect;
        },
        getTurnstileToken: () => turnstileManager.getToken(),
        resetTurnstile: () => turnstileManager.reset()
    };
    
})();