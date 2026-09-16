/**
 * Client Application Logic for Grocery Price Compare
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchSpinner = document.getElementById('search-spinner');
    const pillBtns = document.querySelectorAll('.pill-btn');

    const metaBar = document.getElementById('meta-bar');
    const statTotal = document.getElementById('stat-total');
    const statConfident = document.getElementById('stat-confident');
    const statLatency = document.getElementById('stat-latency');
    const statCache = document.getElementById('stat-cache');

    const emptyState = document.getElementById('empty-state');
    
    const confidentSection = document.getElementById('confident-section');
    const confidentGrid = document.getElementById('confident-grid');
    const confidentCount = document.getElementById('confident-count');

    const likelySection = document.getElementById('likely-section');
    const likelyGrid = document.getElementById('likely-grid');
    const likelyCount = document.getElementById('likely-count');

    const unmatchedSection = document.getElementById('unmatched-section');
    const blinkitUnmatchedList = document.getElementById('blinkit-unmatched-list');
    const instamartUnmatchedList = document.getElementById('instamart-unmatched-list');
    const blinkitUnmatchedCount = document.getElementById('blinkit-unmatched-count');
    const instamartUnmatchedCount = document.getElementById('instamart-unmatched-count');

    pillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            searchInput.value = query;
            executeSearch(query);
        });
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            executeSearch(query);
        }
    });

    async function executeSearch(query) {
        setLoading(true);
        hideAllSections();

        try {
            const startTime = Date.now();
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            const clientLatency = Date.now() - startTime;

            if (!data.success) {
                alert(data.error || 'Failed to fetch price comparison data');
                setLoading(false);
                emptyState.classList.remove('hidden');
                return;
            }

            renderResults(data, clientLatency);
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Error connecting to backend server.');
            emptyState.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            searchBtn.disabled = true;
            searchSpinner.hidden = false;
        } else {
            searchBtn.disabled = false;
            searchSpinner.hidden = true;
        }
    }

    function hideAllSections() {
        emptyState.classList.add('hidden');
        metaBar.classList.add('hidden');
        confidentSection.classList.add('hidden');
        likelySection.classList.add('hidden');
        unmatchedSection.classList.add('hidden');
    }

    function renderResults(data, clientLatency) {
        metaBar.classList.remove('hidden');
        statTotal.textContent = (data.stats.totalBlinkit + data.stats.totalInstamart);
        statConfident.textContent = data.stats.confidentCount;
        statLatency.textContent = `${data.meta.totalDurationMs || clientLatency}ms`;
        statCache.textContent = data.isCached ? 'Cache Hit' : 'Live Stream';
        statCache.style.color = data.isCached ? 'var(--accent-teal)' : 'var(--success-green)';

        let hasAnyResults = false;

        // 1. Confident Matches
        if (data.matches && data.matches.length > 0) {
            hasAnyResults = true;
            confidentSection.classList.remove('hidden');
            confidentCount.textContent = data.matches.length;
            confidentGrid.innerHTML = data.matches.map(m => createMatchCardHTML(m, true)).join('');
        }

        // 2. Likely Matches
        if (data.likelyMatches && data.likelyMatches.length > 0) {
            hasAnyResults = true;
            likelySection.classList.remove('hidden');
            likelyCount.textContent = data.likelyMatches.length;
            likelyGrid.innerHTML = data.likelyMatches.map(m => createMatchCardHTML(m, false)).join('');
        }

        // 3. Unmatched & Store Status Output
        const bUnmatched = data.unmatched.blinkitOnly || [];
        const iUnmatched = data.unmatched.instamartOnly || [];
        const bStatus = data.storeStatuses ? data.storeStatuses.blinkit : { success: true };
        const iStatus = data.storeStatuses ? data.storeStatuses.instamart : { success: true };

        unmatchedSection.classList.remove('hidden');
        blinkitUnmatchedCount.textContent = bUnmatched.length;
        instamartUnmatchedCount.textContent = iUnmatched.length;

        // Render Blinkit Column
        if (bUnmatched.length > 0) {
            hasAnyResults = true;
            blinkitUnmatchedList.innerHTML = bUnmatched.map(createUnmatchedItemHTML).join('');
        } else if (!bStatus.success) {
            blinkitUnmatchedList.innerHTML = `<div class="status-warning-box">Blinkit Live Search Unavailable (${bStatus.error || 'Connection Failed'})</div>`;
        } else {
            blinkitUnmatchedList.innerHTML = `<div class="item-var" style="padding: 10px;">No Blinkit-exclusive items</div>`;
        }

        // Render Instamart Column with Transparent Store Error Notice
        if (iUnmatched.length > 0) {
            hasAnyResults = true;
            instamartUnmatchedList.innerHTML = iUnmatched.map(createUnmatchedItemHTML).join('');
        } else if (!iStatus.success) {
            instamartUnmatchedList.innerHTML = `
                <div class="status-warning-box">
                    <strong>Swiggy Instamart Live Search Blocked</strong>
                    <p style="font-size: 11px; margin-top: 4px; color: var(--text-muted);">Cloudflare bot challenge active for automated browser context. Retried ${iStatus.attempts || 2} times.</p>
                </div>
            `;
        } else {
            instamartUnmatchedList.innerHTML = `<div class="item-var" style="padding: 10px;">No Instamart-exclusive items</div>`;
        }

        if (!hasAnyResults && bStatus.success && iStatus.success) {
            emptyState.classList.remove('hidden');
        }
    }

    function createMatchCardHTML(match, isConfident) {
        const b = match.blinkit;
        const i = match.instamart;
        const comp = match.priceComparison;

        const isBlinkitCheaper = comp.cheaperStore === 'Blinkit';
        const isInstamartCheaper = comp.cheaperStore === 'Instamart';

        let deltaBannerHTML = '';
        if (isBlinkitCheaper) {
            deltaBannerHTML = `<div class="delta-banner">Blinkit is ₹${comp.priceDiff} cheaper (${comp.savingsPercentage}% lower)</div>`;
        } else if (isInstamartCheaper) {
            deltaBannerHTML = `<div class="delta-banner">Instamart is ₹${comp.priceDiff} cheaper (${comp.savingsPercentage}% lower)</div>`;
        } else {
            deltaBannerHTML = `<div class="delta-banner equal">Equal Price on Both Stores (₹${b.price})</div>`;
        }

        const sizeDisplay = b.canonicalSize.formatted !== 'Unknown Size' 
            ? b.canonicalSize.formatted 
            : (b.variantText || i.variantText || 'Standard');

        return `
            <div class="match-card">
                <div class="card-top">
                    <div class="product-title-group">
                        <h3>${b.rawTitle}</h3>
                        <span class="pack-size-tag">${sizeDisplay}</span>
                    </div>
                    <span class="confidence-tag ${isConfident ? 'high' : 'med'}">
                        ${match.confidenceScore}% Match
                    </span>
                </div>

                <div class="store-prices-row">
                    <div class="store-price-box blinkit ${isBlinkitCheaper ? 'winner' : ''}">
                        <div class="store-header-mini">
                            <span class="blinkit-text">Blinkit</span>
                            ${isBlinkitCheaper ? '<span class="cheaper-tag">CHEAPER</span>' : ''}
                        </div>
                        <div>
                            <span class="price-main">₹${b.price}</span>
                            ${b.mrp > b.price ? `<span class="mrp-strike">₹${b.mrp}</span>` : ''}
                        </div>
                    </div>

                    <div class="store-price-box instamart ${isInstamartCheaper ? 'winner' : ''}">
                        <div class="store-header-mini">
                            <span class="instamart-text">Instamart</span>
                            ${isInstamartCheaper ? '<span class="cheaper-tag">CHEAPER</span>' : ''}
                        </div>
                        <div>
                            <span class="price-main">₹${i.price}</span>
                            ${i.mrp > i.price ? `<span class="mrp-strike">₹${i.mrp}</span>` : ''}
                        </div>
                    </div>
                </div>

                ${deltaBannerHTML}
            </div>
        `;
    }

    function createUnmatchedItemHTML(item) {
        return `
            <div class="unmatched-item-card">
                <div class="item-info">
                    <h4>${item.rawTitle}</h4>
                    <span class="item-var">${item.variantText || item.canonicalSize.formatted}</span>
                </div>
                <div class="item-price">₹${item.price}</div>
            </div>
        `;
    }
});
