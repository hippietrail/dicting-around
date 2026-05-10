// Dictionary configurations from hippiebot.js
const dictionaries = [
    {
        name: 'American Heritage',
        baseUrl: 'https://ahdictionary.com/word/search.html',
        queryParam: 'q'
    },
    {
        name: 'Britannica',
        baseUrl: 'https://www.britannica.com/dictionary/',
        noQuery: true
    },
    {
        name: 'Cambridge',
        baseUrl: 'https://dictionary.cambridge.org/dictionary/english/',
        noQuery: true
    },
    {
        name: 'Chambers',
        baseUrl: 'https://chambers.co.uk/search/',
        queryParams: { query: 'word', title: '21st' }
    },
    {
        name: 'Collins',
        baseUrl: 'https://www.collinsdictionary.com/dictionary/english/',
        noQuery: true
    },
    {
        name: 'Longman',
        baseUrl: 'https://www.ldoceonline.com/dictionary/',
        noQuery: true
    },
    {
        name: 'Merriam-Webster',
        baseUrl: 'https://www.merriam-webster.com/dictionary/',
        noQuery: true
    },
    {
        name: 'OED',
        baseUrl: 'https://www.oed.com/dictionary/',
        queryParams: { '': '', tl: 'true' }
    },
    {
        name: 'Oxford Learner\'s',
        baseUrl: 'https://www.oxfordlearnersdictionaries.com/definition/english/',
        noQuery: true
    }
];

let currentWord = '';
let currentTab = 'debug'; // Default to debug tab

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Handle Enter key
    document.getElementById('word-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupWord();
        }
    });

    // Handle tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Handle search button click
    document.getElementById('search-btn').addEventListener('click', function() {
        lookupWord();
    });
});

function switchTab(tabName) {
    console.log(`🔄 switchTab: switching to "${tabName}"`);
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        const shouldBeActive = content.id === `tab-${tabName}`;
        const isActive = content.classList.contains('active');
        console.log(`📋 tab content: ${content.id}, active: ${isActive}, should be: ${shouldBeActive}`);
        content.classList.toggle('active', shouldBeActive);
    });
    
    // Special debugging for Oxford Learners
    if (tabName === 'oxford-learners') {
        console.log(`🎯 Oxford Learners tab activated`);
        const oxfordContent = document.getElementById('content-oxford-learners');
        if (oxfordContent) {
            console.log(`✅ Oxford Learners content div found:`, oxfordContent);
            console.log(`📋 Oxford Learners content visible:`, oxfordContent.style.display);
            console.log(`📋 Oxford Learners content innerHTML:`, oxfordContent.innerHTML);
        } else {
            console.error(`❌ Oxford Learners content div NOT found!`);
        }
    }
    
    // If switching to debug tab and we have a word, show debug info
    if (tabName === 'debug' && currentWord) {
        showDebugInfo();
    }
}

function lookupWord() {
    const word = document.getElementById('word-input').value.trim();
    if (!word) {
        alert('Please enter a word');
        return;
    }

    currentWord = word;
    
    // Clear debug info
    const debugContent = document.getElementById('debug-content');
    debugContent.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Loading dictionaries...</div>';
    
    // Create dictionary sections for debug view
    createDebugSections(word);
    
    // Switch to debug tab to show progress
    switchTab('debug');
}

function createDebugSections(word) {
    const debugContent = document.getElementById('debug-content');
    debugContent.innerHTML = '';
    
    // Create console-style output
    const consoleDiv = document.createElement('div');
    consoleDiv.style.cssText = `
        background: #1e1e1e;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
        line-height: 1.4;
        white-space: pre-wrap;
        overflow-x: auto;
    `;
    consoleDiv.innerHTML = `<div style="color: #888; margin-bottom: 10px;">🔍 Dictionary Analysis Tools</div>`;
    
    debugContent.appendChild(consoleDiv);
    
    // Create individual test buttons for each dictionary
    for (const dict of dictionaries) {
        const dictSection = document.createElement('div');
        dictSection.style.cssText = `
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 4px;
            margin: 10px 0;
            padding: 15px;
        `;
        
        dictSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #00ff00; font-weight: bold;">${dict.name}</span>
                <button class="view-btn" onclick="testIndividualDictionary('${dict.name.replace(/'/g, "\\'")}', '${word}')" style="background: #007acc; color: white;">
                    🔬 Test/Analyze
                </button>
            </div>
            <div id="result-${dict.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}" style="color: #888; font-size: 12px;">
                Click "Test/Analyze" to check this dictionary
            </div>
        `;
        
        debugContent.appendChild(dictSection);
    }
}

async function testAllDictionariesWithResults(word, consoleDiv) {
    consoleDiv.innerHTML += `<div style="color: #888;">⏳ Testing dictionaries...</div>`;
    
    for (let i = 0; i < dictionaries.length; i++) {
        const dict = dictionaries[i];
        
        consoleDiv.innerHTML += `<div style="color: #888;">🧪 Testing ${dict.name}...</div>`;
        
        try {
            const result = await testDictionary(dict, word);
            
            let statusIcon = '✅';
            let statusColor = '#00ff00';
            let details = '';
            
            if (result.blocked) {
                statusIcon = '🚫';
                statusColor = '#ff6b6b';
                details = `<div style="color: #ff6b6b; margin-left: 20px; font-size: 12px;">
                    BLOCKED: ${result.reason}
                    ${result.xfo ? `<div>X-Frame-Options: ${result.xfo}</div>` : ''}
                    ${result.csp ? `<div>CSP: ${result.csp}</div>` : ''}
                </div>`;
            } else if (result.error) {
                statusIcon = '❌';
                statusColor = '#ffa500';
                details = `<div style="color: #ffa500; margin-left: 20px; font-size: 12px;">
                    ERROR: ${result.error}
                </div>`;
            } else {
                details = `<div style="color: #00ff00; margin-left: 20px; font-size: 12px;">
                    SUCCESS: Can load via iframe
                    URL: ${result.url}
                </div>`;
            }
            
            consoleDiv.innerHTML += `<div style="color: ${statusColor}; margin: 5px 0;">
                ${statusIcon} ${dict.name}: ${result.blocked ? 'BLOCKED' : result.error ? 'ERROR' : 'WORKS'}
            </div>`;
            
            consoleDiv.innerHTML += details;
            
        } catch (error) {
            consoleDiv.innerHTML += `<div style="color: #ff6b6b; margin: 5px 0;">
                ❌ ${dict.name}: CRASH - ${error.message}
            </div>`;
        }
        
        // Small delay between tests
        if (i < dictionaries.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    consoleDiv.innerHTML += `<div style="color: #888; margin-top: 20px;">✨ Testing complete!</div>`;
}

async function testDictionary(dict, word) {
    let url;
    if (dict.noQuery) {
        url = dict.baseUrl + encodeURIComponent(word);
    } else if (dict.queryParams) {
        const params = { ...dict.queryParams };
        if (dict.queryParams.query !== undefined) {
            params.query = word;
        }
        // Handle OED case with empty key for word
        if (dict.queryParams[''] !== undefined) {
            params[''] = word;
        }
        const queryString = Object.entries(params)
            .map(([key, val]) => {
                if (key === '') return encodeURIComponent(val);
                return `${key}=${encodeURIComponent(val)}`;
            })
            .join('&');
        url = dict.baseUrl + '?' + queryString;
    } else {
        url = dict.baseUrl + '?' + dict.queryParam + '=' + encodeURIComponent(word);
    }

    try {
        const response = await fetch(url, { method: 'HEAD' });
        const csp = response.headers.get('Content-Security-Policy');
        const xfo = response.headers.get('X-Frame-Options');
        
        let blocked = false;
        let reason = '';
        
        if (xfo) {
            blocked = true;
            reason = `X-Frame-Options header blocks iframe embedding`;
        } else if (csp && csp.includes('frame-ancestors')) {
            blocked = true;
            reason = `Content-Security-Policy blocks iframe embedding`;
        }
        
        return {
            url,
            blocked,
            reason,
            xfo,
            csp,
            error: null
        };
        
    } catch (error) {
        return {
            url,
            blocked: false,
            reason: '',
            error: error.message
        };
    }
}

async function testIndividualDictionary(dictName, word) {
    const resultDiv = document.getElementById(`result-${dictName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`);
    const dict = dictionaries.find(d => d.name === dictName);
    
    if (!dict) {
        resultDiv.innerHTML = '<span style="color: #ff6b6b;">❌ Dictionary not found</span>';
        return;
    }
    
    resultDiv.innerHTML = '<span style="color: #888;">🧪 Analyzing...</span>';
    
    try {
        const result = await testDictionary(dict, word);
        
        let statusIcon = '✅';
        let statusColor = '#00ff00';
        let details = '';
        
        if (result.blocked) {
            statusIcon = '🚫';
            statusColor = '#ff6b6b';
            details = `<div style="color: #ff6b6b; margin-top: 10px; font-size: 11px; line-height: 1.3;">
                <strong>🔒 BLOCKED</strong><br>
                ${result.reason}<br>
                <strong>URL:</strong> ${result.url}<br>
                ${result.xfo ? `<strong>X-Frame-Options:</strong> ${result.xfo}<br>` : ''}
                ${result.csp ? `<strong>CSP:</strong> ${result.csp}<br>` : ''}
                <strong>Recommendation:</strong> Use "Fallback" button in individual dictionary tab
            </div>`;
        } else if (result.error) {
            statusIcon = '❌';
            statusColor = '#ffa500';
            details = `<div style="color: #ffa500; margin-top: 10px; font-size: 11px; line-height: 1.3;">
                <strong>🚨 ERROR</strong><br>
                ${result.error}<br>
                <strong>URL:</strong> ${result.url}<br>
                <strong>Recommendation:</strong> Check network connectivity or try "New Tab" button
            </div>`;
        } else {
            details = `<div style="color: #00ff00; margin-top: 10px; font-size: 11px; line-height: 1.3;">
                <strong>✅ WORKS</strong><br>
                Can load via iframe<br>
                <strong>URL:</strong> ${result.url}<br>
                <strong>Recommendation:</strong> Use "View" button in individual dictionary tab
            </div>`;
        }
        
        resultDiv.innerHTML = `<span style="color: ${statusColor};">${statusIcon} ${dictName}</span>${details}`;
        
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: #ff6b6b;">❌ CRASH - ${error.message}</span>`;
    }
}

async function testDictionaryIframe(dict, word) {
    const contentId = `content-${dict.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    const contentDiv = document.getElementById(contentId);
    
    if (!contentDiv) return;

    let url;
    if (dict.noQuery) {
        url = dict.baseUrl + encodeURIComponent(word);
    } else if (dict.queryParams) {
        const params = { ...dict.queryParams };
        if (dict.queryParams.query !== undefined) {
            params.query = word;
        }
        // Handle OED case with empty key for word
        if (dict.queryParams[''] !== undefined) {
            params[''] = word;
        }
        const queryString = Object.entries(params)
            .map(([key, val]) => {
                if (key === '') return encodeURIComponent(val);
                return `${key}=${encodeURIComponent(val)}`;
            })
            .join('&');
        url = dict.baseUrl + '?' + queryString;
    } else {
        url = dict.baseUrl + '?' + dict.queryParam + '=' + encodeURIComponent(word);
    }

    console.log(`🧪 Testing ${dict.name}: ${url}`);

    // Test with fetch to check headers
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const csp = response.headers.get('Content-Security-Policy');
        const xfo = response.headers.get('X-Frame-Options');
        
        let status = '✅ Should work';
        let statusClass = 'success';
        
        if (xfo || (csp && csp.includes('frame-ancestors'))) {
            status = '🚫 Blocks iframe';
            statusClass = 'blocked';
        }
        
        contentDiv.innerHTML = `
            <div class="test-result ${statusClass}">
                <div class="status">${status}</div>
                <div class="url">${url}</div>
                ${xfo ? `<div class="header">X-Frame-Options: ${xfo}</div>` : ''}
                ${csp ? `<div class="header">CSP: ${csp}</div>` : ''}
            </div>
        `;
        
        console.log(`${statusClass === 'success' ? '✅' : '🚫'} ${dict.name}: ${status}`);
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div class="test-result error">
                <div class="status">❌ Test failed</div>
                <div class="url">${url}</div>
                <div class="error-msg">${error.message}</div>
            </div>
        `;
        console.error(`❌ ${dict.name}: ${error.message}`);
    }
}

function showDebugInfo() {
    const debugContent = document.getElementById('debug-content');
    if (!currentWord || debugContent.children.length > 0) return;
    
    createDebugSections(currentWord);
}

function loadDictionary(dictName, word) {
    const dict = dictionaries.find(d => d.name === dictName);
    if (!dict) return;

    const contentId = `content-${dictName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}`;
    console.log(`🔍 loadDictionary: dictName="${dictName}", contentId="${contentId}"`);
    
    const contentDiv = document.getElementById(contentId);
    console.log(`📋 contentDiv found:`, contentDiv ? 'YES' : 'NO');
    
    if (!contentDiv) return;
    
    // Special debugging for Oxford Learners
    if (dictName === 'Oxford Learner\'s') {
        console.log(`🎯 Oxford Learners loadDictionary called`);
        console.log(`📋 dict config:`, dict);
        console.log(`📋 word: "${word}"`);
    }

    contentDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

    let url;
    if (dict.noQuery) {
        url = dict.baseUrl + encodeURIComponent(word);
    } else if (dict.queryParams) {
        const params = { ...dict.queryParams };
        if (dict.queryParams.query !== undefined) {
            params.query = word;
        }
        // Handle OED case with empty key for word
        if (dict.queryParams[''] !== undefined) {
            params[''] = word;
        }
        const queryString = Object.entries(params)
            .map(([key, val]) => {
                if (key === '') return encodeURIComponent(val);
                return `${key}=${encodeURIComponent(val)}`;
            })
            .join('&');
        url = dict.baseUrl + '?' + queryString;
    } else {
        url = dict.baseUrl + '?' + dict.queryParam + '=' + encodeURIComponent(word);
    }

    console.log(`🚀 Loading ${dictName}: ${url}`);
    
    // Clear any existing content first
    contentDiv.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.className = 'dictionary-iframe';
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.3s ease-in-out';
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    
    iframe.onload = () => {
        console.log(`✅ Loaded ${dictName}: ${url}`);
        // Fade in to prevent flashing
        setTimeout(() => {
            iframe.style.opacity = '1';
        }, 100);
    };
    iframe.onerror = () => {
        console.log(`❌ Failed ${dictName}: ${url}`);
        contentDiv.innerHTML = '<div class="error">Failed to load dictionary (blocked by X-Frame-Options or CSP)</div>';
    };
    
    // Add timeout to detect blocking
    setTimeout(() => {
        if (contentDiv.querySelector('.loading')) {
            console.log(`⏰ Timeout ${dictName}: ${url} - likely blocked`);
            contentDiv.innerHTML = '<div class="error">Dictionary blocked iframe embedding (timeout)</div>';
        }
    }, 5000);

    contentDiv.appendChild(iframe);
    
    // Set src immediately after appending
    iframe.src = url;
    console.log(`📡 Set iframe src to: ${url}`);
}

async function fetchDictionaryFallback(dictName, word) {
    const dict = dictionaries.find(d => d.name === dictName);
    if (!dict) return;

    const contentId = `content-${dictName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}`;
    const contentDiv = document.getElementById(contentId);
    
    if (!contentDiv) return;

    contentDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Fetching content...</div>';

    let url;
    if (dict.noQuery) {
        url = dict.baseUrl + encodeURIComponent(word);
    } else if (dict.queryParams) {
        const params = { ...dict.queryParams };
        if (dict.queryParams.query !== undefined) {
            params.query = word;
        }
        // Handle OED case with empty key for word
        if (dict.queryParams[''] !== undefined) {
            params[''] = word;
        }
        const queryString = Object.entries(params)
            .map(([key, val]) => {
                if (key === '') return encodeURIComponent(val);
                return `${key}=${encodeURIComponent(val)}`;
            })
            .join('&');
        url = dict.baseUrl + '?' + queryString;
    } else {
        url = dict.baseUrl + '?' + dict.queryParam + '=' + encodeURIComponent(word);
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        
        // Create a blob URL to display content
        const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        
        const iframe = document.createElement('iframe');
        iframe.className = 'dictionary-iframe';
        iframe.src = blobUrl;
        iframe.onload = () => {
            console.log(`✅ Fallback loaded ${dictName}`);
            URL.revokeObjectURL(blobUrl); // Clean up
        };
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(iframe);
        
    } catch (error) {
        console.error(`❌ Fallback failed ${dictName}:`, error);
        contentDiv.innerHTML = `
            <div class="error">
                Failed to fetch ${dictName}<br>
                <small>${error.message}</small><br><br>
                <a href="${url}" target="_blank">Open in new tab →</a>
            </div>
        `;
    }
}

function openInNewTab(dictName, word) {
    const dict = dictionaries.find(d => d.name === dictName);
    if (!dict) return;

    let url;
    if (dict.noQuery) {
        url = dict.baseUrl + encodeURIComponent(word);
    } else if (dict.queryParams) {
        const params = { ...dict.queryParams };
        if (dict.queryParams.query !== undefined) {
            params.query = word;
        }
        // Handle OED case with empty key for word
        if (dict.queryParams[''] !== undefined) {
            params[''] = word;
        }
        const queryString = Object.entries(params)
            .map(([key, val]) => {
                if (key === '') return encodeURIComponent(val);
                return `${key}=${encodeURIComponent(val)}`;
            })
            .join('&');
        url = dict.baseUrl + '?' + queryString;
    } else {
        url = dict.baseUrl + '?' + dict.queryParam + '=' + encodeURIComponent(word);
    }

    window.open(url, '_blank');
}
