/**
 * MzTv IPTV Player - Client Application Logic
 */

// Application State
const state = {
    credentials: {
        server: '',
        username: '',
        password: '',
        remember: true
    },
    userInfo: null,
    serverInfo: null,
    activeView: 'home', // 'home', 'live', 'movies', 'series', 'settings', 'usage'
    
    // Media Lists & Categories
    categories: {
        live: [],
        movies: [],
        series: []
    },
    activeCategory: {
        live: 'all',
        movies: 'all',
        series: 'all'
    },
    data: {
        live: [],
        movies: [],
        series: []
    },
    searchQuery: {
        liveCategory: '',
        liveChannel: '',
        movieCategory: '',
        movie: '',
        seriesCategory: '',
        series: ''
    },
    sortOrder: {
        movies: 'name',
        series: 'name'
    },
    
    // Movie Pagination State
    moviePage: 1,
    moviesPerPage: 16,
    
    // Player State
    currentStream: null, // { id, name, type, url, category }
    hlsPlayer: null,
    tsPlayer: null,
    aspectRatioIndex: 0,
    aspectRatios: ['contain', 'stretch', '4:3', 'cover'], // stretch/fill, etc.
    
    // Preferences
    preferences: {
        format: 'm3u8', // 'ts' or 'm3u8'
        forceProxy: true
    }
};

// DOM Elements
const DOM = {
    // Toast
    toast: document.getElementById('toastNotification'),
    toastIcon: document.querySelector('.toast-icon'),
    toastMsg: document.querySelector('.toast-message'),
    
    // Login
    loginScreen: document.getElementById('loginScreen'),
    loginForm: document.getElementById('loginForm'),
    serverUrl: document.getElementById('serverUrl'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    rememberMe: document.getElementById('rememberMe'),
    loginBtn: document.getElementById('loginBtn'),
    loginError: document.getElementById('loginError'),
    loginErrorText: document.getElementById('loginErrorText'),
    togglePasswordBtn: document.getElementById('togglePasswordBtn'),
    
    // Dashboard
    appDashboard: document.getElementById('appDashboard'),
    userDisplayName: document.getElementById('userDisplayName'),
    expiryDisplay: document.getElementById('expiryDisplay'),
    logoutBtn: document.getElementById('logoutBtn'),
    navLinks: document.querySelectorAll('.nav-link'),
    views: document.querySelectorAll('.dashboard-view'),
    
    // Home View Cards & Loaders
    cardLive: document.getElementById('cardLive'),
    reloadLiveBtn: document.getElementById('reloadLiveBtn'),
    loaderLive: document.getElementById('loaderLive'),
    percentLive: document.getElementById('percentLive'),
    progressFillLive: document.getElementById('progressFillLive'),
    statusLive: document.getElementById('statusLive'),
    
    cardMovies: document.getElementById('cardMovies'),
    reloadMoviesBtn: document.getElementById('reloadMoviesBtn'),
    loaderMovies: document.getElementById('loaderMovies'),
    percentMovies: document.getElementById('percentMovies'),
    progressFillMovies: document.getElementById('progressFillMovies'),
    statusMovies: document.getElementById('statusMovies'),
    
    cardSeries: document.getElementById('cardSeries'),
    reloadSeriesBtn: document.getElementById('reloadSeriesBtn'),
    loaderSeries: document.getElementById('loaderSeries'),
    percentSeries: document.getElementById('percentSeries'),
    progressFillSeries: document.getElementById('progressFillSeries'),
    statusSeries: document.getElementById('statusSeries'),
    
    // Live TV View
    liveCategorySearch: document.getElementById('liveCategorySearch'),
    liveCategoryList: document.getElementById('liveCategoryList'),
    currentCategoryTitle: document.getElementById('currentCategoryTitle'),
    channelCount: document.getElementById('channelCount'),
    liveChannelSearch: document.getElementById('liveChannelSearch'),
    liveChannelList: document.getElementById('liveChannelList'),
    epgDetailsBox: document.getElementById('epgDetailsBox'),
    
    // Movies View
    movieCategorySearch: document.getElementById('movieCategorySearch'),
    movieCategoryList: document.getElementById('movieCategoryList'),
    movieSearch: document.getElementById('movieSearch'),
    moviesGrid: document.getElementById('moviesGrid'),
    movieSort: document.getElementById('movieSort'),
    moviePagination: document.getElementById('moviePagination'),
    moviePrevBtn: document.getElementById('moviePrevBtn'),
    movieNextBtn: document.getElementById('movieNextBtn'),
    moviePageInfo: document.getElementById('moviePageInfo'),
    
    // Series View
    seriesCategorySearch: document.getElementById('seriesCategorySearch'),
    seriesCategoryList: document.getElementById('seriesCategoryList'),
    seriesSearch: document.getElementById('seriesSearch'),
    seriesGrid: document.getElementById('seriesGrid'),
    seriesSort: document.getElementById('seriesSort'),
    
    // Settings View
    settingsServerUrl: document.getElementById('settingsServerUrl'),
    settingsUsername: document.getElementById('settingsUsername'),
    settingsStatus: document.getElementById('settingsStatus'),
    settingsExpiry: document.getElementById('settingsExpiry'),
    settingsConnections: document.getElementById('settingsConnections'),
    settingsFormats: document.getElementById('settingsFormats'),
    settingsFormatSelect: document.getElementById('settingsFormatSelect'),
    settingsForceProxy: document.getElementById('settingsForceProxy'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    mediaCacheSizeDesc: document.getElementById('mediaCacheSizeDesc'),
    clearMediaCacheBtn: document.getElementById('clearMediaCacheBtn'),
    
    // Usage View
    usageTotalVal: document.getElementById('usageTotalVal'),
    usageStreamVal: document.getElementById('usageStreamVal'),
    usageApiVal: document.getElementById('usageApiVal'),
    usageStartTime: document.getElementById('usageStartTime'),
    usageProxyStatus: document.getElementById('usageProxyStatus'),
    resetUsageBtn: document.getElementById('resetUsageBtn'),
    
    // Player
    playerWrapper: document.getElementById('playerWrapper'),
    video: document.getElementById('mainVideoPlayer'),
    playerControls: document.getElementById('playerControls'),
    playerLoader: document.getElementById('playerLoader'),
    playerChannelName: document.getElementById('playerChannelName'),
    playerCategoryName: document.getElementById('playerCategoryName'),
    playerCodecBadge: document.getElementById('playerCodecBadge'),
    overlayPlayPauseBtn: document.getElementById('overlayPlayPauseBtn'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    muteBtn: document.getElementById('muteBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    aspectRatioBtn: document.getElementById('aspectRatioBtn'),
    qualityBtn: document.getElementById('qualityBtn'),
    qualityMenu: document.getElementById('qualityMenu'),
    pipBtn: document.getElementById('pipBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    playerProgressContainer: document.getElementById('playerProgressContainer'),
    playerProgressBuffer: document.getElementById('playerProgressBuffer'),
    playerProgressFill: document.getElementById('playerProgressFill'),
    playerProgressHandle: document.getElementById('playerProgressHandle'),
    playerTimeDisplay: document.getElementById('playerTimeDisplay'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    bufferPctBadge: document.getElementById('bufferPctBadge'),
    playerLoaderText: document.getElementById('playerLoaderText'),
    bufferLoadingPct: document.getElementById('bufferLoadingPct'),
    
    // Modal
    mediaDetailsModal: document.getElementById('mediaDetailsModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalPoster: document.getElementById('modalPoster'),
    modalTitle: document.getElementById('modalTitle'),
    modalYear: document.getElementById('modalYear'),
    modalRating: document.getElementById('modalRating'),
    modalGenre: document.getElementById('modalGenre'),
    modalPlot: document.getElementById('modalPlot'),
    modalPlayBtn: document.getElementById('modalPlayBtn'),
    modalDownloadBtn: document.getElementById('modalDownloadBtn'),
    modalSeriesBlock: document.getElementById('modalSeriesBlock'),
    seasonSelector: document.getElementById('seasonSelector'),
    episodesList: document.getElementById('episodesList')
};

// ==========================================
// INDEXEDDB METADATA CACHE ENGINE
// ==========================================
const DB_NAME = 'NexusIPTVDB';
const DB_VERSION = 1;
const STORE_NAME = 'metadata_cache';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function getCachedData(key) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('IndexedDB get error:', e);
        return null;
    }
}

async function setCachedData(key, value) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('IndexedDB put error:', e);
    }
}

async function clearCachedData(key) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('IndexedDB delete error:', e);
    }
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    checkSavedCredentials();
    initEventListeners();
    initPlayerEvents();
    checkForAppUpdates();
});

// Global helper for React Native downloads interception
function handleDownload(event, relativeOrAbsoluteUrl) {
    if (window.ReactNativeWebView) {
        event.preventDefault();
        event.stopPropagation();
        
        let targetUrl = relativeOrAbsoluteUrl;
        // If it is relative, convert to absolute
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = window.location.origin + (targetUrl.startsWith('/') ? '' : '/') + targetUrl;
        }
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
            action: 'download',
            url: targetUrl
        }));
    }
}

// Check for Native App Updates
async function checkForAppUpdates() {
    // Only check if running inside the React Native App WebView
    if (!window.ReactNativeWebView) {
        return;
    }
    
    // Get the current local app version (fallback to '1.0.0' for the old app)
    const localVersion = window.MZTV_MOBILE_VERSION || '1.0.0';
    
    try {
        const response = await fetch('/updates/version.json');
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Check if server version is newer
        if (data && data.version && isNewerVersion(localVersion, data.version)) {
            // Populate update modal info
            const updateModal = document.getElementById('appUpdateModal');
            const versionNumSpan = document.getElementById('updateVersionNumber');
            const notesDiv = document.getElementById('updateNotesContent');
            const downloadBtn = document.getElementById('btnDownloadUpdate');
            const laterBtn = document.getElementById('btnLaterUpdate');
            
            if (updateModal && versionNumSpan && notesDiv && downloadBtn) {
                versionNumSpan.textContent = data.version;
                notesDiv.innerHTML = data.releaseNotes || 'تحسينات وإصلاحات عامة.';
                downloadBtn.href = data.url;
                downloadBtn.onclick = (e) => handleDownload(e, data.url);
                
                // Show modal
                updateModal.classList.remove('hidden');
                
                laterBtn.addEventListener('click', () => {
                    updateModal.classList.add('hidden');
                });
            }
        }
    } catch (err) {
        console.error('Error checking for updates:', err);
    }
}

// Helper function to compare semver versions
function isNewerVersion(current, latest) {
    const curParts = current.split('.').map(Number);
    const latParts = latest.split('.').map(Number);
    for (let i = 0; i < Math.max(curParts.length, latParts.length); i++) {
        const curVal = curParts[i] || 0;
        const latVal = latParts[i] || 0;
        if (latVal > curVal) return true;
        if (latVal < curVal) return false;
    }
    return false;
}

// Toast Helper
function showToast(message, type = 'info') {
    DOM.toastMsg.textContent = message;
    DOM.toast.classList.remove('hidden');
    
    if (type === 'error') {
        DOM.toast.style.borderColor = 'var(--danger)';
        DOM.toastIcon.className = 'fa-solid fa-circle-exclamation toast-icon';
        DOM.toastIcon.style.color = 'var(--danger)';
    } else if (type === 'success') {
        DOM.toast.style.borderColor = 'var(--accent)';
        DOM.toastIcon.className = 'fa-solid fa-circle-check toast-icon';
        DOM.toastIcon.style.color = 'var(--accent)';
    } else {
        DOM.toast.style.borderColor = 'var(--primary)';
        DOM.toastIcon.className = 'fa-solid fa-circle-info toast-icon';
        DOM.toastIcon.style.color = 'var(--primary)';
    }
    
    setTimeout(() => {
        DOM.toast.classList.add('hidden');
    }, 4000);
}

// Load Preferences
function loadPreferences() {
    const savedPrefs = localStorage.getItem('nexus_prefs');
    if (savedPrefs) {
        try {
            state.preferences = { ...state.preferences, ...JSON.parse(savedPrefs) };
        } catch (e) {
            console.error('Failed to parse preferences', e);
        }
    }
    
    // Apply preferences to UI
    DOM.settingsFormatSelect.value = state.preferences.format;
    DOM.settingsForceProxy.checked = state.preferences.forceProxy;
}

// Save Preferences
function savePreferences() {
    localStorage.setItem('nexus_prefs', JSON.stringify(state.preferences));
}

// Check Stored Credentials
function checkSavedCredentials() {
    const savedCreds = localStorage.getItem('nexus_creds');
    if (savedCreds) {
        try {
            const creds = JSON.parse(savedCreds);
            state.credentials = creds;
            
            // Pre-fill
            DOM.serverUrl.value = creds.server;
            DOM.username.value = creds.username;
            DOM.password.value = creds.password;
            DOM.rememberMe.checked = creds.remember;
            
            if (creds.remember) {
                // Auto-login
                performLogin();
            }
        } catch (e) {
            console.error('Failed to load credentials', e);
        }
    }
}

// Initialize Event Listeners
function initEventListeners() {
    // Toggle Password
    DOM.togglePasswordBtn.addEventListener('click', () => {
        const type = DOM.password.getAttribute('type') === 'password' ? 'text' : 'password';
        DOM.password.setAttribute('type', type);
        DOM.togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
        DOM.togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Login Form Submit
    DOM.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.credentials.server = DOM.serverUrl.value.trim().replace(/\/$/, ""); // Remove trailing slash
        state.credentials.username = DOM.username.value.trim();
        state.credentials.password = DOM.password.value.trim();
        state.credentials.remember = DOM.rememberMe.checked;
        performLogin();
    });

    // Logout
    DOM.logoutBtn.addEventListener('click', performLogout);

    // Sidebar View Navigation
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            switchView(viewName);
        });
    });

    // Live search inputs
    DOM.liveCategorySearch.addEventListener('input', (e) => {
        state.searchQuery.liveCategory = e.target.value.toLowerCase();
        renderLiveCategories();
    });
    DOM.liveChannelSearch.addEventListener('input', (e) => {
        state.searchQuery.liveChannel = e.target.value.toLowerCase();
        renderLiveChannels();
    });

    // Movie search and sorting
    DOM.movieCategorySearch.addEventListener('input', (e) => {
        state.searchQuery.movieCategory = e.target.value.toLowerCase();
        renderMovieCategories();
    });
    DOM.movieSearch.addEventListener('input', (e) => {
        state.searchQuery.movie = e.target.value.toLowerCase();
        state.moviePage = 1;
        renderMoviesGrid();
    });
    DOM.movieSort.addEventListener('change', (e) => {
        state.sortOrder.movies = e.target.value;
        state.moviePage = 1;
        renderMoviesGrid();
    });

    // Movie Pagination click events
    if (DOM.moviePrevBtn) {
        DOM.moviePrevBtn.addEventListener('click', () => {
            if (state.moviePage > 1) {
                state.moviePage--;
                DOM.moviesGrid.scrollTop = 0;
                renderMoviesGrid();
            }
        });
    }
    if (DOM.movieNextBtn) {
        DOM.movieNextBtn.addEventListener('click', () => {
            let filtered = state.data.movies;
            if (state.activeCategory.movies !== 'all') {
                filtered = filtered.filter(m => m.category_id === state.activeCategory.movies);
            }
            if (state.searchQuery.movie) {
                filtered = filtered.filter(m => m.name.toLowerCase().includes(state.searchQuery.movie));
            }
            const totalPages = Math.ceil(filtered.length / state.moviesPerPage) || 1;
            if (state.moviePage < totalPages) {
                state.moviePage++;
                DOM.moviesGrid.scrollTop = 0;
                renderMoviesGrid();
            }
        });
    }

    // Series search and sorting
    DOM.seriesCategorySearch.addEventListener('input', (e) => {
        state.searchQuery.seriesCategory = e.target.value.toLowerCase();
        renderSeriesCategories();
    });
    DOM.seriesSearch.addEventListener('input', (e) => {
        state.searchQuery.series = e.target.value.toLowerCase();
        renderSeriesGrid();
    });
    DOM.seriesSort.addEventListener('change', (e) => {
        state.sortOrder.series = e.target.value;
        renderSeriesGrid();
    });

    // Settings listeners
    DOM.settingsFormatSelect.addEventListener('change', (e) => {
        state.preferences.format = e.target.value;
        savePreferences();
        showToast(`Stream preference updated to: ${e.target.value.toUpperCase()}`, 'success');
    });
    DOM.settingsForceProxy.addEventListener('change', (e) => {
        state.preferences.forceProxy = e.target.checked;
        savePreferences();
        showToast(`Force proxying set to: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'success');
    });
    DOM.clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all local storage data, including login info?')) {
            localStorage.removeItem('nexus_creds');
            localStorage.removeItem('nexus_prefs');
            showToast('All local application data cleared.', 'info');
            performLogout();
        }
    });

    // Clear Media cache
    DOM.clearMediaCacheBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete all offline cached movies and series episodes from local disk?')) {
            try {
                DOM.clearMediaCacheBtn.disabled = true;
                DOM.clearMediaCacheBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Clearing...';
                const response = await fetch('/api/cache/clear', { method: 'POST' });
                if (response.ok) {
                    showToast('Offline media cache cleared successfully!', 'success');
                    updateMediaCacheSize();
                } else {
                    throw new Error('Server responded with an error');
                }
            } catch (err) {
                showToast('Failed to clear media cache: ' + err.message, 'error');
            } finally {
                DOM.clearMediaCacheBtn.disabled = false;
                DOM.clearMediaCacheBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Clear Media Cache';
            }
        }
    });

    // Reset Usage stats
    DOM.resetUsageBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset the bandwidth usage counters?')) {
            try {
                const response = await fetch('/api/usage/reset', { method: 'POST' });
                if (response.ok) {
                    showToast('Usage counters reset successfully!', 'success');
                    updateUsageStats();
                } else {
                    throw new Error('Server responded with an error');
                }
            } catch (err) {
                showToast('Failed to reset usage stats: ' + err.message, 'error');
            }
        }
    });

    // Modal Close
    DOM.modalCloseBtn.addEventListener('click', () => {
        DOM.mediaDetailsModal.classList.add('hidden');
    });
    DOM.mediaDetailsModal.addEventListener('click', (e) => {
        if (e.target === DOM.mediaDetailsModal) {
            DOM.mediaDetailsModal.classList.add('hidden');
        }
    });

    // Home Dashboard Cards Click & Reload Listeners
    if (DOM.cardLive) {
        DOM.cardLive.addEventListener('click', () => loadViewWithProgress('live', false));
    }
    if (DOM.reloadLiveBtn) {
        DOM.reloadLiveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadViewWithProgress('live', true);
        });
    }

    if (DOM.cardMovies) {
        DOM.cardMovies.addEventListener('click', () => loadViewWithProgress('movies', false));
    }
    if (DOM.reloadMoviesBtn) {
        DOM.reloadMoviesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadViewWithProgress('movies', true);
        });
    }

    if (DOM.cardSeries) {
        DOM.cardSeries.addEventListener('click', () => loadViewWithProgress('series', false));
    }
    if (DOM.reloadSeriesBtn) {
        DOM.reloadSeriesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadViewWithProgress('series', true);
        });
    }
}

// Switch View
function switchView(viewName) {
    state.activeView = viewName;
    
    // Stop usage polling interval if switching away from usage
    if (viewName !== 'usage' && usageInterval) {
        clearInterval(usageInterval);
        usageInterval = null;
    }
    
    // Sidebar active state
    DOM.navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Display correct section
    DOM.views.forEach(view => {
        if (view.id === `${viewName}View`) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    });

    // Load data for active view if not already cached
    if (viewName === 'live' && state.categories.live.length === 0) {
        loadLiveViewData();
    } else if (viewName === 'movies' && state.categories.movies.length === 0) {
        loadMoviesViewData();
    } else if (viewName === 'series' && state.categories.series.length === 0) {
        loadSeriesViewData();
    } else if (viewName === 'home') {
        updateHomeCardStatuses();
    } else if (viewName === 'settings') {
        populateSettingsView();
    } else if (viewName === 'usage') {
        startUsageTracking();
    }
}

// API fetching helper (routing via our Express backend API Proxy)
async function fetchFromIPTV(action, additionalParams = '') {
    const { server, username, password } = state.credentials;
    const targetUrl = `${server}/player_api.php?username=${username}&password=${password}&action=${action}${additionalParams}`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`IPTV Request failed: ${response.statusText}`);
    }
    return response.json();
}

// API fetching helper with progress tracking
async function fetchFromIPTVWithProgress(action, additionalParams = '', onProgress, force = false) {
    const { server, username, password } = state.credentials;
    const targetUrl = `${server}/player_api.php?username=${username}&password=${password}&action=${action}${additionalParams}`;
    
    // Add nocache=true if force is set to true
    let proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    if (force) {
        proxyUrl += `&nocache=true`;
    }
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`IPTV Request failed: ${response.statusText}`);
    }
    
    // Determine expected size (Content-Length might be empty or 0 due to chunked transfer-encoding)
    const contentLength = response.headers.get('content-length');
    let totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!totalBytes) {
        if (action === 'get_live_streams') {
            totalBytes = 3000000;
        } else if (action === 'get_vod_streams') {
            totalBytes = 1500000;
        } else if (action === 'get_series') {
            totalBytes = 800000;
        } else {
            totalBytes = 500000;
        }
    }
    
    const reader = response.body.getReader();
    let loadedBytes = 0;
    const chunks = [];
    
    while(true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        loadedBytes += value.length;
        
        let percent = Math.floor((loadedBytes / totalBytes) * 100);
        if (percent > 99) percent = 99; // Cap at 99% until complete
        
        if (onProgress) {
            onProgress(percent, loadedBytes);
        }
    }
    
    // Combine chunks
    const allChunks = new Uint8Array(loadedBytes);
    let position = 0;
    for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
    }
    
    const textDecoder = new TextDecoder('utf-8');
    const jsonString = textDecoder.decode(allChunks);
    
    if (onProgress) {
        onProgress(100, loadedBytes);
    }
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Failed to parse JSON response:', e, jsonString.substring(0, 200));
        throw new Error('Invalid response format from proxy');
    }
}

// Perform Login
async function performLogin() {
    DOM.loginBtn.disabled = true;
    DOM.loginBtn.querySelector('.btn-text').textContent = 'Connecting...';
    DOM.loginBtn.querySelector('.spinner').classList.remove('hidden');
    DOM.loginBtn.querySelector('.btn-icon').classList.add('hidden');
    DOM.loginError.classList.add('hidden');

    try {
        const { server, username, password } = state.credentials;
        const targetUrl = `${server}/player_api.php?username=${username}&password=${password}`;
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.user_info && data.user_info.auth === 1) {
            state.userInfo = data.user_info;
            state.serverInfo = data.server_info;
            
            // Save credentials if checked
            if (state.credentials.remember) {
                localStorage.setItem('nexus_creds', JSON.stringify(state.credentials));
            } else {
                localStorage.removeItem('nexus_creds');
            }
            
            // Update UI User info
            DOM.userDisplayName.textContent = state.credentials.username;
            
            let expiryText = 'Never';
            if (state.userInfo.exp_date && state.userInfo.exp_date !== 'null') {
                const expiryDate = new Date(parseInt(state.userInfo.exp_date) * 1000);
                expiryText = expiryDate.toLocaleDateString();
                
                // Expiry Check
                if (expiryDate < new Date()) {
                    showToast('This IPTV subscription has expired!', 'error');
                }
            }
            DOM.expiryDisplay.textContent = `Exp: ${expiryText}`;
            
            // Logged In, transition screens
            DOM.loginScreen.classList.add('hidden');
            DOM.appDashboard.classList.remove('hidden');
            showToast('Successfully connected to IPTV server!', 'success');
            
            // Start at Home View
            switchView('home');
            updateHomeCardStatuses();
        } else {
            throw new Error('Authentication failed. Check username and password.');
        }
    } catch (err) {
        console.error('Login error:', err);
        DOM.loginErrorText.textContent = err.message || 'Failed to connect. Check Server URL and credentials.';
        DOM.loginError.classList.remove('hidden');
    } finally {
        DOM.loginBtn.disabled = false;
        DOM.loginBtn.querySelector('.btn-text').textContent = 'Connect to Server';
        DOM.loginBtn.querySelector('.spinner').classList.add('hidden');
        DOM.loginBtn.querySelector('.btn-icon').classList.remove('hidden');
    }
}

// Perform Logout
function performLogout() {
    stopVideoPlayback();
    state.userInfo = null;
    state.serverInfo = null;
    state.categories = { live: [], movies: [], series: [] };
    state.data = { live: [], movies: [], series: [] };
    state.currentStream = null;
    
    // Switch screens
    DOM.appDashboard.classList.add('hidden');
    DOM.loginScreen.classList.remove('hidden');
    DOM.password.value = ''; // clear password field
    showToast('Logged out of session.', 'info');
}

// Populate Settings View
function populateSettingsView() {
    DOM.settingsServerUrl.textContent = state.credentials.server;
    DOM.settingsUsername.textContent = state.credentials.username;
    DOM.settingsStatus.textContent = state.userInfo.status || 'Active';
    
    let expiryText = 'Unlimited';
    if (state.userInfo.exp_date && state.userInfo.exp_date !== 'null') {
        const expiryDate = new Date(parseInt(state.userInfo.exp_date) * 1000);
        expiryText = expiryDate.toLocaleString();
    }
    DOM.settingsExpiry.textContent = expiryText;
    
    const maxConn = state.userInfo.max_connections || 'Unlimited';
    const activeConn = state.userInfo.active_cons || '0';
    DOM.settingsConnections.textContent = `${activeConn} / ${maxConn}`;
    
    DOM.settingsFormats.textContent = (state.userInfo.allowed_output_formats || []).join(', ').toUpperCase() || 'TS, M3U8';
    
    // Update offline cache size display
    updateMediaCacheSize();
}

// Load view content with IndexedDB caching and progress loader
async function loadViewWithProgress(type, force = false) {
    const hasInMemory = state.categories[type] && state.categories[type].length > 0 && state.data[type] && state.data[type].length > 0;
    
    if (hasInMemory && !force) {
        switchView(type);
        return;
    }
    
    // Select correct DOM elements and APIs
    let loader, percentLabel, progressFill, statusLabel;
    let actionCats, actionStreams;
    
    if (type === 'live') {
        loader = DOM.loaderLive;
        percentLabel = DOM.percentLive;
        progressFill = DOM.progressFillLive;
        statusLabel = DOM.statusLive;
        actionCats = 'get_live_categories';
        actionStreams = 'get_live_streams';
    } else if (type === 'movies') {
        loader = DOM.loaderMovies;
        percentLabel = DOM.percentMovies;
        progressFill = DOM.progressFillMovies;
        statusLabel = DOM.statusMovies;
        actionCats = 'get_vod_categories';
        actionStreams = 'get_vod_streams';
    } else if (type === 'series') {
        loader = DOM.loaderSeries;
        percentLabel = DOM.percentSeries;
        progressFill = DOM.progressFillSeries;
        statusLabel = DOM.statusSeries;
        actionCats = 'get_series_categories';
        actionStreams = 'get_series';
    }
    
    if (!loader) return;
    
    // If not forcing reload, check IndexedDB cache
    if (!force) {
        try {
            const cachedCats = await getCachedData('cats_' + type);
            const cachedData = await getCachedData('data_' + type);
            
            if (cachedCats && cachedCats.length > 0 && cachedData && cachedData.length > 0) {
                state.categories[type] = cachedCats;
                state.data[type] = cachedData;
                
                if (type === 'live') {
                    renderLiveCategories();
                    selectLiveCategory('all');
                } else if (type === 'movies') {
                    renderMovieCategories();
                    selectMovieCategory('all');
                } else if (type === 'series') {
                    renderSeriesCategories();
                    selectSeriesCategory('all');
                }
                
                updateHomeCardStatuses();
                switchView(type);
                return;
            }
        } catch (e) {
            console.warn(`Failed to read IndexedDB cache for ${type}:`, e);
        }
    }
    
    // Show progress loader
    loader.classList.remove('hidden');
    percentLabel.textContent = '0%';
    progressFill.style.width = '0%';
    
    try {
        // Fetch categories first
        percentLabel.textContent = '5%';
        progressFill.style.width = '5%';
        
        // Pass force option to bypass server-side cache
        const catsTarget = `${state.credentials.server}/player_api.php?username=${state.credentials.username}&password=${state.credentials.password}&action=${actionCats}`;
        let catsProxy = `/api/proxy?url=${encodeURIComponent(catsTarget)}`;
        if (force) catsProxy += '&nocache=true';
        
        const catsResponse = await fetch(catsProxy);
        if (!catsResponse.ok) throw new Error('Failed to fetch categories');
        const cats = await catsResponse.json();
        
        percentLabel.textContent = '10%';
        progressFill.style.width = '10%';
        
        // Fetch streams with progress tracking
        const streams = await fetchFromIPTVWithProgress(actionStreams, '', (percent) => {
            const overallPercent = 10 + Math.floor(percent * 0.9);
            percentLabel.textContent = `${overallPercent}%`;
            progressFill.style.width = `${overallPercent}%`;
        }, force);
        
        // Save in state memory
        state.categories[type] = cats || [];
        state.data[type] = streams || [];
        
        // Save in IndexedDB cache for offline/instant usage
        await setCachedData('cats_' + type, cats || []);
        await setCachedData('data_' + type, streams || []);
        
        // Render listings
        if (type === 'live') {
            renderLiveCategories();
            selectLiveCategory('all');
        } else if (type === 'movies') {
            renderMovieCategories();
            selectMovieCategory('all');
        } else if (type === 'series') {
            renderSeriesCategories();
            selectSeriesCategory('all');
        }
        
        updateHomeCardStatuses();
        
        // Complete animation & switch view
        setTimeout(() => {
            loader.classList.add('hidden');
            switchView(type);
        }, 300);
        
    } catch (err) {
        console.error(`Failed to download ${type}:`, err);
        showToast(`Failed to load: ${err.message}`, 'error');
        percentLabel.textContent = 'Error';
        progressFill.style.width = '0%';
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 3000);
    }
}

// Update card status counts on the Home dashboard
function updateHomeCardStatuses() {
    if (state.data.live && state.data.live.length > 0) {
        DOM.statusLive.textContent = `${state.data.live.length} Channels Loaded`;
    } else {
        DOM.statusLive.textContent = 'Click to open';
    }
    
    if (state.data.movies && state.data.movies.length > 0) {
        DOM.statusMovies.textContent = `${state.data.movies.length} Movies Loaded`;
    } else {
        DOM.statusMovies.textContent = 'Click to open';
    }
    
    if (state.data.series && state.data.series.length > 0) {
        DOM.statusSeries.textContent = `${state.data.series.length} Series Loaded`;
    } else {
        DOM.statusSeries.textContent = 'Click to open';
    }
}

async function loadLiveViewData() {
    try {
        DOM.liveCategoryList.innerHTML = '<li class="category-item">Loading categories...</li>';
        DOM.liveChannelList.innerHTML = '<div class="empty-state"><div class="spinner-large"></div><p>Fetching channels...</p></div>';
        
        // Fetch Categories & Streams in parallel
        const [cats, streams] = await Promise.all([
            fetchFromIPTV('get_live_categories'),
            fetchFromIPTV('get_live_streams')
        ]);
        
        state.categories.live = cats || [];
        state.data.live = streams || [];
        
        renderLiveCategories();
        selectLiveCategory('all');
    } catch (e) {
        console.error('Failed to load Live View Data', e);
        showToast('Error loading live TV streams: ' + e.message, 'error');
        DOM.liveCategoryList.innerHTML = '<li class="category-item text-danger">Failed to load</li>';
        DOM.liveChannelList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-exclamation text-danger"></i><p>Failed to load channels.</p></div>';
    }
}

function renderLiveCategories() {
    const list = DOM.liveCategoryList;
    let html = '';
    
    // Add "All Channels" Category
    const allActive = state.activeCategory.live === 'all' ? 'active' : '';
    const totalCount = state.data.live.length;
    
    if (state.searchQuery.liveCategory === '' || 'all channels'.includes(state.searchQuery.liveCategory)) {
        html += `
            <li class="category-item ${allActive}" onclick="selectLiveCategory('all')">
                <span><i class="fa-solid fa-globe"></i> All Channels</span>
                <span class="count-badge">${totalCount}</span>
            </li>
        `;
    }

    // Filter categories by search
    const filteredCats = state.categories.live.filter(c => 
        c.category_name.toLowerCase().includes(state.searchQuery.liveCategory)
    );
    
    // Pre-calculate counts of channels per category for O(N) performance
    const categoryCounts = {};
    state.data.live.forEach(s => {
        categoryCounts[s.category_id] = (categoryCounts[s.category_id] || 0) + 1;
    });
    
    filteredCats.forEach(cat => {
        const active = state.activeCategory.live === cat.category_id ? 'active' : '';
        const count = categoryCounts[cat.category_id] || 0;
        
        html += `
            <li class="category-item ${active}" onclick="selectLiveCategory('${cat.category_id}')">
                <span><i class="fa-solid fa-folder"></i> ${cat.category_name}</span>
                <span class="count-badge">${count}</span>
            </li>
        `;
    });
    list.innerHTML = html;
}

function selectLiveCategory(categoryId) {
    state.activeCategory.live = categoryId;
    
    // Highlight correct category in sidebar
    const items = DOM.liveCategoryList.querySelectorAll('.category-item');
    items.forEach(item => {
        item.classList.remove('active');
    });
    
    // Set current active item
    renderLiveCategories();
    
    // Update main pane category header
    if (categoryId === 'all') {
        DOM.currentCategoryTitle.textContent = 'All Channels';
    } else {
        const catObj = state.categories.live.find(c => c.category_id === categoryId);
        DOM.currentCategoryTitle.textContent = catObj ? catObj.category_name : 'Channels';
    }
    
    // Scroll channels to top and render
    DOM.liveChannelList.scrollTop = 0;
    renderLiveChannels();
}

function renderLiveChannels() {
    const list = DOM.liveChannelList;
    
    // Filter channels by active category
    let filtered = state.data.live;
    if (state.activeCategory.live !== 'all') {
        filtered = filtered.filter(s => s.category_id === state.activeCategory.live);
    }
    
    // Filter by channel search query
    if (state.searchQuery.liveChannel) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(state.searchQuery.liveChannel)
        );
    }
    
    DOM.channelCount.textContent = filtered.length;
    
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-tv"></i>
                <p>No channels found</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(ch => {
        const active = (state.currentStream && state.currentStream.id === ch.stream_id) ? 'active' : '';
        const logo = ch.stream_icon ? `<img src="${ch.stream_icon}" alt="" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\x22fa-solid fa-tv\x22></i>'">` : '<i class="fa-solid fa-tv"></i>';
        
        // Short EPG info (if provided in primary stream list)
        const nowPlaying = ch.epg_title ? ch.epg_title : 'No Information Available';
        
        html += `
            <div class="channel-item ${active}" onclick="playLiveChannel('${ch.stream_id}', '${escapeHtml(ch.name)}', '${ch.category_id}')">
                <div class="channel-logo">
                    ${logo}
                </div>
                <div class="channel-details">
                    <div class="channel-name">${ch.name}</div>
                    <div class="channel-epg-now">${nowPlaying}</div>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

async function playLiveChannel(streamId, name, categoryId) {
    const { server, username, password } = state.credentials;
    const format = state.preferences.format; // 'ts' or 'm3u8'
    
    // Build direct URL to stream
    const targetUrl = `${server}/live/${username}/${password}/${streamId}.${format}`;
    // Bypassing CORS by routing through Express proxy
    const finalStreamUrl = state.preferences.forceProxy ? `/api/stream?url=${encodeURIComponent(targetUrl)}` : targetUrl;
    
    // Get category name
    const cat = state.categories.live.find(c => c.category_id === categoryId);
    const catName = cat ? cat.category_name : 'Live TV';
    
    // Update Channel UI highlights
    const items = DOM.liveChannelList.querySelectorAll('.channel-item');
    items.forEach((item, index) => {
        // Simple active check
        const chNameElement = item.querySelector('.channel-name');
        if (chNameElement && chNameElement.textContent === name) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    state.currentStream = {
        id: streamId,
        name: name,
        type: 'live',
        url: finalStreamUrl,
        category: catName
    };
    
    DOM.playerChannelName.textContent = name;
    DOM.playerCategoryName.textContent = catName;
    DOM.playerCodecBadge.textContent = format.toUpperCase();
    DOM.playerCodecBadge.classList.remove('hidden');
    
    // Setup video playback
    initVideoPlayer(finalStreamUrl, 'live');
    
    // Fetch Short EPG details
    fetchEPG(streamId);
}

async function fetchEPG(streamId) {
    DOM.epgDetailsBox.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await fetchFromIPTV('get_short_epg', `&stream_id=${streamId}`);
        const epgList = data.epg_listings || [];
        
        DOM.epgDetailsBox.innerHTML = '';
        
        if (epgList.length === 0) {
            DOM.epgDetailsBox.innerHTML = '<p class="no-epg-msg">No EPG schedule available for this channel.</p>';
            return;
        }
        
        // Show current and upcoming EPG items
        epgList.forEach((epg, idx) => {
            // Xtream Codes returns base64 encoded title and decodes it, or standard string.
            // If base64, we decode it. Usually it's encoded or just standard decoded text.
            let title = epg.title;
            let desc = epg.description;
            try {
                if (title && title.includes('==') || title.length % 4 === 0 && /^[a-zA-Z0-9+/]+={0,2}$/.test(title)) {
                    title = atob(title);
                }
            } catch(e) {}
            try {
                if (desc && desc.includes('==') || desc.length % 4 === 0 && /^[a-zA-Z0-9+/]+={0,2}$/.test(desc)) {
                    desc = atob(desc);
                }
            } catch(e) {}
            
            const start = new Date(epg.start);
            const end = new Date(epg.end);
            const timeStr = `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            
            // Calculate progress for current program (first item usually)
            let progressBlock = '';
            if (idx === 0) {
                const now = new Date();
                const total = end - start;
                const elapsed = now - start;
                if (elapsed > 0 && elapsed < total) {
                    const pct = Math.round((elapsed / total) * 100);
                    progressBlock = `
                        <div class="epg-progress-bar">
                            <div class="epg-progress-fill" style="width: ${pct}%"></div>
                        </div>
                    `;
                }
            }

            DOM.epgDetailsBox.innerHTML += `
                <div class="epg-item">
                    <div class="epg-title">${title}</div>
                    <div class="epg-time">${timeStr} ${idx === 0 ? '<span class="badge badge-live" style="padding: 2px 6px; display: inline-flex; margin-left: 8px"><span class="dot"></span> NOW</span>' : ''}</div>
                    <div class="epg-desc">${desc || 'No description.'}</div>
                    ${progressBlock}
                </div>
            `;
        });
    } catch(e) {
        console.error('EPG Fetch failed', e);
        DOM.epgDetailsBox.innerHTML = '<p class="no-epg-msg">Could not fetch EPG program info.</p>';
    }
}

// ==========================================
// 4. MOVIES (VOD) MODULE
// ==========================================
async function loadMoviesViewData() {
    try {
        DOM.movieCategoryList.innerHTML = '<li class="category-item">Loading categories...</li>';
        DOM.moviesGrid.innerHTML = '<div class="empty-state"><div class="spinner-large"></div><p>Fetching movies...</p></div>';
        
        const [cats, movies] = await Promise.all([
            fetchFromIPTV('get_vod_categories'),
            fetchFromIPTV('get_vod_streams')
        ]);
        
        state.categories.movies = cats || [];
        state.data.movies = movies || [];
        
        renderMovieCategories();
        selectMovieCategory('all');
    } catch (e) {
        console.error('Failed to load Movies', e);
        showToast('Error loading movies: ' + e.message, 'error');
        DOM.movieCategoryList.innerHTML = '<li class="category-item text-danger">Failed</li>';
        DOM.moviesGrid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-exclamation text-danger"></i><p>Failed to load movies.</p></div>';
    }
}

function renderMovieCategories() {
    const list = DOM.movieCategoryList;
    let html = '';
    
    // Add "All Movies"
    const allActive = state.activeCategory.movies === 'all' ? 'active' : '';
    if (state.searchQuery.movieCategory === '' || 'all movies'.includes(state.searchQuery.movieCategory)) {
        html += `
            <li class="category-item ${allActive}" onclick="selectMovieCategory('all')">
                <span><i class="fa-solid fa-globe"></i> All Movies</span>
                <span class="count-badge">${state.data.movies.length}</span>
            </li>
        `;
    }

    const filtered = state.categories.movies.filter(c => 
        c.category_name.toLowerCase().includes(state.searchQuery.movieCategory)
    );
    
    // Pre-calculate counts of movies per category
    const categoryCounts = {};
    state.data.movies.forEach(m => {
        categoryCounts[m.category_id] = (categoryCounts[m.category_id] || 0) + 1;
    });
    
    filtered.forEach(cat => {
        const active = state.activeCategory.movies === cat.category_id ? 'active' : '';
        const count = categoryCounts[cat.category_id] || 0;
        
        html += `
            <li class="category-item ${active}" onclick="selectMovieCategory('${cat.category_id}')">
                <span><i class="fa-solid fa-film"></i> ${cat.category_name}</span>
                <span class="count-badge">${count}</span>
            </li>
        `;
    });
    list.innerHTML = html;
}

function selectMovieCategory(categoryId) {
    state.activeCategory.movies = categoryId;
    state.moviePage = 1;
    renderMovieCategories();
    DOM.moviesGrid.scrollTop = 0;
    renderMoviesGrid();
}

function renderMoviesGrid() {
    const grid = DOM.moviesGrid;
    
    let filtered = state.data.movies;
    if (state.activeCategory.movies !== 'all') {
        filtered = filtered.filter(m => m.category_id === state.activeCategory.movies);
    }
    
    if (state.searchQuery.movie) {
        filtered = filtered.filter(m => m.name.toLowerCase().includes(state.searchQuery.movie));
    }

    // Sort movies
    if (state.sortOrder.movies === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sortOrder.movies === 'newest') {
        filtered.sort((a, b) => (parseInt(b.added) || 0) - (parseInt(a.added) || 0));
    } else if (state.sortOrder.movies === 'rating') {
        filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-question"></i>
                <p>No movies match your criteria.</p>
            </div>
        `;
        if (DOM.moviePagination) {
            DOM.moviePagination.classList.add('hidden');
        }
        return;
    }

    // Calculate total pages and clamp current page
    const totalMovies = filtered.length;
    const totalPages = Math.ceil(totalMovies / state.moviesPerPage) || 1;
    
    if (state.moviePage > totalPages) {
        state.moviePage = totalPages;
    }
    if (state.moviePage < 1) {
        state.moviePage = 1;
    }

    // Slice movies for current page
    const startIndex = (state.moviePage - 1) * state.moviesPerPage;
    const endIndex = startIndex + state.moviesPerPage;
    const paginatedMovies = filtered.slice(startIndex, endIndex);

    // Update pagination controls UI
    if (DOM.moviePagination) {
        DOM.moviePagination.classList.remove('hidden');
        DOM.moviePageInfo.textContent = `Page ${state.moviePage} of ${totalPages}`;
        DOM.moviePrevBtn.disabled = (state.moviePage === 1);
        DOM.movieNextBtn.disabled = (state.moviePage === totalPages);
    }

    let html = '';
    paginatedMovies.forEach(movie => {
        const rating = movie.rating ? parseFloat(movie.rating).toFixed(1) : null;
        const ratingBadge = rating && rating > 0 ? `<div class="media-badge media-badge-rating"><i class="fa-solid fa-star"></i> ${rating}</div>` : '';
        const poster = movie.stream_icon ? `<img src="${movie.stream_icon}" alt="" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\x22fa-solid fa-film\x22></i>'">` : '<i class="fa-solid fa-film"></i>';

        html += `
            <div class="media-card" onclick="openMovieDetails('${movie.stream_id}')">
                <div class="media-card-poster">
                    ${poster}
                    ${ratingBadge}
                    <div class="media-card-hover-overlay">
                        <div class="play-hover-icon"><i class="fa-solid fa-play"></i></div>
                    </div>
                </div>
                <div class="media-card-info">
                    <div class="media-card-title">${movie.name}</div>
                    <div class="media-card-meta">Movies</div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// Open Movie Details
async function openMovieDetails(movieId) {
    // Show details modal and loading states
    DOM.mediaDetailsModal.classList.remove('hidden');
    DOM.modalSeriesBlock.classList.add('hidden');
    DOM.modalTitle.textContent = 'Loading...';
    DOM.modalPlot.textContent = '';
    DOM.modalPoster.src = '';
    DOM.modalBackdrop.src = '';
    DOM.modalYear.innerHTML = '-';
    DOM.modalRating.innerHTML = '-';
    DOM.modalGenre.innerHTML = '-';
    DOM.modalPlayBtn.onclick = null;
    DOM.modalDownloadBtn.classList.add('hidden');
    
    try {
        const details = await fetchFromIPTV('get_vod_info', `&vod_id=${movieId}`);
        const info = details.info || {};
        const movieData = details.movie_data || {};
        
        DOM.modalTitle.textContent = movieData.name || info.name || 'Unknown Movie';
        DOM.modalPlot.textContent = info.plot || info.description || 'No description available for this movie.';
        
        // Posters
        const imgUrl = movieData.stream_icon || info.movie_image;
        if (imgUrl) {
            DOM.modalPoster.src = imgUrl;
            DOM.modalPoster.classList.remove('hidden');
            DOM.modalBackdrop.src = imgUrl; // backdrop fallback
        } else {
            DOM.modalPoster.classList.add('hidden');
            DOM.modalBackdrop.src = '';
        }
        
        if (info.backdrop_path && info.backdrop_path[0]) {
            DOM.modalBackdrop.src = info.backdrop_path[0];
        }

        DOM.modalYear.innerHTML = `<i class="fa-solid fa-calendar"></i> ${info.releasedate || info.year || 'N/A'}`;
        DOM.modalRating.innerHTML = `<i class="fa-solid fa-star"></i> ${info.rating ? parseFloat(info.rating).toFixed(1) : 'N/A'}`;
        DOM.modalGenre.innerHTML = `<i class="fa-solid fa-tag"></i> ${info.genre || 'Action/Drama'}`;
        
        // Setup direct watch button
        const container = movieData.container_extension || 'mp4';
        const { server, username, password } = state.credentials;
        const targetUrl = `${server}/movie/${username}/${password}/${movieId}.${container}`;
        const finalUrl = state.preferences.forceProxy ? `/api/stream?url=${encodeURIComponent(targetUrl)}` : targetUrl;
        
        // Setup download button (always proxy through server to inject Content-Disposition)
        const downloadUrl = `/api/stream?url=${encodeURIComponent(targetUrl)}&download=true`;
        DOM.modalDownloadBtn.href = downloadUrl;
        DOM.modalDownloadBtn.onclick = (e) => handleDownload(e, downloadUrl);
        DOM.modalDownloadBtn.classList.remove('hidden');
        DOM.modalPlayBtn.classList.remove('hidden');
        
        DOM.modalPlayBtn.onclick = () => {
            DOM.mediaDetailsModal.classList.add('hidden');
            
            // Set stream info
            state.currentStream = {
                id: movieId,
                name: movieData.name,
                type: 'vod',
                url: finalUrl,
                category: info.genre || 'Movies'
            };
            
            DOM.playerChannelName.textContent = movieData.name;
            DOM.playerCategoryName.textContent = info.genre || 'Movies';
            DOM.playerCodecBadge.classList.add('hidden'); // standard HTML5 handles it
            
            // Switch to live TV/Player view to play
            switchView('live');
            initVideoPlayer(finalUrl, 'vod');
            
            // Request fullscreen on player wrapper
            setTimeout(() => {
                requestFullscreenPlayer();
            }, 100);
        };

    } catch (e) {
        console.error('Failed to get movie details', e);
        DOM.modalTitle.textContent = 'Error Loading Details';
        DOM.modalPlot.textContent = 'Failed to fetch details for this movie: ' + e.message;
    }
}

// ==========================================
// 5. SERIES MODULE
// ==========================================
async function loadSeriesViewData() {
    try {
        DOM.seriesCategoryList.innerHTML = '<li class="category-item">Loading categories...</li>';
        DOM.seriesGrid.innerHTML = '<div class="empty-state"><div class="spinner-large"></div><p>Fetching series...</p></div>';
        
        const [cats, series] = await Promise.all([
            fetchFromIPTV('get_series_categories'),
            fetchFromIPTV('get_series')
        ]);
        
        state.categories.series = cats || [];
        state.data.series = series || [];
        
        renderSeriesCategories();
        selectSeriesCategory('all');
    } catch (e) {
        console.error('Failed to load series', e);
        showToast('Error loading series: ' + e.message, 'error');
        DOM.seriesCategoryList.innerHTML = '<li class="category-item text-danger">Failed</li>';
        DOM.seriesGrid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-exclamation text-danger"></i><p>Failed to load series.</p></div>';
    }
}

function renderSeriesCategories() {
    const list = DOM.seriesCategoryList;
    let html = '';
    
    // Add "All Series"
    const allActive = state.activeCategory.series === 'all' ? 'active' : '';
    if (state.searchQuery.seriesCategory === '' || 'all series'.includes(state.searchQuery.seriesCategory)) {
        html += `
            <li class="category-item ${allActive}" onclick="selectSeriesCategory('all')">
                <span><i class="fa-solid fa-globe"></i> All Series</span>
                <span class="count-badge">${state.data.series.length}</span>
            </li>
        `;
    }

    const filtered = state.categories.series.filter(c => 
        c.category_name.toLowerCase().includes(state.searchQuery.seriesCategory)
    );
    
    // Pre-calculate counts of series per category
    const categoryCounts = {};
    state.data.series.forEach(s => {
        categoryCounts[s.category_id] = (categoryCounts[s.category_id] || 0) + 1;
    });
    
    filtered.forEach(cat => {
        const active = state.activeCategory.series === cat.category_id ? 'active' : '';
        const count = categoryCounts[cat.category_id] || 0;
        
        html += `
            <li class="category-item ${active}" onclick="selectSeriesCategory('${cat.category_id}')">
                <span><i class="fa-solid fa-layer-group"></i> ${cat.category_name}</span>
                <span class="count-badge">${count}</span>
            </li>
        `;
    });
    list.innerHTML = html;
}

function selectSeriesCategory(categoryId) {
    state.activeCategory.series = categoryId;
    renderSeriesCategories();
    DOM.seriesGrid.scrollTop = 0;
    renderSeriesGrid();
}

function renderSeriesGrid() {
    const grid = DOM.seriesGrid;
    
    let filtered = state.data.series;
    if (state.activeCategory.series !== 'all') {
        filtered = filtered.filter(s => s.category_id === state.activeCategory.series);
    }
    
    if (state.searchQuery.series) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(state.searchQuery.series));
    }

    // Sort series
    if (state.sortOrder.series === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sortOrder.series === 'newest') {
        filtered.sort((a, b) => (parseInt(b.last_modified) || 0) - (parseInt(a.last_modified) || 0));
    } else if (state.sortOrder.series === 'rating') {
        filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-question"></i>
                <p>No series match your criteria.</p>
            </div>
        `;
        return;
    }

    let html = '';
    filtered.forEach(series => {
        const rating = series.rating ? parseFloat(series.rating).toFixed(1) : null;
        const ratingBadge = rating && rating > 0 ? `<div class="media-badge media-badge-rating"><i class="fa-solid fa-star"></i> ${rating}</div>` : '';
        const poster = series.cover ? `<img src="${series.cover}" alt="" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\x22fa-solid fa-tv\x22></i>'">` : '<i class="fa-solid fa-tv"></i>';

        html += `
            <div class="media-card" onclick="openSeriesDetails('${series.series_id}')">
                <div class="media-card-poster">
                    ${poster}
                    ${ratingBadge}
                    <div class="media-card-hover-overlay">
                        <div class="play-hover-icon"><i class="fa-solid fa-play"></i></div>
                    </div>
                </div>
                <div class="media-card-info">
                    <div class="media-card-title">${series.name}</div>
                    <div class="media-card-meta">TV Series</div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// Open Series Details
async function openSeriesDetails(seriesId) {
    DOM.mediaDetailsModal.classList.remove('hidden');
    DOM.modalSeriesBlock.classList.add('hidden');
    DOM.modalTitle.textContent = 'Loading...';
    DOM.modalPlot.textContent = '';
    DOM.modalPoster.src = '';
    DOM.modalBackdrop.src = '';
    DOM.modalYear.innerHTML = '-';
    DOM.modalRating.innerHTML = '-';
    DOM.modalGenre.innerHTML = '-';
    DOM.modalPlayBtn.classList.add('hidden'); // play button hidden for series (episodes list has plays)
    DOM.modalDownloadBtn.classList.add('hidden'); // download button hidden for series
    
    try {
        const details = await fetchFromIPTV('get_series_info', `&series_id=${seriesId}`);
        const info = details.info || {};
        const seasons = details.seasons || [];
        const episodes = details.episodes || {};
        
        DOM.modalTitle.textContent = info.name || 'Unknown Series';
        DOM.modalPlot.textContent = info.plot || info.description || 'No description available for this series.';
        
        // Images
        const imgUrl = info.cover || info.series_image;
        if (imgUrl) {
            DOM.modalPoster.src = imgUrl;
            DOM.modalPoster.classList.remove('hidden');
            DOM.modalBackdrop.src = imgUrl;
        } else {
            DOM.modalPoster.classList.add('hidden');
            DOM.modalBackdrop.src = '';
        }
        
        if (info.backdrop_path && info.backdrop_path[0]) {
            DOM.modalBackdrop.src = info.backdrop_path[0];
        }

        DOM.modalYear.innerHTML = `<i class="fa-solid fa-calendar"></i> ${info.releaseDate || info.last_modified || 'N/A'}`;
        DOM.modalRating.innerHTML = `<i class="fa-solid fa-star"></i> ${info.rating ? parseFloat(info.rating).toFixed(1) : 'N/A'}`;
        DOM.modalGenre.innerHTML = `<i class="fa-solid fa-tag"></i> ${info.genre || 'Series'}`;
        
        // Render Seasons dropdown
        DOM.modalSeriesBlock.classList.remove('hidden');
        const selector = DOM.seasonSelector;
        selector.innerHTML = '';
        
        // Get list of seasons sorted
        const seasonNums = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
        
        if (seasonNums.length === 0) {
            DOM.episodesList.innerHTML = '<p class="no-epg-msg">No episodes available.</p>';
            return;
        }
        
        seasonNums.forEach(num => {
            selector.innerHTML += `<option value="${num}">Season ${num}</option>`;
        });
        
        // Listen to season changes
        selector.onchange = () => {
            const currentSeason = selector.value;
            const currentEpisodes = episodes[currentSeason] || [];
            renderEpisodes(currentEpisodes, info.name);
        };
        
        // Initial render of first season episodes
        renderEpisodes(episodes[seasonNums[0]], info.name);
        
    } catch (e) {
        console.error('Failed to load series details', e);
        DOM.modalTitle.textContent = 'Error Loading Series';
        DOM.modalPlot.textContent = 'Failed to fetch details for this series: ' + e.message;
    }
}

function renderEpisodes(epList, seriesName) {
    const list = DOM.episodesList;
    list.innerHTML = '';
    
    // Sort episodes by episode number
    epList.sort((a, b) => (parseInt(a.episode_num) || 0) - (parseInt(b.episode_num) || 0));
    
    epList.forEach(ep => {
        const logo = ep.info && ep.info.movie_image ? `<img src="${ep.info.movie_image}" alt="" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\x22fa-solid fa-play\x22></i>'">` : '<i class="fa-solid fa-play"></i>';
        const title = ep.title ? ep.title : `Episode ${ep.episode_num}`;
        const desc = ep.info && ep.info.plot ? ep.info.plot : 'No description available.';
        
        // Stream URL structure for Series Episode:
        // http://<server>/series/<username>/<password>/<episode_id>.<extension>
        const ext = ep.container_extension || 'mp4';
        const { server, username, password } = state.credentials;
        const targetUrl = `${server}/series/${username}/${password}/${ep.id}.${ext}`;
        const finalUrl = state.preferences.forceProxy ? `/api/stream?url=${encodeURIComponent(targetUrl)}` : targetUrl;
        const downloadUrl = `/api/stream?url=${encodeURIComponent(targetUrl)}&download=true`;
        
        const epBlock = document.createElement('div');
        epBlock.className = 'episode-item';
        epBlock.innerHTML = `
            <div class="episode-thumb">
                ${logo}
            </div>
            <div class="episode-info">
                <div class="episode-title">${ep.episode_num}. ${title}</div>
                <div class="episode-desc">${desc}</div>
            </div>
            <div class="episode-controls">
                <a class="episode-download-btn" title="Download Episode" href="${downloadUrl}" target="_blank" download onclick="handleDownload(event, '${downloadUrl}');">
                    <i class="fa-solid fa-download"></i>
                </a>
                <i class="fa-regular fa-circle-play episode-play-icon"></i>
            </div>
        `;
        
        epBlock.onclick = () => {
            DOM.mediaDetailsModal.classList.add('hidden');
            
            // Set stream info
            state.currentStream = {
                id: ep.id,
                name: `${seriesName} - S${ep.season}E${ep.episode_num}: ${title}`,
                type: 'series',
                url: finalUrl,
                category: 'TV Series'
            };
            
            DOM.playerChannelName.textContent = state.currentStream.name;
            DOM.playerCategoryName.textContent = 'TV Series';
            DOM.playerCodecBadge.classList.add('hidden');
            
            switchView('live');
            initVideoPlayer(finalUrl, 'series');
            
            // Play fullscreen
            setTimeout(() => {
                requestFullscreenPlayer();
            }, 100);
        };
        
        list.appendChild(epBlock);
    });
}

// ==========================================
// 6. VIDEO PLAYER ENGINE & CUSTOM CONTROLS
// ==========================================
function stopVideoPlayback() {
    if (state.hlsPlayer) {
        state.hlsPlayer.destroy();
        state.hlsPlayer = null;
    }
    if (state.tsPlayer) {
        state.tsPlayer.destroy();
        state.tsPlayer = null;
    }
    DOM.video.pause();
    DOM.video.src = '';
    DOM.video.load();
    DOM.playerLoader.classList.add('hidden');
    DOM.playerWrapper.classList.remove('paused');
}

function initVideoPlayer(url, type) {
    stopVideoPlayback();
    DOM.playerLoader.classList.remove('hidden');
    if (DOM.playerLoaderText) DOM.playerLoaderText.textContent = 'Loading stream...';
    if (DOM.bufferLoadingPct) DOM.bufferLoadingPct.textContent = '';
    
    // Reset quality selector UI
    if (DOM.qualityMenu) {
        DOM.qualityMenu.innerHTML = '';
        DOM.qualityMenu.classList.add('hidden');
    }
    if (DOM.qualityBtn) {
        DOM.qualityBtn.querySelector('span').textContent = 'Quality';
    }
    
    // Setup Controls based on live vs VOD
    if (type === 'live') {
        DOM.playerProgressContainer.classList.add('hidden');
        DOM.playerTimeDisplay.classList.add('hidden');
        // Hide buffer badge for live TV
        if (DOM.bufferPctBadge) DOM.bufferPctBadge.classList.add('hidden');
    } else {
        // VOD/Series seekable track
        DOM.playerProgressContainer.classList.remove('hidden');
        DOM.playerTimeDisplay.classList.remove('hidden');
        DOM.playerProgressFill.style.width = '0%';
        DOM.playerProgressBuffer.style.width = '0%';
        DOM.playerTimeDisplay.textContent = '00:00 / 00:00';
        // Show buffer badge for VOD
        if (DOM.bufferPctBadge) {
            DOM.bufferPctBadge.classList.remove('hidden');
            DOM.bufferPctBadge.textContent = '◯ 0%';
        }
    }

    // Detect stream type
    const isM3u8 = url.toLowerCase().includes('.m3u8');
    const isLive = (type === 'live');
    
    if (isM3u8 && Hls.isSupported()) {
        // ======================================================
        // HLS.js — Optimized config for fast start + caching
        // ======================================================
        state.hlsPlayer = new Hls({
            // --- FASTER START ---
            // Start at lowest quality for instant playback, then ramp up
            startLevel: -1,              // auto-select best level for network
            abrEwmaDefaultEstimate: 500000,  // initial BW estimate: 500kbps
            abrEwmaFastLive: 3.0,        // faster ABR adaptation (live)
            abrEwmaSlowLive: 9.0,
            abrEwmaFastVoD: 3.0,         // faster ABR adaptation (VOD)
            abrEwmaSlowVoD: 9.0,

            // --- BUFFER SIZES ---
            // For live: keep buffer short to stay near live edge
            // For VOD: large buffer = less rebuffering when seeking
            maxBufferLength: isLive ? 8 : 60,           // seconds ahead to buffer
            maxMaxBufferLength: isLive ? 12 : 120,      // absolute max buffer cap
            maxBufferSize: isLive ? 30 * 1000 * 1000 : 120 * 1000 * 1000,  // bytes
            maxBufferHole: 0.5,         // tolerate small gaps in buffer

            // --- CACHE ALREADY-BUFFERED SEGMENTS (seek without rebuffering) ---
            // Keep previously watched segments in memory
            backBufferLength: isLive ? 0 : 90,  // seconds of back-buffer to retain
            
            // --- NETWORK / RETRY ---
            manifestLoadingMaxRetry: 6,
            manifestLoadingRetryDelay: 1000,
            levelLoadingMaxRetry: 6,
            levelLoadingRetryDelay: 1000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 500,

            // --- QUALITY SWITCHING ---
            // Don't drop quality immediately on slow network — gives smoother experience
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,

            // --- PROGRESSIVE / WORKER ---
            progressive: true,           // start playing as soon as first fragment decoded
            enableWorker: true,          // use background web worker for demuxing
            lowLatencyMode: isLive,      // low latency mode for live streams only
        });

        state.hlsPlayer.loadSource(url);
        state.hlsPlayer.attachMedia(DOM.video);

        state.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
            setupHlsQualities();
            DOM.video.play().catch(e => console.log('Auto-play blocked, user action required.'));
        });

        // Update loader text during fragment loading
        state.hlsPlayer.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
            if (DOM.playerLoaderText && !DOM.playerLoader.classList.contains('hidden')) {
                DOM.playerLoaderText.textContent = 'Buffering...';
            }
        });

        state.hlsPlayer.on(Hls.Events.LEVEL_SWITCHED, () => {
            updateQualityButtonLabel();
        });

        state.hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('Fatal network error in HLS, trying recovery...');
                        state.hlsPlayer.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('Fatal media error in HLS, trying recovery...');
                        state.hlsPlayer.recoverMediaError();
                        break;
                    default:
                        console.error('Fatal HLS error, resetting playback.');
                        stopVideoPlayback();
                        showToast('Error playing HLS stream', 'error');
                        break;
                }
            }
        });
    } 
    // If it's MPEG-TS stream (.ts extension) or force-using mpegts.js
    else if ((url.toLowerCase().includes('.ts') || state.preferences.format === 'ts') && mpegts.getFeatureList().mseLivePlayback) {
        state.tsPlayer = mpegts.createPlayer({
            type: 'mse',
            isLive: isLive,
            url: url
        }, {
            enableWorker: true,
            // Keep up to 60s of back-buffer so seeking doesn't re-download
            lazyLoadMaxKeepAliveDuration: isLive ? 10 : 60,
            // Prefer range requests for seeking (uses cached data)
            seekType: 'range',
            // Larger receive buffer for mobile stability
            stashInitialSize: 1024 * 512,  // 512KB initial stash
        });
        
        state.tsPlayer.attachMediaElement(DOM.video);
        state.tsPlayer.load();
        state.tsPlayer.play().catch(e => console.log('Auto-play blocked, user action required.'));
        
        state.tsPlayer.on(mpegts.Events.ERROR, (type, detail, info) => {
            console.error('mpegts.js error:', type, detail, info);
            setTimeout(() => {
                if (DOM.video.paused) {
                    DOM.video.play().catch(e => {});
                }
            }, 1000);
        });
    } 
    // Fallback: Direct Source feeding (Safari native / MP4)
    else {
        DOM.video.src = url;
        DOM.video.load();
        DOM.video.play().catch(e => console.log('Auto-play blocked, user action required.'));
    }
}

// Media player events
function initPlayerEvents() {
    const video = DOM.video;
    
    // Playback events
    video.addEventListener('waiting', () => {
        DOM.playerLoader.classList.remove('hidden');
    });
    
    video.addEventListener('playing', () => {
        DOM.playerLoader.classList.add('hidden');
        DOM.playerWrapper.classList.remove('paused');
        updatePlayBtnUI(true);
    });

    video.addEventListener('pause', () => {
        DOM.playerWrapper.classList.add('paused');
        updatePlayBtnUI(false);
    });

    video.addEventListener('error', (e) => {
        console.error('HTML5 video error event:', e);
        DOM.playerLoader.classList.add('hidden');
        // Ignore normal aborts
        if (video.error && video.error.code !== 4) {
            showToast(`Streaming media error: Code ${video.error.code}`, 'error');
        }
    });

    // Time progress for VOD seeking
    video.addEventListener('timeupdate', () => {
        if (state.currentStream && state.currentStream.type !== 'live') {
            const current = video.currentTime;
            const duration = video.duration || 0;
            
            if (duration > 0) {
                const pct = (current / duration) * 100;
                DOM.playerProgressFill.style.width = `${pct}%`;
                DOM.playerProgressHandle.style.left = `${pct}%`;
                
                DOM.playerTimeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
            }
        }
    });

    // Update buffer progress highlight on progress/timeupdate events
    video.addEventListener('progress', updateBufferProgress);
    video.addEventListener('timeupdate', updateBufferProgress);

    // Toggle Play/Pause on click
    DOM.playPauseBtn.addEventListener('click', togglePlayPause);
    DOM.overlayPlayPauseBtn.addEventListener('click', togglePlayPause);
    DOM.video.addEventListener('click', togglePlayPause);

    // Mute/Volume
    DOM.muteBtn.addEventListener('click', toggleMute);
    DOM.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        video.volume = val;
        video.muted = (val === 0);
        updateVolumeUI();
    });

    // Fullscreen
    DOM.fullscreenBtn.addEventListener('click', toggleFullscreen);
    DOM.playerWrapper.addEventListener('dblclick', toggleFullscreen);

    // Picture in Picture
    DOM.pipBtn.addEventListener('click', async () => {
        try {
            if (video !== document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (e) {
            showToast('Picture-in-Picture not supported in this browser.', 'error');
        }
    });

    // Aspect Ratio
    DOM.aspectRatioBtn.addEventListener('click', changeAspectRatio);

    // Progress Bar Clicks for seeking VODs
    DOM.playerProgressContainer.addEventListener('click', (e) => {
        if (state.currentStream && state.currentStream.type !== 'live') {
            const rect = DOM.playerProgressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = clickX / rect.width;
            
            const duration = video.duration || 0;
            if (duration > 0) {
                video.currentTime = duration * pct;
            }
        }
    });

    // Hover time tracking on seek bar
    DOM.playerProgressContainer.addEventListener('mousemove', (e) => {
        if (state.currentStream && state.currentStream.type !== 'live') {
            const rect = DOM.playerProgressContainer.getBoundingClientRect();
            const hoverX = e.clientX - rect.left;
            const pct = hoverX / rect.width;
            const duration = video.duration || 0;
            
            if (duration > 0) {
                DOM.progressHoverTime.style.opacity = '1';
                DOM.progressHoverTime.style.left = `${pct * 100}%`;
                DOM.progressHoverTime.textContent = formatTime(duration * pct);
            }
        }
    });

    DOM.playerProgressContainer.addEventListener('mouseleave', () => {
        DOM.progressHoverTime.style.opacity = '0';
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent key triggers when typing in search boxes or login fields
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        // Only active if we have a stream loaded
        if (!state.currentStream) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'KeyM':
                toggleMute();
                break;
            case 'KeyF':
                toggleFullscreen();
                break;
            case 'ArrowLeft':
                if (state.currentStream.type !== 'live') {
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                }
                break;
            case 'ArrowRight':
                if (state.currentStream.type !== 'live') {
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                DOM.volumeSlider.value = video.volume;
                updateVolumeUI();
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                DOM.volumeSlider.value = video.volume;
                updateVolumeUI();
                break;
        }
    });

    // Toggle quality menu
    if (DOM.qualityBtn) {
        DOM.qualityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (DOM.qualityMenu) {
                DOM.qualityMenu.classList.toggle('hidden');
            }
        });
    }

    // Dismiss menu when clicking outside
    document.addEventListener('click', (e) => {
        if (DOM.qualityMenu && !DOM.qualityMenu.classList.contains('hidden')) {
            const container = document.querySelector('.quality-selector-container');
            if (container && !container.contains(e.target)) {
                DOM.qualityMenu.classList.add('hidden');
            }
        }
    });

    // Detect resolution metadata for direct video feeds
    video.addEventListener('loadedmetadata', () => {
        if (!state.hlsPlayer) {
            updateSingleQualityLabel();
        }
    });
}

// ==========================================
// VIDEO QUALITY SELECTOR ENGINE
// ==========================================
function setupHlsQualities() {
    const menu = DOM.qualityMenu;
    if (!menu || !state.hlsPlayer) return;
    menu.innerHTML = '';
    
    const levels = state.hlsPlayer.levels || [];
    
    if (levels.length <= 1) {
        setupSingleQualityOption();
        return;
    }
    
    // Add "Auto" option
    const autoBtn = document.createElement('button');
    autoBtn.className = 'quality-item' + (state.hlsPlayer.loadLevel === -1 ? ' active' : '');
    autoBtn.textContent = 'Auto';
    autoBtn.onclick = () => {
        state.hlsPlayer.currentLevel = -1;
        updateQualityMenuSelection(-1);
        menu.classList.add('hidden');
    };
    menu.appendChild(autoBtn);
    
    // Map levels to original indices and sort highest resolution first
    const mapped = levels.map((lvl, idx) => ({ lvl, originalIndex: idx }))
                         .sort((a, b) => (b.lvl.height || 0) - (a.lvl.height || 0));
                         
    mapped.forEach(({ lvl, originalIndex }) => {
        const btn = document.createElement('button');
        btn.className = 'quality-item' + (state.hlsPlayer.loadLevel === originalIndex ? ' active' : '');
        
        const label = lvl.height ? `${lvl.height}p` : `${lvl.bitrate ? Math.round(lvl.bitrate / 1000) + 'k' : 'Lvl ' + originalIndex}`;
        btn.textContent = label;
        
        btn.onclick = () => {
            state.hlsPlayer.currentLevel = originalIndex;
            updateQualityMenuSelection(originalIndex);
            menu.classList.add('hidden');
        };
        menu.appendChild(btn);
    });
    
    updateQualityButtonLabel();
}

function updateQualityMenuSelection(activeIndex) {
    const menu = DOM.qualityMenu;
    if (!menu || !state.hlsPlayer) return;
    
    const items = menu.querySelectorAll('.quality-item');
    items.forEach(item => {
        if (item.textContent === 'Auto') {
            if (activeIndex === -1) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        } else {
            const currentLevel = state.hlsPlayer.levels[activeIndex];
            if (currentLevel && item.textContent === `${currentLevel.height}p`) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
    
    updateQualityButtonLabel();
}

function updateQualityButtonLabel() {
    if (!DOM.qualityBtn) return;
    const span = DOM.qualityBtn.querySelector('span');
    if (!span) return;
    
    if (!state.hlsPlayer) {
        updateSingleQualityLabel();
        return;
    }
    
    const curLvl = state.hlsPlayer.currentLevel;
    
    if (curLvl === -1) {
        // Auto mode
        const activeIdx = state.hlsPlayer.currentLevel;
        const activeLevel = state.hlsPlayer.levels[activeIdx];
        if (activeLevel && activeLevel.height) {
            span.textContent = `Auto (${activeLevel.height}p)`;
        } else {
            span.textContent = 'Auto';
        }
    } else {
        const level = state.hlsPlayer.levels[curLvl];
        span.textContent = level && level.height ? `${level.height}p` : 'Source';
    }
}

function setupSingleQualityOption() {
    const menu = DOM.qualityMenu;
    if (!menu) return;
    menu.innerHTML = '';
    
    const btn = document.createElement('button');
    btn.className = 'quality-item active';
    btn.textContent = 'Source';
    btn.onclick = () => {
        menu.classList.add('hidden');
    };
    menu.appendChild(btn);
    
    updateSingleQualityLabel();
}

function updateSingleQualityLabel() {
    if (!DOM.qualityBtn) return;
    const span = DOM.qualityBtn.querySelector('span');
    if (!span) return;
    
    if (DOM.video.videoHeight) {
        span.textContent = `${DOM.video.videoHeight}p`;
    } else {
        span.textContent = 'Source';
    }
}

function togglePlayPause() {
    if (DOM.video.paused) {
        DOM.video.play().catch(e => console.log(e));
    } else {
        DOM.video.pause();
    }
}

function updatePlayBtnUI(isPlaying) {
    const playIcon = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    DOM.playPauseBtn.innerHTML = playIcon;
    DOM.overlayPlayPauseBtn.innerHTML = playIcon;
}

function toggleMute() {
    DOM.video.muted = !DOM.video.muted;
    if (!DOM.video.muted && DOM.video.volume === 0) {
        DOM.video.volume = 0.5;
        DOM.volumeSlider.value = 0.5;
    }
    updateVolumeUI();
}

function updateVolumeUI() {
    DOM.volumeSlider.value = DOM.video.muted ? 0 : DOM.video.volume;
    
    if (DOM.video.muted || DOM.video.volume === 0) {
        DOM.muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else if (DOM.video.volume < 0.4) {
        DOM.muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
    } else {
        DOM.muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
}

function toggleFullscreen() {
    const wrapper = DOM.playerWrapper;
    
    // Detect WebView environment: requestFullscreen may be undefined or broken
    const canNativeFullscreen = typeof document.fullscreenEnabled !== 'undefined' && document.fullscreenEnabled;
    
    if (canNativeFullscreen) {
        // Desktop / browser: use native fullscreen API
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                // Fall back to fake fullscreen if native fails
                wrapper.classList.toggle('webview-fullscreen');
            });
        } else {
            document.exitFullscreen();
        }
    } else {
        // Android WebView: toggle CSS-based fake fullscreen
        const isFullscreen = wrapper.classList.toggle('webview-fullscreen');
        // Update fullscreen button icon
        if (DOM.fullscreenBtn) {
            DOM.fullscreenBtn.innerHTML = isFullscreen
                ? '<i class="fa-solid fa-compress"></i>'
                : '<i class="fa-solid fa-expand"></i>';
        }
        // Lock to landscape when entering fake fullscreen
        if (isFullscreen && window.screen && window.screen.orientation && window.screen.orientation.lock) {
            window.screen.orientation.lock('landscape').catch(() => {});
        } else if (!isFullscreen && window.screen && window.screen.orientation && window.screen.orientation.unlock) {
            window.screen.orientation.unlock();
        }
    }
}

// Request fullscreen on player wrapper
function requestFullscreenPlayer() {
    const wrapper = DOM.playerWrapper;
    const canNativeFullscreen = typeof document.fullscreenEnabled !== 'undefined' && document.fullscreenEnabled;
    if (canNativeFullscreen) {
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                console.warn(err);
            });
        }
    } else {
        // In WebView: auto-trigger fake fullscreen for movies/VOD
        if (!wrapper.classList.contains('webview-fullscreen')) {
            wrapper.classList.add('webview-fullscreen');
            if (DOM.fullscreenBtn) {
                DOM.fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
            }
        }
    }
}

function changeAspectRatio() {
    state.aspectRatioIndex = (state.aspectRatioIndex + 1) % state.aspectRatios.length;
    const ratio = state.aspectRatios[state.aspectRatioIndex];
    
    // Apply styling to video tag
    const video = DOM.video;
    if (ratio === 'contain') {
        video.style.objectFit = 'contain';
        DOM.aspectRatioBtn.querySelector('span').textContent = 'Auto';
    } else if (ratio === 'stretch') {
        video.style.objectFit = 'fill';
        DOM.aspectRatioBtn.querySelector('span').textContent = 'Stretch';
    } else if (ratio === '4:3') {
        video.style.objectFit = 'fill'; // stretch to fit but let's see, it is best done with aspect-ratio styling or resizing. fill is fine
        video.style.aspectRatio = '4/3';
        DOM.aspectRatioBtn.querySelector('span').textContent = '4:3';
    } else if (ratio === 'cover') {
        video.style.objectFit = 'cover';
        DOM.aspectRatioBtn.querySelector('span').textContent = 'Zoom';
    }
    
    // Reset aspect-ratio property on non-4:3 ratios
    if (ratio !== '4:3') {
        video.style.aspectRatio = '';
    }
    
    showToast(`Aspect Ratio set to: ${ratio.toUpperCase()}`, 'info');
}

// Helper: Format Seconds to MM:SS or HH:MM:SS
function formatTime(sec) {
    if (isNaN(sec)) return '00:00';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;
    
    if (hrs > 0) {
        return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
}

// ==========================================
// 7. BANDWIDTH USAGE MONITOR MODULE
// ==========================================
let usageInterval = null;

function startUsageTracking() {
    if (usageInterval) clearInterval(usageInterval);
    updateUsageStats();
    usageInterval = setInterval(() => {
        if (state.activeView === 'usage') {
            updateUsageStats();
        } else {
            clearInterval(usageInterval);
            usageInterval = null;
        }
    }, 2000);
}

async function updateUsageStats() {
    try {
        const response = await fetch('/api/usage');
        if (!response.ok) throw new Error('Failed to fetch usage stats');
        
        const data = await response.json();
        
        // Update DOM
        DOM.usageTotalVal.textContent = formatBytes(data.totalBytes);
        DOM.usageStreamVal.textContent = formatBytes(data.streamBytes);
        DOM.usageApiVal.textContent = formatBytes(data.apiBytes);
        DOM.usageStartTime.textContent = data.startTime || '-';
        
        // Proxy Status
        DOM.usageProxyStatus.textContent = state.preferences.forceProxy 
            ? 'Enabled (Full Tracking)' 
            : 'Disabled (Video bytes bypassed)';
            
    } catch (err) {
        console.error('Failed to update usage stats:', err);
    }
}

// Helper: Format bytes to human readable format (MB, GB, etc.)
function formatBytes(bytes) {
    if (bytes === 0) return '0.00 MB';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function updateMediaCacheSize() {
    try {
        const response = await fetch('/api/cache/size');
        if (!response.ok) throw new Error('Failed to fetch cache size');
        const data = await response.json();
        
        DOM.mediaCacheSizeDesc.textContent = `Currently using ${formatBytes(data.size)} on local disk for cached movies and series.`;
    } catch (err) {
        console.error('Failed to update cache size:', err);
        DOM.mediaCacheSizeDesc.textContent = 'Failed to check cache size.';
    }
}

function updateBufferProgress() {
    if (!state.currentStream || state.currentStream.type === 'live') return;
    
    const video = DOM.video;
    const duration = video.duration || 0;
    if (duration <= 0 || !video.buffered || video.buffered.length === 0) return;

    const currentTime = video.currentTime;
    let maxBufferedEnd = 0;
    let activeRangeEnd = 0;

    // Find buffered range that covers current position
    // AND track the maximum buffered position across all ranges
    for (let i = 0; i < video.buffered.length; i++) {
        const start = video.buffered.start(i);
        const end = video.buffered.end(i);
        if (end > maxBufferedEnd) maxBufferedEnd = end;
        if (currentTime >= start && currentTime <= end) {
            activeRangeEnd = end;
        }
    }

    // Use max buffered end to show the full extent of cached data
    if (activeRangeEnd === 0) {
        activeRangeEnd = maxBufferedEnd;
    }
    
    // Update progress bar buffer fill (shows extent of cached data ahead)
    const bufPct = Math.min((activeRangeEnd / duration) * 100, 100);
    DOM.playerProgressBuffer.style.width = `${bufPct}%`;

    // Update buffer % badge
    if (DOM.bufferPctBadge) {
        // Show total buffered time ahead of current position
        const bufferedAheadSecs = Math.max(activeRangeEnd - currentTime, 0);
        const totalBufferedPct = Math.round((maxBufferedEnd / duration) * 100);
        
        // Color-code by buffer health
        if (totalBufferedPct >= 80) {
            DOM.bufferPctBadge.style.color = '#66fcf1';   // teal = fully buffered
        } else if (totalBufferedPct >= 30) {
            DOM.bufferPctBadge.style.color = '#f5c842';   // yellow = mid
        } else {
            DOM.bufferPctBadge.style.color = '#ff6b6b';   // red = low buffer
        }
        DOM.bufferPctBadge.textContent = `◉ ${totalBufferedPct}%`;
    }

    // Also update loading overlay's mini buffer display while buffering
    if (DOM.bufferLoadingPct && !DOM.playerLoader.classList.contains('hidden')) {
        const ahead = Math.max(activeRangeEnd - currentTime, 0);
        DOM.bufferLoadingPct.textContent = `${ahead.toFixed(1)}s buffered`;
    }
}
