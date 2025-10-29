// --- SCRIPT LOGIC ---
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

document.addEventListener('DOMContentLoaded', function() {

    const mainContentArea = document.querySelector('main');
    const contentPanels = document.querySelectorAll('.content-panel');
    const navLinks = document.querySelectorAll('.nav-link');
    const simModal = document.getElementById('simulation-modal');
    const closeSimModalBtn = document.getElementById('close-modal-btn');
    const simulationIframe = document.getElementById('simulation-iframe');
    const pdfModal = document.getElementById('pdf-modal');
    const closePdfModalBtn = document.getElementById('close-pdf-modal-btn');
    const pdfCanvas = document.getElementById('pdf-canvas');
    const pdfLoading = document.getElementById('pdf-loading');
    const pdfControls = document.getElementById('pdf-controls');
    const pdfPrevBtn = document.getElementById('pdf-prev-btn');
    const pdfNextBtn = document.getElementById('pdf-next-btn');
    const pdfPageNum = document.getElementById('pdf-page-num');
    const pdfDownloadLink = document.getElementById('pdf-download-link');

    let currentLang = 'pt';
    let currentPageId = 'homepage'; // Keep track of the currently visible page
    let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null;
    const pdfScale = 1.5, pdfCtx = pdfCanvas.getContext('2d');

    // --- NEW FUNCTION: Contact Form Logic ---
// --- NEW FUNCTION: Contact Form Logic ---
    function setupContactForm() {
        const showBtn = document.getElementById('show-contact-form-btn');
        const formWrapper = document.getElementById('contact-form-wrapper');
        const form = document.getElementById('contactForm');
        const statusDiv = document.getElementById('form-status');
        const charCounter = document.getElementById('char-counter');
        const messageTextarea = document.getElementById('message');

        // --- FIX: Find the submit button ---
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

        if (!showBtn || !formWrapper || !form || !statusDiv || !charCounter || !messageTextarea || !submitBtn) {
            // If elements aren't on the page (e.g., wrong page), do nothing
            return;
        }

        // --- START OF FIX ---
        // Manually set text/content for dynamically injected elements
        // This is necessary because the footer's innerHTML is set by the parent
        // [data-key="network.footer"], and the [data-key] attributes
        // on the buttons themselves are missed by the initial querySelectorAll.
        const content = i18nData[currentLang].contact;
        if (content) {
            showBtn.textContent = content.showButton;
            submitBtn.textContent = content.submitButton;

            // Also update char counter initial text
            const maxChars = 500;
            const remaining = maxChars - messageTextarea.value.length;
            const counterText = (content.charCounter || "500 characters remaining").replace("500", remaining);
            charCounter.textContent = counterText;
        }
        // --- END OF FIX ---


        // 1. Show/Hide toggle
        showBtn.addEventListener('click', () => {
            showBtn.classList.add('hidden');
            formWrapper.classList.add('open');
        });

        // 2. Character counter
        const maxChars = 500; // This is fine to keep, as it's used by the input listener
        messageTextarea.addEventListener('input', () => {
            const remaining = maxChars - messageTextarea.value.length;
            // Use i18nData directly in case 'content' wasn't defined yet (though it should be)
            const i18nContent = i18nData[currentLang].contact;
            const counterText = (i18nContent.charCounter || "500 characters remaining").replace("500", remaining);
            charCounter.textContent = counterText;
            charCounter.classList.toggle('text-red-400', remaining < 20);
        });

        // 3. Form submission logic
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = i18nData[currentLang].contact;

            // Show sending status
            statusDiv.textContent = content.sending || "Sending...";
            statusDiv.className = 'mt-3 text-sm text-slate-300'; // Reset classes

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('https://formservice-production.up.railway.app/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (result.status === 'ok') {
                    // Success
                    statusDiv.textContent = content.success || "Thank you! Your message has been sent.";
                    statusDiv.classList.add('text-green-400');
                    form.reset();
                    // Reset counter text
                    charCounter.textContent = (content.charCounter || "500 characters remaining").replace("500", maxChars);
                    // Hide form and show button again after 3 seconds
                    setTimeout(() => {
                        formWrapper.classList.remove('open');
                        showBtn.classList.remove('hidden');
                        statusDiv.textContent = '';
                    }, 3000);
                } else {
                    // Handle server-side error
                    throw new Error(result.message || 'Server error');
                }
            } catch (error) {
                // Handle network or fetch error
                console.error('Form submission error:', error);
                statusDiv.textContent = content.error || "Error: Could not send message. Please try again.";
                statusDiv.classList.add('text-red-400');
            }
        });
    }
    // --- END OF NEW FUNCTION ---

    function generateThresholds(codexId, lang) {
        const container = document.getElementById(`${codexId}-thresholds-container`);
        if (!container) return;

        const codexDataKey = codexId.replace(/-/g, '_');
        const codexData = i18nData[lang][codexDataKey];
        if (!codexData || !codexData.thresholds) {
             container.innerHTML = ''; // Clear if no data
             return;
        }

        container.innerHTML = codexData.thresholds.map((threshold, index) => `
            <div class="threshold-card p-6 rounded-r-lg">
                <div class="flex justify-between items-start cursor-pointer" onclick="this.parentElement.classList.toggle('expanded')">
                    <div>
                        <p class="text-sm font-semibold" style="color: var(--light-accent);">THRESHOLD ${index + 1}</p>
                        <h3 class="font-space text-2xl font-bold mt-1 mb-2" style="color: var(--deep-ocean);">${threshold.title}</h3>
                        <div class="text-slate-400 space-y-3"><p>${threshold.summary}</p></div>
                    </div>
                    <div class="toggle-icon text-2xl" style="color: var(--deep-ocean);">+</div>
                </div>
                <div class="expandable-content">
                    <p class="border-t border-purple-900/50 pt-4 mt-4 text-slate-300">${threshold.details}</p>
                </div>
            </div>
        `).join('');
    }

    function generatePrinciples(lang) {
        const container = document.getElementById('models-principles-container');
        if (!container) return;

        const principles = i18nData[lang]?.models?.principles;
        if (!principles || !Array.isArray(principles)) {
            container.innerHTML = ''; // Clear if no data
            return;
        }

        container.innerHTML = principles.map(principle => `
            <div class="bg-black/20 p-6 rounded-lg border border-purple-900/50">
                <h3 class="font-space text-xl font-bold mb-3" style="color: var(--light-accent);">${principle.title}</h3>
                <p class="text-slate-400">${principle.text}</p>
            </div>
        `).join('');
    }

    // --- UPDATED FUNCTION ---
    function generateModels(lang) {
        const container = document.getElementById('models-simulations-container');
        if (!container) return;

        // --- FIX: Changed path from models.models to models.specific_models ---
        const models = i18nData[lang]?.models?.specific_models;
        // --- END FIX ---

        if (!models || !Array.isArray(models)) {
            container.innerHTML = ''; // Clear container if no models found
            return;
        }

        container.innerHTML = models.map((model, index) => `
            <div class="simulation-viewport scroll-reveal">
                <h2 class="font-space text-3xl font-bold mb-4" style="color: var(--deep-ocean);">${model.title}</h2>
                <div class="space-y-6 text-slate-400 max-w-4xl text-lg">${model.text}</div>
                <!-- Optional: Add iframe back if needed for each model -->
                
                <div class="aspect-video w-full rounded-lg shadow-2xl border-2 border-purple-900/50 overflow-hidden bg-black/20 mt-8">
                    <iframe src="onion.html" class="w-full h-full" frameborder="0" title="${model.title} Simulation"></iframe>
                </div>
                
            </div>
        `).join('');

        // Re-observe newly added elements
        const newRevealElements = container.querySelectorAll('.scroll-reveal');
        newRevealElements.forEach(el => {
            el.classList.remove('visible'); // Ensure they animate in
            observer.observe(el);
        });
    }
    // --- END UPDATED FUNCTION ---


    function generateExpandableSections(lang, dataKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let sections = i18nData[lang].origin;
        dataKey.split('.').forEach(key => {
            sections = sections ? sections[key] : undefined;
        });

        if(!sections) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = sections.map((section) => `
            <div class="threshold-card p-6 sm:p-8 rounded-lg">
                <div class="flex justify-between items-start cursor-pointer" onclick="this.parentElement.classList.toggle('expanded')">
                    <div>
                        <h3 class="font-space text-2xl sm:text-3xl font-bold mt-1 mb-3" style="color: var(--deep-ocean);">${section.title}</h3>
                        <div class="text-slate-400 text-lg">${section.preview}</div>
                    </div>
                    <div class="toggle-icon text-2xl ml-4 flex-shrink-0" style="color: var(--deep-ocean);">+</div>
                </div>
                <div class="expandable-content">
                    <div class="space-y-6 text-slate-300 text-lg leading-relaxed border-t border-purple-900/50">
                        ${section.full_text}
                    </div>
                </div>
            </div>
        `).join('');
    }

    function generateInstruments(lang) {
        const instrumentsData = i18nData[lang]?.instruments;
        if (!instrumentsData) return;

        const foundationalContainer = document.getElementById('foundational-instruments-container');
        const appliedContainer = document.getElementById('applied-instruments-container');

        if (!foundationalContainer || !appliedContainer) return;

        const createInstrumentCard = (instrument) => {
            const details = instrument.details;
            const isExternal = instrument.demo_link && instrument.demo_link.startsWith('http');
            const linkTarget = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

            let demoButtonText = '→ Ver Demo';
            if (lang === 'en') {
                demoButtonText = isExternal ? '→ Visit' : '→ View Demo';
            } else {
                demoButtonText = isExternal ? '→ Acessar' : '→ Ver Demo';
            }

            // Get the keys for the detail labels
            // Using a fallback text in case keys are not in content.js (though they should be)
            const purposeLabel = i18nData[lang].instruments?.details_purpose || "Purpose";
            const whatLabel = i18nData[lang].instruments?.details_what || "What it is";
            // --- FIX: Changed i18nData[lang].prototypes to i18nData[lang].instruments ---
            const whyLabel = i18nData[lang].instruments?.details_why || "Why it matters";
            const useLabel = i18nData[lang].instruments?.details_use_case || "Use Case";
            // --- END FIX ---


            const demoButton = instrument.demo_link
                ? `<a href="${instrument.demo_link}" class="action-btn inline-block font-space font-semibold px-5 py-2 rounded-lg mt-6" ${linkTarget} style="background-color: var(--deep-ocean); color: #050505;">${demoButtonText}</a>`
                : '';

            return `
            <article class="instrument-card p-6 rounded-r-lg scroll-reveal">
                <header class="flex justify-between items-start gap-4 cursor-pointer" onclick="this.closest('.instrument-card').classList.toggle('expanded')">
                    <div class="flex-grow">
                        <h4 class="font-space text-2xl sm:text-3xl font-bold tracking-tight" style="color: var(--dende-gold);">${instrument.title}</h4>
                        <p class="mt-3 text-slate-300 text-lg leading-relaxed">${instrument.desc}</p>
                    </div>
                    <div class="toggle-icon text-2xl flex-shrink-0 cursor-pointer" style="color: var(--deep-ocean);">+</div>
                </header>
                <div class="expandable-content border-t border-purple-900/50 text-slate-300">
                    <div class="space-y-5 text-lg leading-relaxed">
                        <div><strong class="font-semibold text-slate-100">${purposeLabel}:</strong> ${details.purpose}</div>
                        <div><strong class="font-semibold text-slate-100">${whatLabel}:</strong> ${details.what}</div>
                        <div><strong class="font-semibold text-slate-100">${whyLabel}:</strong> ${details.why}</div>
                        <div><strong class="font-semibold text-slate-100">${useLabel}:</strong> ${details.use}</div>
                        ${demoButton}
                    </div>
                </div>
            </article>
            `;
        };

        foundationalContainer.innerHTML = instrumentsData.foundational.map(createInstrumentCard).join('');
        appliedContainer.innerHTML = instrumentsData.applied.map(createInstrumentCard).join('');

        const newRevealElements = document.querySelectorAll('#prototypes-content .scroll-reveal');
        newRevealElements.forEach(el => {
            el.classList.remove('visible');
            observer.observe(el);
        });
    }

    // --- MODIFIED FUNCTION ---
    function setLanguage(lang) {
        currentLang = lang;
        const data = i18nData[lang];
        document.documentElement.lang = lang;
        localStorage.setItem('mutelogic_lang', lang);

        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.dataset.key;
            const keyParts = key.split('.');
            let value = data;
            try {
                for (const part of keyParts) {
                    value = value[part];
                }
                if (typeof value === 'string') {
                     el.innerHTML = value;
                }
            } catch (e) {
               // Key might not exist
            }
        });

        // --- NEW: Handle placeholder keys ---
        document.querySelectorAll('[data-placeholder-key]').forEach(el => {
            const key = el.dataset.placeholderKey;
            const keyParts = key.split('.');
            let value = data;
             try {
                for (const part of keyParts) {
                    value = value[part];
                }
                if (typeof value === 'string') {
                     el.placeholder = value;
                }
            } catch (e) {
                // Key might not exist
            }
        });
        // --- END OF NEW BLOCK ---

        generateThresholds('ecology-of-minds', lang);
        generateThresholds('integrity-geometry', lang);
        generateThresholds('topology-of-learning', lang);
        generateExpandableSections(lang, 'mechanism_manifest.sections', 'mechanism-sections-container');
        generateExpandableSections(lang, 'topology_fragility.sections', 'dualism-sections-container');

        generatePrinciples(lang);
        generateModels(lang);
        generateInstruments(lang);

        // --- MODIFIED BLOCK ---
        if (currentPageId === 'network') {
            // 1. Update char counter text
            const charCounter = document.getElementById('char-counter');
            const messageTextarea = document.getElementById('message');
            if (charCounter && messageTextarea) {
                const maxChars = 500;
                const remaining = maxChars - messageTextarea.value.length;
                const counterText = (data.contact.charCounter || "500 characters remaining").replace("500", remaining);
                charCounter.textContent = counterText;
            }
            // 2. Re-attach event listeners since the footer was re-rendered
            setupContactForm();
        }
        // --- END OF MODIFIED BLOCK ---

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }
    // --- END OF MODIFIED FUNCTION ---

    // --- MODIFIED FUNCTION ---
function showContent(contentId) {
    if (currentPageId === 'models' && contentId !== 'models') {
        const onionIframe = document.querySelector('#models-content iframe');
        if (onionIframe && onionIframe.contentWindow) {
            onionIframe.contentWindow.postMessage('stopSound', '*');
        }
    }

    currentPageId = contentId;

    contentPanels.forEach(panel => panel.classList.add('hidden'));
    navLinks.forEach(link => link.classList.remove('active'));

    const targetPanel = document.getElementById(`${contentId}-content`);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
        const revealElements = targetPanel.querySelectorAll('.scroll-reveal');
        revealElements.forEach(el => observer.observe(el));
    }

    let activeLink = document.querySelector(`.nav-link[data-content="${contentId}"]`);
    if (!activeLink) {
        if (contentId.includes('ecology') || contentId.includes('integrity') || contentId.includes('topology')) {
            activeLink = document.querySelector(`.nav-link[data-content="manuscripts"]`);
        }
    }
    if (activeLink) activeLink.classList.add('active');

    mainContentArea.scrollTop = 0;

    // --- NEW: Setup form logic when network page is shown ---
    if (contentId === 'network') {
        setupContactForm();
    }
    // --- END OF NEW BLOCK ---

    // 🧩 NEW: Generate Instrument cards when the Instrumentos section is shown
    if (contentId === 'prototypes') {
        generateInstruments(currentLang);
    }
    // --- END OF NEW BLOCK ---
}

    // --- END OF MODIFIED FUNCTION ---

    function openSimModal(src) {
        simulationIframe.src = src;
        simModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeSimModal() {
        simModal.classList.add('hidden');
        simulationIframe.src = '';
        document.body.style.overflow = '';
    }

    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: pdfScale });
            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;

            const renderTask = page.render({ canvasContext: pdfCtx, viewport: viewport });
            renderTask.promise.then(() => {
                pageRendering = false;
                if (pageNumPending !== null) { renderPage(pageNumPending); pageNumPending = null; }
                pdfLoading.classList.add('hidden');
                pdfCanvas.classList.remove('hidden');
                pdfControls.classList.remove('hidden');
            });
        });
        pdfPageNum.textContent = `Page ${num} of ${pdfDoc.numPages}`;
        pdfPrevBtn.disabled = num <= 1;
        pdfNextBtn.disabled = num >= pdfDoc.numPages;
    }

    function queueRenderPage(num) {
        if (pageRendering) { pageNumPending = num; } else { renderPage(num); }
    }

    function openPdfModal(url) {
        pdfModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        pdfLoading.classList.remove('hidden');
        pdfCanvas.classList.add('hidden');
        pdfControls.classList.add('hidden');
        pdfDownloadLink.href = url;
        pdfDownloadLink.download = url.split('/').pop();

        pdfjsLib.getDocument(url).promise.then(doc => {
            pdfDoc = doc; pageNum = 1; renderPage(pageNum);
        }).catch(err => {
            pdfLoading.textContent = "Error loading Codex."; console.error("Error loading PDF:", err);
        });
    }

    function closePdfModal() {
        pdfModal.classList.add('hidden');
        document.body.style.overflow = '';
        pdfDoc = null;
    }

    document.body.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            const manuscriptTile = e.target.closest('.manuscript-tile');
            // const toggleParent = e.target.closest('.instrument-card, .threshold-card'); // <-- DELETE THIS
            const codexPdfBtn = e.target.closest('.read-codex-pdf-btn');

            if (navLink) {
                e.preventDefault();
                showContent(navLink.dataset.content);
            } else if (manuscriptTile) {
                showContent(manuscriptTile.dataset.content);

            // --- THE CONFLICTING BLOCK IS NOW GONE ---

            } else if (codexPdfBtn) {
                e.preventDefault();
                const pdfBase = codexPdfBtn.dataset.pdfBase;
                if (pdfBase) {
                    const pdfUrl = `documents/${pdfBase}_${currentLang}.pdf`;
                    openPdfModal(pdfUrl);
                } else if (codexPdfBtn.dataset.pdf) {
                    openPdfModal(codexPdfBtn.dataset.pdf);
                }
            }
        });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    closeSimModalBtn.addEventListener('click', closeSimModal);
    closePdfModalBtn.addEventListener('click', closePdfModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeSimModal(); closePdfModal(); }
    });
    pdfPrevBtn.addEventListener('click', () => { if (pageNum > 1) { pageNum--; queueRenderPage(pageNum); } });
    pdfNextBtn.addEventListener('click', () => { if (pageNum < pdfDoc.numPages) { pageNum++; queueRenderPage(pageNum); } });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: mainContentArea,
        threshold: 0.1
    });

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    const homeVideo = document.getElementById('home-video');
    if (homeVideo) {
        try {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const slowConnections = ['slow-2g', '2g', '3g'];

            if (connection && slowConnections.includes(connection.effectiveType)) {
                console.log('Slow connection detected. Showing static image instead of video.');
            } else {
                homeVideo.play().catch(error => {
                    console.warn('Video autoplay was prevented by the browser. User interaction may be required.', error);
                });
            }
        } catch (e) {
            console.warn('Could not check connection type. Attempting video playback.', e);
            homeVideo.play().catch(error => {
                console.warn('Video autoplay was prevented by the browser.', error);
            });
        }
    }

    const savedLang = localStorage.getItem('mutelogic_lang') || 'pt';
    setLanguage(savedLang);
    showContent('homepage');

    const btn = document.getElementById('ml-menu-btn');
    const sidebar = document.getElementById('ml-sidebar');

    if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
      requestAnimationFrame(() => {
        sidebar.classList.toggle('-translate-x-full');
      });
    });
    sidebar.querySelectorAll('a.nav-link').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          sidebar.classList.add('-translate-x-full');
          setTimeout(()=>sidebar.classList.add('hidden'), 300);
        }
      });
    });
    }
});

