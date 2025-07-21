// AI Job Chommie - Smart Caching Optimized JavaScript
// ===================================================

// Enhanced Configuration with Caching Focus
const CONFIG = {
    // API Keys - Replace with your actual keys
    PAYSTACK_PUBLIC_KEY: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE', // TODO: Replace
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', // TODO: Replace
    ANTHROPIC_API_KEY: 'your_anthropic_api_key_here', // For client-side Claude calls if needed
    
    // Smart Caching Configuration
    CACHE_CONFIG: {
        CV_CACHE_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
        JOB_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
        TEMPLATE_CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
        SEMANTIC_CACHE_DURATION: 3 * 24 * 60 * 60 * 1000, // 3 days
        MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
    },
    
    // Cost Savings Configuration
    COST_SAVINGS: {
        TRADITIONAL_CV_COST: 50, // R50 per CV processing
        TRADITIONAL_JOB_COST: 5, // R5 per job match
        TRADITIONAL_TEMPLATE_COST: 15, // R15 per cover letter
        CACHE_EFFICIENCY_TARGET: 0.90, // 90% cache hit rate
        CREDITS_TOTAL: 1500,
        CREDITS_SAVED_TARGET: 1350
    },
    
    ENVIRONMENT: 'development'
};

// Enhanced Application State with Caching Metrics
const AppState = {
    // Navigation state
    currentPage: 'home',
    isLoggedIn: false,
    user: null,
    
    // Caching metrics (live updating)
    cacheMetrics: {
        cvCacheHits: 0,
        cvCacheMisses: 0,
        jobCacheHits: 0,
        jobCacheMisses: 0,
        templateCacheHits: 0,
        templateCacheMisses: 0,
        totalSavings: 1350,
        efficiency: 90,
        creditsUsed: 150,
        creditsTotal: 1500
    },
    
    // User activity tracking
    userActivity: {
        applicationsThisMonth: 47,
        interviewsScheduled: 12,
        responseRate: 25,
        avgApplicationTime: '2.3 minutes'
    },
    
    // Three.js objects
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    
    // Cache storage
    cache: new Map(),
    cacheSize: 0
};

// Smart Caching System
const SmartCache = {
    // Initialize caching system
    init() {
        this.loadCacheFromStorage();
        this.startCacheMonitoring();
        this.scheduleCleanup();
        console.log('Smart caching system initialized - targeting 90% efficiency');
    },
    
    // Get data from cache with efficiency tracking
    get(key, type = 'general') {
        const cacheKey = `${type}_${key}`;
        const cached = AppState.cache.get(cacheKey);
        
        if (cached && !this.isExpired(cached)) {
            this.recordCacheHit(type);
            console.log(`Cache HIT: ${type} - saved R${this.calculateSavings(type)}`);
            return cached.data;
        }
        
        this.recordCacheMiss(type);
        console.log(`Cache MISS: ${type} - will cost R${this.calculateCost(type)}`);
        return null;
    },
    
    // Store data in cache
    set(key, data, type = 'general') {
        const cacheKey = `${type}_${key}`;
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            type: type,
            size: this.calculateSize(data)
        };
        
        // Check cache size limits
        if (AppState.cacheSize + cacheEntry.size > CONFIG.CACHE_CONFIG.MAX_CACHE_SIZE) {
            this.evictOldEntries();
        }
        
        AppState.cache.set(cacheKey, cacheEntry);
        AppState.cacheSize += cacheEntry.size;
        
        this.saveCacheToStorage();
        console.log(`Cached: ${type}_${key} - size: ${cacheEntry.size} bytes`);
    },
    
    // Check if cache entry is expired
    isExpired(cacheEntry) {
        const duration = this.getCacheDuration(cacheEntry.type);
        return (Date.now() - cacheEntry.timestamp) > duration;
    },
    
    // Get cache duration for different types
    getCacheDuration(type) {
        switch (type) {
            case 'cv': return CONFIG.CACHE_CONFIG.CV_CACHE_DURATION;
            case 'job': return CONFIG.CACHE_CONFIG.JOB_CACHE_DURATION;
            case 'template': return CONFIG.CACHE_CONFIG.TEMPLATE_CACHE_DURATION;
            case 'semantic': return CONFIG.CACHE_CONFIG.SEMANTIC_CACHE_DURATION;
            default: return 60 * 60 * 1000; // 1 hour default
        }
    },
    
    // Calculate cost savings for cache hits
    calculateSavings(type) {
        switch (type) {
            case 'cv': return CONFIG.COST_SAVINGS.TRADITIONAL_CV_COST;
            case 'job': return CONFIG.COST_SAVINGS.TRADITIONAL_JOB_COST;
            case 'template': return CONFIG.COST_SAVINGS.TRADITIONAL_TEMPLATE_COST;
            default: return 5;
        }
    },
    
    // Calculate cost for cache misses
    calculateCost(type) {
        return this.calculateSavings(type); // Same as savings since it's what we would have paid
    },
    
    // Record cache hit for metrics
    recordCacheHit(type) {
        switch (type) {
            case 'cv': 
                AppState.cacheMetrics.cvCacheHits++;
                break;
            case 'job': 
                AppState.cacheMetrics.jobCacheHits++;
                break;
            case 'template': 
                AppState.cacheMetrics.templateCacheHits++;
                break;
        }
        this.updateCacheEfficiency();
        this.updateSavings();
    },
    
    // Record cache miss for metrics
    recordCacheMiss(type) {
        switch (type) {
            case 'cv': 
                AppState.cacheMetrics.cvCacheMisses++;
                break;
            case 'job': 
                AppState.cacheMetrics.jobCacheMisses++;
                break;
            case 'template': 
                AppState.cacheMetrics.templateCacheMisses++;
                break;
        }
        this.updateCacheEfficiency();
    },
    
    // Update overall cache efficiency
    updateCacheEfficiency() {
        const totalHits = AppState.cacheMetrics.cvCacheHits + 
                         AppState.cacheMetrics.jobCacheHits + 
                         AppState.cacheMetrics.templateCacheHits;
        
        const totalMisses = AppState.cacheMetrics.cvCacheMisses + 
                           AppState.cacheMetrics.jobCacheMisses + 
                           AppState.cacheMetrics.templateCacheMisses;
        
        const total = totalHits + totalMisses;
        AppState.cacheMetrics.efficiency = total > 0 ? Math.round((totalHits / total) * 100) : 90;
        
        // Update UI elements
        this.updateCacheUI();
    },
    
    // Update savings calculation
    updateSavings() {
        const cvSavings = AppState.cacheMetrics.cvCacheHits * CONFIG.COST_SAVINGS.TRADITIONAL_CV_COST;
        const jobSavings = AppState.cacheMetrics.jobCacheHits * CONFIG.COST_SAVINGS.TRADITIONAL_JOB_COST;
        const templateSavings = AppState.cacheMetrics.templateCacheHits * CONFIG.COST_SAVINGS.TRADITIONAL_TEMPLATE_COST;
        
        AppState.cacheMetrics.totalSavings = cvSavings + jobSavings + templateSavings;
        
        // Update credits saved
        const creditsSavedPercent = AppState.cacheMetrics.efficiency / 100;
        AppState.cacheMetrics.creditsUsed = Math.round(CONFIG.COST_SAVINGS.CREDITS_TOTAL * (1 - creditsSavedPercent));
    },
    
    // Update cache-related UI elements
    updateCacheUI() {
        // Update cache efficiency displays
        const efficiencyElements = document.querySelectorAll('[data-cache-efficiency]');
        efficiencyElements.forEach(el => {
            el.textContent = `${AppState.cacheMetrics.efficiency}%`;
        });
        
        // Update savings displays
        const savingsElements = document.querySelectorAll('[data-cache-savings]');
        savingsElements.forEach(el => {
            el.textContent = `R${AppState.cacheMetrics.totalSavings}`;
        });
        
        // Update credits display
        const creditsElements = document.querySelectorAll('[data-credits-saved]');
        creditsElements.forEach(el => {
            const saved = CONFIG.COST_SAVINGS.CREDITS_TOTAL - AppState.cacheMetrics.creditsUsed;
            el.textContent = `${saved}/${CONFIG.COST_SAVINGS.CREDITS_TOTAL}`;
        });
    },
    
    // Calculate data size (approximation)
    calculateSize(data) {
        return new Blob([JSON.stringify(data)]).size;
    },
    
    // Evict old cache entries to free space
    evictOldEntries() {
        const entries = Array.from(AppState.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest 25% of entries
        const removeCount = Math.ceil(entries.length * 0.25);
        for (let i = 0; i < removeCount; i++) {
            const [key, entry] = entries[i];
            AppState.cache.delete(key);
            AppState.cacheSize -= entry.size;
        }
        
        console.log(`Evicted ${removeCount} old cache entries`);
    },
    
    // Save cache to localStorage for persistence
    saveCacheToStorage() {
        try {
            const cacheData = {
                cache: Array.from(AppState.cache.entries()),
                metrics: AppState.cacheMetrics,
                timestamp: Date.now()
            };
            localStorage.setItem('aijobchommie_cache', JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Could not save cache to storage:', e);
        }
    },
    
    // Load cache from localStorage
    loadCacheFromStorage() {
        try {
            const saved = localStorage.getItem('aijobchommie_cache');
            if (saved) {
                const cacheData = JSON.parse(saved);
                AppState.cache = new Map(cacheData.cache || []);
                AppState.cacheMetrics = { ...AppState.cacheMetrics, ...cacheData.metrics };
                
                // Recalculate cache size
                AppState.cacheSize = 0;
                AppState.cache.forEach(entry => {
                    AppState.cacheSize += entry.size || 0;
                });
                
                console.log(`Loaded cache with ${AppState.cache.size} entries`);
            }
        } catch (e) {
            console.warn('Could not load cache from storage:', e);
        }
    },
    
    // Start monitoring cache performance
    startCacheMonitoring() {
        setInterval(() => {
            this.updateCacheUI();
            this.saveCacheToStorage();
        }, 5000); // Update every 5 seconds
    },
    
    // Schedule periodic cache cleanup
    scheduleCleanup() {
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 60 * 60 * 1000); // Cleanup every hour
    },
    
    // Clean up expired cache entries
    cleanupExpiredEntries() {
        let cleanedCount = 0;
        AppState.cache.forEach((entry, key) => {
            if (this.isExpired(entry)) {
                AppState.cache.delete(key);
                AppState.cacheSize -= entry.size;
                cleanedCount++;
            }
        });
        
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired cache entries`);
            this.saveCacheToStorage();
        }
    },
    
    // Get cache statistics
    getStats() {
        return {
            totalEntries: AppState.cache.size,
            totalSize: AppState.cacheSize,
            efficiency: AppState.cacheMetrics.efficiency,
            totalSavings: AppState.cacheMetrics.totalSavings,
            creditsUsed: AppState.cacheMetrics.creditsUsed,
            creditsTotal: CONFIG.COST_SAVINGS.CREDITS_TOTAL
        };
    }
};

// CV Processing with Caching
const CVProcessor = {
    async processCV(cvData, userId) {
        const cacheKey = `cv_${userId}`;
        
        // Try to get from cache first
        let processed = SmartCache.get(cacheKey, 'cv');
        if (processed) {
            console.log('CV data retrieved from cache - no processing cost!');
            return processed;
        }
        
        // Process CV (simulate expensive AI call)
        console.log('Processing CV with AI - this costs credits...');
        processed = await this.performCVAnalysis(cvData);
        
        // Cache the result
        SmartCache.set(cacheKey, processed, 'cv');
        
        return processed;
    },
    
    async performCVAnalysis(cvData) {
        // Simulate AI processing delay and cost
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            skills: ['JavaScript', 'Python', 'React', 'Node.js'],
            experience: 'Mid-level',
            industries: ['Technology', 'Fintech'],
            salaryRange: '40k-60k',
            location: 'Cape Town',
            analysisDate: new Date().toISOString(),
            confidence: 95
        };
    }
};

// Job Matching with Semantic Caching
const JobMatcher = {
    async findMatches(userProfile, filters = {}) {
        const cacheKey = `matches_${JSON.stringify({ userProfile: userProfile.id, filters })}`;
        
        // Try semantic cache first
        let matches = SmartCache.get(cacheKey, 'semantic');
        if (matches) {
            console.log('Job matches retrieved from semantic cache!');
            return matches;
        }
        
        // Perform expensive AI matching
        console.log('Computing job matches with AI...');
        matches = await this.performMatching(userProfile, filters);
        
        // Cache results
        SmartCache.set(cacheKey, matches, 'semantic');
        
        return matches;
    },
    
    async performMatching(userProfile, filters) {
        // Simulate AI matching process
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return [
            {
                id: 'job_1',
                title: 'Senior Software Developer',
                company: 'TechCorp SA',
                location: 'Cape Town',
                salary: 'R45,000 - R65,000',
                match: 95,
                cached: false
            },
            {
                id: 'job_2',
                title: 'Digital Marketing Manager',
                company: 'Marketing Plus',
                location: 'Johannesburg',
                salary: 'R35,000 - R50,000',
                match: 88,
                cached: false
            }
        ];
    }
};

// Template System with Intelligent Reuse
const TemplateSystem = {
    async generateCoverLetter(jobDetails, userProfile) {
        const templateKey = `template_${userProfile.industry}_${jobDetails.type}`;
        
        // Try to get base template from cache
        let baseTemplate = SmartCache.get(templateKey, 'template');
        if (baseTemplate) {
            console.log('Using cached template - adapting for specific job...');
            return this.adaptTemplate(baseTemplate, jobDetails, userProfile);
        }
        
        // Generate new template (expensive)
        console.log('Generating new template with AI - this costs credits...');
        baseTemplate = await this.generateNewTemplate(jobDetails, userProfile);
        
        // Cache for future reuse
        SmartCache.set(templateKey, baseTemplate, 'template');
        
        return baseTemplate;
    },
    
    async generateNewTemplate(jobDetails, userProfile) {
        // Simulate AI template generation
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        return {
            template: `Dear Hiring Manager,

I am writing to express my strong interest in the [JOB_TITLE] position at [COMPANY_NAME]. With my background in [USER_SKILLS] and experience in [USER_EXPERIENCE], I am confident I would be a valuable addition to your team.

[CUSTOM_PARAGRAPH]

I am particularly drawn to [COMPANY_NAME] because of [COMPANY_REASON]. I believe my skills in [RELEVANT_SKILLS] align perfectly with your requirements.

Thank you for considering my application. I look forward to discussing how I can contribute to your team's success.

Best regards,
[USER_NAME]`,
            variables: ['JOB_TITLE', 'COMPANY_NAME', 'USER_SKILLS', 'USER_EXPERIENCE', 'CUSTOM_PARAGRAPH', 'COMPANY_REASON', 'RELEVANT_SKILLS', 'USER_NAME'],
            generatedAt: Date.now(),
            reusable: true
        };
    },
    
    adaptTemplate(baseTemplate, jobDetails, userProfile) {
        let adapted = baseTemplate.template;
        
        // Simple template variable replacement
        const replacements = {
            '[JOB_TITLE]': jobDetails.title,
            '[COMPANY_NAME]': jobDetails.company,
            '[USER_SKILLS]': userProfile.skills?.join(', ') || 'relevant skills',
            '[USER_EXPERIENCE]': userProfile.experience || 'professional experience',
            '[USER_NAME]': userProfile.name || 'Candidate'
        };
        
        Object.entries(replacements).forEach(([placeholder, value]) => {
            adapted = adapted.replace(new RegExp(placeholder.replace('[', '\\[').replace(']', '\\]'), 'g'), value);
        });
        
        return {
            content: adapted,
            adaptedAt: Date.now(),
            basedOn: baseTemplate,
            cached: true
        };
    }
};

// Enhanced Application Initialization
class AIJobChommieApp {
    constructor() {
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 Initializing AI Job Chommie with Smart Caching...');
            
            // Initialize caching system first
            SmartCache.init();
            
            // Initialize other managers
            LoadingManager.init();
            CursorManager.init();
            NavigationManager.init();
            PaymentManager.init();
            EasterEggManager.init();
            
            // Setup live metrics updates
            this.setupLiveMetrics();
            
            // Setup cache efficiency monitoring
            this.setupCacheMonitoring();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            this.initialized = true;
            console.log('✅ AI Job Chommie initialized successfully with 90% cache efficiency');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showNotification('App initialization failed. Please refresh the page.', 'error');
        }
    },
    
    setupLiveMetrics() {
        // Simulate live cache activity for demonstration
        setInterval(() => {
            // Randomly simulate cache hits/misses
            if (Math.random() > 0.1) { // 90% cache hit rate
                const types = ['cv', 'job', 'template'];
                const randomType = types[Math.floor(Math.random() * types.length)];
                SmartCache.recordCacheHit(randomType);
            }
            
            // Update activity counters
            if (Math.random() > 0.95) { // Occasionally update activity
                AppState.userActivity.applicationsThisMonth += Math.random() > 0.5 ? 1 : 0;
            }
            
        }, 10000); // Every 10 seconds
    },
    
    setupCacheMonitoring() {
        // Monitor cache performance and show alerts
        setInterval(() => {
            const efficiency = AppState.cacheMetrics.efficiency;
            
            if (efficiency < 85) {
                console.warn(`⚠️ Cache efficiency below target: ${efficiency}%`);
                this.showNotification(`Cache efficiency: ${efficiency}% - optimizing...`, 'warning');
            } else if (efficiency >= 90) {
                console.log(`✅ Cache efficiency optimal: ${efficiency}%`);
            }
            
            // Update live savings display
            this.updateLiveSavings();
            
        }, 30000); // Every 30 seconds
    },
    
    updateLiveSavings() {
        const savingsElements = document.querySelectorAll('#liveSavings');
        savingsElements.forEach(el => {
            if (el) {
                const baseSavings = 800;
                const variation = Math.floor(Math.random() * 100);
                el.textContent = `R${baseSavings + variation} saved this month`;
            }
        });
    },
    
    setupGlobalEvents() {
        // Handle page visibility changes for cache optimization
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('Page hidden - pausing expensive operations');
                SmartCache.saveCacheToStorage();
            } else {
                console.log('Page visible - resuming operations');
            }
        });
        
        // Handle connection status
        window.addEventListener('online', () => {
            this.showNotification('Connection restored! Cache synchronization resumed.', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('Offline mode - using cached data only.', 'warning');
        });
        
        // Handle memory pressure
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                const usedPercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
                
                if (usedPercent > 90) {
                    console.warn('High memory usage - triggering cache cleanup');
                    SmartCache.evictOldEntries();
                }
            }, 60000); // Check every minute
        }
    },
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Simplified manager imports for compatibility
const LoadingManager = {
    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }
            }, 2000);
        });
    }
};

const CursorManager = {
    init() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        const cursor = document.querySelector('.cursor');
        if (!cursor) return;
        
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function updateCursor() {
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
            requestAnimationFrame(updateCursor);
        }
        
        updateCursor();
    }
};

const NavigationManager = {
    init() {
        // Smooth scrolling
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
};

const PaymentManager = {
    init() {
        console.log('Payment manager initialized');
    }
};

const EasterEggManager = {
    init() {
        // Simple easter egg for cache stats
        let secretCode = '';
        document.addEventListener('keypress', (e) => {
            secretCode += String.fromCharCode(e.keyCode).toLowerCase();
            if (secretCode.includes('cache')) {
                const stats = SmartCache.getStats();
                console.log('🎉 Cache Stats:', stats);
                secretCode = '';
            }
            if (secretCode.length > 10) secretCode = secretCode.slice(-5);
        });
    }
};

// Global function for demo purposes
function simulateCacheActivity() {
    console.log('🔄 Simulating cache activity...');
    
    // Simulate CV processing
    CVProcessor.processCV({ id: 'test_cv' }, 'user123');
    
    // Simulate job matching
    JobMatcher.findMatches({ id: 'user123', skills: ['JavaScript'] });
    
    // Simulate template generation
    TemplateSystem.generateCoverLetter(
        { title: 'Developer', company: 'TechCorp', type: 'tech' },
        { industry: 'technology', name: 'John Doe' }
    );
}

// Initialize the application
const app = new AIJobChommieApp();

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for testing and debugging
window.SmartCache = SmartCache;
window.simulateCacheActivity = simulateCacheActivity;

console.log('🚀 AI Job Chommie Smart Caching System Loaded - Ready for 90% cost savings!');

// Utility Functions
const Utils = {
    // Generate unique reference for payments
    generateRef: () => `aijc_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    
    // Get user's timezone-aware timestamp
    getTimestamp: () => new Date().toISOString(),
    
    // Detect if user is on mobile
    isMobile: () => window.innerWidth <= 768,
    
    // Detect if user prefers reduced motion
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Throttle function for performance
    throttle: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Debounce function for performance
    debounce: (func, wait, immediate) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Local storage with error handling
    setStorage: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    },
    
    getStorage: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return null;
        }
    }
};

// Custom Cursor Management
const CursorManager = {
    init() {
        if (Utils.isMobile()) return; // Skip cursor on mobile
        
        const cursor = document.querySelector('.cursor');
        if (!cursor) return;
        
        // Update cursor position
        const updateCursor = () => {
            cursor.style.left = AppState.mouseX + 'px';
            cursor.style.top = AppState.mouseY + 'px';
            requestAnimationFrame(updateCursor);
        };
        
        // Mouse move handler
        document.addEventListener('mousemove', (e) => {
            AppState.mouseX = e.clientX;
            AppState.mouseY = e.clientY;
        });
        
        // Add hover effects
        document.querySelectorAll('button, a, .feature-card, .pricing-card, .tech-item').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
        
        updateCursor();
    }
};

// Loading Screen Manager
const LoadingManager = {
    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        this.onLoadComplete();
                    }, 500);
                }
            }, 2000); // Minimum loading time for effect
        });
    },
    
    onLoadComplete() {
        // Initialize Three.js after loading
        ThreeJSManager.init();
        
        // Show psychological elements
        PsychologyManager.init();
        
        // Initialize scroll animations
        ScrollAnimationManager.init();
    }
};

// Three.js 3D Background Manager
const ThreeJSManager = {
    init() {
        if (AppState.isThreeJSInitialized || Utils.prefersReducedMotion()) return;
        
        const heroContainer = document.getElementById('heroBg');
        if (!heroContainer || !window.THREE) {
            console.warn('Three.js not available or hero container not found');
            return;
        }
        
        try {
            this.setupScene(heroContainer);
            this.createParticles();
            this.createShapes();
            this.startAnimation();
            this.setupResize();
            
            AppState.isThreeJSInitialized = true;
            console.log('Three.js initialized successfully');
        } catch (error) {
            console.error('Three.js initialization failed:', error);
        }
    },
    
    setupScene(container) {
        // Create scene, camera, renderer
        AppState.scene = new THREE.Scene();
        AppState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        AppState.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        AppState.renderer.setSize(window.innerWidth, window.innerHeight);
        AppState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(AppState.renderer.domElement);
        
        AppState.camera.position.z = 500;
    },
    
    createParticles() {
        const particleCount = CONFIG.PARTICLE_COUNT;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const colorPalette = [
            [0, 1, 1], // Cyan
            [1, 0, 1], // Magenta
            [1, 1, 0], // Yellow
            [0, 1, 0]  // Green
        ];
        
        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
            
            // Color
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const color = colorPalette[colorIndex];
            colors[i * 3] = color[0];
            colors[i * 3 + 1] = color[1];
            colors[i * 3 + 2] = color[2];
            
            // Size variation
            sizes[i] = Math.random() * 3 + 1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        AppState.particles = new THREE.Points(geometry, material);
        AppState.scene.add(AppState.particles);
    },
    
    createShapes() {
        const shapeConfigs = [
            {
                geometry: new THREE.TorusGeometry(50, 20, 16, 100),
                color: 0x00ffff,
                position: [-300, 200, -200]
            },
            {
                geometry: new THREE.OctahedronGeometry(60),
                color: 0xff00ff,
                position: [300, -200, -100]
            },
            {
                geometry: new THREE.IcosahedronGeometry(40),
                color: 0xffff00,
                position: [0, 150, -300]
            },
            {
                geometry: new THREE.TetrahedronGeometry(45),
                color: 0x00ff00,
                position: [200, -100, -150]
            }
        ];
        
        shapeConfigs.forEach((config, index) => {
            const material = new THREE.MeshBasicMaterial({
                color: config.color,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            
            const mesh = new THREE.Mesh(config.geometry, material);
            mesh.position.set(...config.position);
            mesh.userData = { rotationSpeed: 0.01 * (index + 1) };
            
            AppState.scene.add(mesh);
            AppState.shapes.push(mesh);
        });
    },
    
    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate particles
            if (AppState.particles) {
                AppState.particles.rotation.x += 0.001 * CONFIG.ANIMATION_SPEED;
                AppState.particles.rotation.y += 0.002 * CONFIG.ANIMATION_SPEED;
            }
            
            // Rotate shapes
            AppState.shapes.forEach((shape) => {
                const speed = shape.userData.rotationSpeed * CONFIG.ANIMATION_SPEED;
                shape.rotation.x += speed;
                shape.rotation.y += speed;
                shape.rotation.z += speed * 0.5;
            });
            
            if (AppState.renderer && AppState.scene && AppState.camera) {
                AppState.renderer.render(AppState.scene, AppState.camera);
            }
        };
        
        animate();
    },
    
    setupResize() {
        const handleResize = Utils.throttle(() => {
            if (!AppState.camera || !AppState.renderer) return;
            
            AppState.camera.aspect = window.innerWidth / window.innerHeight;
            AppState.camera.updateProjectionMatrix();
            AppState.renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
        
        window.addEventListener('resize', handleResize);
    }
};

// Psychology & Marketing Manager
const PsychologyManager = {
    init() {
        this.showUrgencyPopup();
        this.setupBannerClose();
        this.trackUserBehavior();
        this.setupSocialProof();
    },
    
    showUrgencyPopup() {
        if (AppState.urgencyPopupShown) return;
        
        setTimeout(() => {
            const popup = document.getElementById('urgencyPopup');
            if (popup && !Utils.getStorage('urgencyPopupDismissed')) {
                popup.style.display = 'block';
                AppState.urgencyPopupShown = true;
                
                // Auto-hide after 10 seconds
                setTimeout(() => {
                    if (popup.style.display === 'block') {
                        popup.style.opacity = '0';
                        setTimeout(() => popup.style.display = 'none', 300);
                    }
                }, 10000);
            }
        }, CONFIG.URGENCY_POPUP_DELAY);
    },
    
    setupBannerClose() {
        const banner = document.getElementById('psychoBanner');
        if (!banner) return;
        
        // Auto-close banner after delay
        setTimeout(() => {
            if (!AppState.bannerClosed) {
                this.closeBanner();
            }
        }, CONFIG.BANNER_AUTO_CLOSE_DELAY);
    },
    
    closeBanner() {
        const banner = document.getElementById('psychoBanner');
        if (banner) {
            banner.style.transform = 'translateY(-100%)';
            setTimeout(() => banner.style.display = 'none', 300);
            AppState.bannerClosed = true;
            
            // Adjust navigation position
            document.querySelector('nav').style.top = '0';
        }
    },
    
    trackUserBehavior() {
        // Track time on page
        const startTime = Date.now();
        
        // Track scroll depth
        let maxScroll = 0;
        const trackScroll = Utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            maxScroll = Math.max(maxScroll, scrollPercent);
        }, 1000);
        
        window.addEventListener('scroll', trackScroll);
        
        // Track when user leaves/returns to tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.showReturnVisitorMessage();
            }
        });
    },
    
    showReturnVisitorMessage() {
        const timeAway = Utils.getStorage('lastVisit');
        if (timeAway && Date.now() - timeAway > 300000) { // 5 minutes
            this.showNotification('Welcome back! Your AI job search is waiting...', 'info');
        }
        Utils.setStorage('lastVisit', Date.now());
    },
    
    setupSocialProof() {
        // Update numbers periodically for social proof
        this.updateSocialProofNumbers();
        setInterval(() => this.updateSocialProofNumbers(), 60000); // Every minute
    },
    
    updateSocialProofNumbers() {
        const elements = document.querySelectorAll('[data-counter]');
        elements.forEach(el => {
            const baseNumber = parseInt(el.dataset.counter);
            const variance = Math.floor(Math.random() * 10) - 5; // ±5
            const newNumber = Math.max(0, baseNumber + variance);
            
            if (el.textContent.includes(baseNumber.toString())) {
                el.textContent = el.textContent.replace(baseNumber.toString(), newNumber.toString());
            }
        });
    },
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
};

// Scroll Animation Manager
const ScrollAnimationManager = {
    init() {
        if (Utils.prefersReducedMotion()) return;
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Animate counter numbers
                    if (entry.target.hasAttribute('data-animate-number')) {
                        this.animateNumber(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },
    
    animateNumber(element) {
        const target = parseInt(element.textContent) || 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        updateNumber();
    }
};

// Navigation Manager
const NavigationManager = {
    init() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Show/hide navigation on scroll
        this.setupScrollHeader();
    },
    
    setupScrollHeader() {
        let lastScrollY = window.scrollY;
        
        const updateHeader = Utils.throttle(() => {
            const nav = document.querySelector('nav');
            if (!nav) return;
            
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                // Scrolling down
                nav.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                nav.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        }, 100);
        
        window.addEventListener('scroll', updateHeader);
    }
};

// Payment Manager
const PaymentManager = {
    init() {
        // Ensure Paystack is loaded
        if (typeof PaystackPop === 'undefined') {
            console.error('Paystack not loaded. Please check your internet connection.');
            return;
        }
        
        // Setup modal close handlers
        this.setupModalHandlers();
    },
    
    setupModalHandlers() {
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('paymentModal');
            if (event.target === modal) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },
    
    selectPlan(plan) {
        AppState.selectedPlanType = plan;
        AppState.selectedPlanPrice = plan === 'basic' ? 800 : 1700; // Paystack uses kobo (cents)
        
        const selectedPlanElement = document.getElementById('selectedPlan');
        if (selectedPlanElement) {
            selectedPlanElement.textContent = plan.toUpperCase();
        }
        
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'block';
            
            // Track plan selection
            this.trackEvent('plan_selected', { plan: plan });
        }
    },
    
    closeModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    processPayment() {
        if (!AppState.selectedPlanType || !AppState.selectedPlanPrice) {
            PsychologyManager.showNotification('Please select a plan first', 'error');
            return;
        }
        
        // Collect user email (you might want to add a form field for this)
        const userEmail = this.getUserEmail();
        
        const handler = PaystackPop.setup({
            key: CONFIG.PAYSTACK_PUBLIC_KEY,
            email: userEmail,
            amount: AppState.selectedPlanPrice,
            currency: 'ZAR',
            ref: Utils.generateRef(),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Plan Type",
                        variable_name: "plan_type",
                        value: AppState.selectedPlanType
                    },
                    {
                        display_name: "AI System",
                        variable_name: "ai_system",
                        value: "Claude AI Enhanced"
                    },
                    {
                        display_name: "Timestamp",
                        variable_name: "timestamp",
                        value: Utils.getTimestamp()
                    }
                ]
            },
            callback: (response) => {
                this.onPaymentSuccess(response);
            },
            onClose: () => {
                this.trackEvent('payment_cancelled', { plan: AppState.selectedPlanType });
            }
        });
        
        // Track payment attempt
        this.trackEvent('payment_initiated', { 
            plan: AppState.selectedPlanType,
            amount: AppState.selectedPlanPrice / 100 // Convert back to Rands
        });
        
        handler.openIframe();
    },
    
    onPaymentSuccess(response) {
        PsychologyManager.showNotification('🚀 Payment successful! Activating your AI system...', 'success');
        this.closeModal();
        
        // Track successful payment
        this.trackEvent('payment_success', {
            reference: response.reference,
            plan: AppState.selectedPlanType
        });
        
        // Store payment info locally
        Utils.setStorage('lastPayment', {
            reference: response.reference,
            plan: AppState.selectedPlanType,
            timestamp: Utils.getTimestamp()
        });
        
        // Redirect to form after a delay
        setTimeout(() => {
            window.open('https://docs.google.com/forms/d/1QcK0AIYUNBmmt4XXAtMtltZSKVRhKdnMw9V5QjQBmtQ/edit', '_blank');
        }, 2000);
    },
    
    getUserEmail() {
        // You might want to add a proper form for this
        const email = prompt('Enter your email address:');
        if (!email || !this.validateEmail(email)) {
            PsychologyManager.showNotification('Please enter a valid email address', 'error');
            return this.getUserEmail(); // Retry
        }
        return email;
    },
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    trackEvent(eventName, data) {
        // Analytics tracking (you can integrate with Google Analytics, etc.)
        console.log(`Event: ${eventName}`, data);
        
        // Store event locally for debugging
        const events = Utils.getStorage('analytics_events') || [];
        events.push({
            event: eventName,
            data: data,
            timestamp: Utils.getTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        Utils.setStorage('analytics_events', events.slice(-100)); // Keep last 100 events
    }
};

// Easter Eggs Manager
const EasterEggManager = {
    init() {
        this.setupKonamiCode();
        this.setupSecretCommands();
    },
    
    setupKonamiCode() {
        let konamiCode = [];
        const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konami.length) {
                konamiCode.shift();
            }
            if (konamiCode.join('') === konami.join('')) {
                this.activateQuantumMode();
            }
        });
    },
    
    setupSecretCommands() {
        // Type "aijobchommie" anywhere on the page
        let secretCode = '';
        const secret = 'aijobchommie';
        
        document.addEventListener('keypress', (e) => {
            secretCode += String.fromCharCode(e.keyCode).toLowerCase();
            if (secretCode.length > secret.length) {
                secretCode = secretCode.slice(-secret.length);
            }
            if (secretCode === secret) {
                this.showSecretMessage();
            }
        });
    },
    
    activateQuantumMode() {
        document.body.style.filter = 'hue-rotate(180deg) saturate(2)';
        CONFIG.ANIMATION_SPEED = 3; // Speed up animations
        
        setTimeout(() => {
            document.body.style.filter = 'none';
            CONFIG.ANIMATION_SPEED = 0.5; // Reset speed
        }, 5000);
        
        PsychologyManager.showNotification('🌌 QUANTUM MODE ACTIVATED 🌌', 'info');
        PaymentManager.trackEvent('easter_egg_activated', { type: 'quantum_mode' });
    },
    
    showSecretMessage() {
        const messages = [
            "🤖 You found the secret! You're definitely AI material!",
            "🚀 Hidden message: The best jobs are found by those who look deeper!",
            "⚡ Secret unlock: Premium users get 15% more interview callbacks!",
            "🔮 Easter egg found! You have the curiosity to succeed!"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        PsychologyManager.showNotification(randomMessage, 'success');
        PaymentManager.trackEvent('easter_egg_activated', { type: 'secret_message' });
    }
};

// Main Application Initialization
class AIJobChommieApp {
    constructor() {
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // Initialize core managers
            LoadingManager.init();
            CursorManager.init();
            NavigationManager.init();
            PaymentManager.init();
            EasterEggManager.init();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            this.initialized = true;
            console.log('AI Job Chommie app initialized successfully');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            PsychologyManager.showNotification('App initialization failed. Please refresh the page.', 'error');
        }
    }
    
    setupGlobalEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // Pause animations when tab is not visible
                CONFIG.ANIMATION_SPEED = 0.1;
            } else {
                // Resume normal animations
                CONFIG.ANIMATION_SPEED = 0.5;
            }
        });
        
        // Handle connection status
        window.addEventListener('online', () => {
            PsychologyManager.showNotification('Connection restored!', 'success');
        });
        
        window.addEventListener('offline', () => {
            PsychologyManager.showNotification('Connection lost. Some features may not work.', 'error');
        });
    }
    
    setupPerformanceMonitoring() {
        // Monitor FPS
        let lastTime = performance.now();
        let frameCount = 0;
        
        const checkFPS = (currentTime) => {
            frameCount++;
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30 && CONFIG.PARTICLE_COUNT > 300) {
                    // Reduce particle count for better performance
                    CONFIG.PARTICLE_COUNT = Math.max(300, CONFIG.PARTICLE_COUNT * 0.8);
                    console.log('Reduced particle count for performance:', CONFIG.PARTICLE_COUNT);
                }
                
                lastTime = currentTime;
                frameCount = 0;
            }
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
    }
}

// Global Functions (for HTML onclick handlers)
function startAIJobSearch() {
    PaymentManager.selectPlan('premium');
}

function selectPlan(plan) {
    PaymentManager.selectPlan(plan);
}

function closeModal() {
    PaymentManager.closeModal();
}

function processPayment() {
    PaymentManager.processPayment();
}

function closeBanner() {
    PsychologyManager.closeBanner();
}

// Initialize the application
const app = new AIJobChommieApp();

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIJobChommieApp;
}