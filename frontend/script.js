// AI Agent Memory Dashboard - Interactive JavaScript
class MemoryDashboard {
    constructor() {
        this.interactionData = [];
        this.knowledgeData = [];
        this.isInitialized = false;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateMockData();
        this.renderInteractionChart();
        this.setupAutoRefresh();
        this.isInitialized = true;
        
        console.log('Memory Dashboard initialized successfully');
    }

    setupEventListeners() {
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // View details button
        const viewDetailsBtn = document.getElementById('view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => this.showDetailsModal());
        }

        // Modal close button
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideDetailsModal());
        }

        // Modal backdrop click
        const modal = document.getElementById('details-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideDetailsModal();
                }
            });
        }

        // Chart bar interactions
        const chartBars = document.querySelectorAll('.chart-bar');
        chartBars.forEach(bar => {
            bar.addEventListener('click', (e) => this.handleChartBarClick(e));
            bar.addEventListener('mouseenter', (e) => this.showTooltip(e));
            bar.addEventListener('mouseleave', () => this.hideTooltip());
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDetailsModal();
            }
        });
    }

    generateMockData() {
        // Generate interaction data for the last 24 hours
        const now = new Date();
        this.interactionData = [];
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const interactions = Math.floor(Math.random() * 50) + 20;
            this.interactionData.push({
                time: time,
                interactions: interactions,
                timestamp: time.getTime()
            });
        }

        // Generate knowledge base data
        this.knowledgeData = [
            { category: 'User Preferences', value: 75, count: 3125 },
            { category: 'Product Specs', value: 90, count: 4500 },
            { category: 'FAQs', value: 60, count: 3000 },
            { category: 'Interaction Logs', value: 45, count: 2250 },
            { category: 'Documentation', value: 80, count: 4000 },
            { category: 'General Knowledge', value: 55, count: 2750 }
        ];
    }

    renderInteractionChart() {
        const canvas = document.getElementById('interaction-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        this.drawGrid(ctx, width, height);

        // Draw chart line
        this.drawLineChart(ctx, width, height);

        // Draw area fill
        this.drawAreaFill(ctx, width, height);
    }

    drawGrid(ctx, width, height) {
        ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--border-color');
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;

        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Vertical grid lines
        for (let i = 0; i <= 6; i++) {
            const x = (width / 6) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    drawLineChart(ctx, width, height) {
        if (this.interactionData.length === 0) return;

        const maxInteractions = Math.max(...this.interactionData.map(d => d.interactions));
        const minInteractions = Math.min(...this.interactionData.map(d => d.interactions));

        ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        this.interactionData.forEach((data, index) => {
            const x = (index / (this.interactionData.length - 1)) * width;
            const normalizedValue = (data.interactions - minInteractions) / (maxInteractions - minInteractions);
            const y = height - (normalizedValue * height);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    drawAreaFill(ctx, width, height) {
        if (this.interactionData.length === 0) return;

        const maxInteractions = Math.max(...this.interactionData.map(d => d.interactions));
        const minInteractions = Math.min(...this.interactionData.map(d => d.interactions));

        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color');
        ctx.globalAlpha = 0.2;

        ctx.beginPath();
        this.interactionData.forEach((data, index) => {
            const x = (index / (this.interactionData.length - 1)) * width;
            const normalizedValue = (data.interactions - minInteractions) / (maxInteractions - minInteractions);
            const y = height - (normalizedValue * height);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        // Complete the area by going to bottom right, then bottom left
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    handleChartBarClick(event) {
        const bar = event.currentTarget;
        const category = bar.dataset.category;
        const value = bar.dataset.value;
        
        this.showDetailsModal(category, value);
    }

    showTooltip(event) {
        const bar = event.currentTarget;
        const category = bar.dataset.category;
        const value = bar.dataset.value;
        
        // Create tooltip if it doesn't exist
        let tooltip = document.querySelector('.tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }
        
        tooltip.textContent = `${category}: ${value}%`;
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 30 + 'px';
        tooltip.classList.add('show');
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    showDetailsModal(category = null, value = null) {
        const modal = document.getElementById('details-modal');
        const modalContent = document.getElementById('modal-content');
        
        if (category && value) {
            // Show specific category details
            modalContent.innerHTML = this.generateCategoryDetails(category, value);
        } else {
            // Show general memory overview
            modalContent.innerHTML = this.generateMemoryOverview();
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('modal-enter');
        
        // Trigger animation
        setTimeout(() => {
            modal.classList.remove('modal-enter');
            modal.classList.add('modal-enter-active');
        }, 10);
    }

    hideDetailsModal() {
        const modal = document.getElementById('details-modal');
        modal.classList.add('modal-exit');
        
        setTimeout(() => {
            modal.classList.remove('modal-exit', 'modal-enter-active');
            modal.classList.add('hidden');
        }, 200);
    }

    generateCategoryDetails(category, value) {
        const mockDetails = {
            'User Preferences': {
                description: 'Stored user preferences and behavioral patterns',
                examples: ['Language settings', 'UI preferences', 'Interaction history'],
                lastUpdated: '2 hours ago',
                confidence: '95%'
            },
            'Product Specs': {
                description: 'Technical specifications and product information',
                examples: ['Feature details', 'Technical requirements', 'API documentation'],
                lastUpdated: '1 day ago',
                confidence: '98%'
            },
            'FAQs': {
                description: 'Frequently asked questions and common solutions',
                examples: ['Common issues', 'Troubleshooting steps', 'Best practices'],
                lastUpdated: '3 days ago',
                confidence: '87%'
            },
            'Interaction Logs': {
                description: 'Detailed logs of user interactions and system responses',
                examples: ['Conversation history', 'Error logs', 'Performance metrics'],
                lastUpdated: '5 minutes ago',
                confidence: '92%'
            },
            'Documentation': {
                description: 'Comprehensive system documentation and guides',
                examples: ['User manuals', 'API references', 'Integration guides'],
                lastUpdated: '1 week ago',
                confidence: '89%'
            },
            'General Knowledge': {
                description: 'General domain knowledge and contextual information',
                examples: ['Industry trends', 'Best practices', 'Reference materials'],
                lastUpdated: '2 weeks ago',
                confidence: '78%'
            }
        };

        const details = mockDetails[category] || mockDetails['General Knowledge'];
        
        return `
            <div class="space-y-6">
                <div>
                    <h4 class="text-lg font-semibold text-white mb-2">${category}</h4>
                    <p class="text-[var(--text-secondary)]">${details.description}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-[var(--background-color)] p-4 rounded-lg">
                        <p class="text-sm text-[var(--text-secondary)]">Current Value</p>
                        <p class="text-2xl font-bold text-white">${value}%</p>
                    </div>
                    <div class="bg-[var(--background-color)] p-4 rounded-lg">
                        <p class="text-sm text-[var(--text-secondary)]">Confidence</p>
                        <p class="text-2xl font-bold text-white">${details.confidence}</p>
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-[var(--text-secondary)] mb-2">Examples:</p>
                    <ul class="space-y-1">
                        ${details.examples.map(example => `<li class="text-sm text-white">• ${example}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="text-right">
                    <p class="text-xs text-[var(--text-secondary)]">Last updated: ${details.lastUpdated}</p>
                </div>
            </div>
        `;
    }

    generateMemoryOverview() {
        const totalEntries = this.knowledgeData.reduce((sum, item) => sum + item.count, 0);
        const activeContexts = 4;
        const recentInteractions = this.interactionData[this.interactionData.length - 1]?.interactions || 0;
        
        return `
            <div class="space-y-6">
                <div>
                    <h4 class="text-lg font-semibold text-white mb-4">Memory System Overview</h4>
                    <p class="text-[var(--text-secondary)]">Comprehensive view of your AI agent's cognitive architecture</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-[var(--background-color)] p-4 rounded-lg text-center">
                        <p class="text-sm text-[var(--text-secondary)]">Total Knowledge</p>
                        <p class="text-2xl font-bold text-white">${totalEntries.toLocaleString()}</p>
                        <p class="text-xs text-[var(--success-color)]">+5% this month</p>
                    </div>
                    <div class="bg-[var(--background-color)] p-4 rounded-lg text-center">
                        <p class="text-sm text-[var(--text-secondary)]">Active Contexts</p>
                        <p class="text-2xl font-bold text-white">${activeContexts}</p>
                        <p class="text-xs text-[var(--text-secondary)]">Currently processing</p>
                    </div>
                    <div class="bg-[var(--background-color)] p-4 rounded-lg text-center">
                        <p class="text-sm text-[var(--text-secondary)]">Recent Activity</p>
                        <p class="text-2xl font-bold text-white">${recentInteractions}</p>
                        <p class="text-xs text-[var(--success-color)]">Last hour</p>
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-[var(--text-secondary)] mb-3">Memory Health Status:</p>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-white">Short-term memory</span>
                            <span class="text-sm text-[var(--success-color)]">✓ Optimal</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-white">Long-term storage</span>
                            <span class="text-sm text-[var(--success-color)]">✓ Optimal</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-white">Data integrity</span>
                            <span class="text-sm text-[var(--success-color)]">✓ Optimal</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-white">Access patterns</span>
                            <span class="text-sm text-yellow-400">⚠ Monitoring</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showHelp() {
        const helpContent = `
            <div class="space-y-4">
                <h4 class="text-lg font-semibold text-white">Dashboard Help</h4>
                <div class="space-y-3">
                    <div>
                        <p class="text-sm font-medium text-white">Short-Term Memory</p>
                        <p class="text-xs text-[var(--text-secondary)]">Shows recent interactions and active processing contexts</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-white">Long-Term Memory</p>
                        <p class="text-xs text-[var(--text-secondary)]">Displays knowledge base distribution and storage metrics</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-white">Interactive Charts</p>
                        <p class="text-xs text-[var(--text-secondary)]">Click on bars or hover for detailed information</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-white">Real-time Updates</p>
                        <p class="text-xs text-[var(--text-secondary)]">Data refreshes automatically every 30 seconds</p>
                    </div>
                </div>
            </div>
        `;
        
        // Show help in a simple alert for now
        alert('Dashboard Help:\n\n• Short-Term Memory: Recent interactions and active contexts\n• Long-Term Memory: Knowledge base distribution\n• Interactive Charts: Click or hover for details\n• Real-time Updates: Auto-refresh every 30 seconds');
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    refreshData() {
        // Simulate data refresh
        this.generateMockData();
        this.renderInteractionChart();
        this.updateMetrics();
        
        // Show refresh indicator
        this.showRefreshIndicator();
    }

    updateMetrics() {
        // Update interaction count
        const interactionCount = document.getElementById('interaction-count');
        if (interactionCount) {
            const latestCount = this.interactionData[this.interactionData.length - 1]?.interactions || 0;
            interactionCount.textContent = latestCount;
        }

        // Update trend indicators
        const interactionTrend = document.getElementById('interaction-trend');
        if (interactionTrend) {
            const trend = Math.random() > 0.5 ? '+' : '-';
            const percentage = Math.floor(Math.random() * 20) + 5;
            interactionTrend.textContent = `${trend}${percentage}%`;
        }
    }

    showRefreshIndicator() {
        // Create refresh indicator
        let indicator = document.querySelector('.refresh-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'refresh-indicator';
            indicator.textContent = 'Data refreshed';
            document.body.appendChild(indicator);
        }
        
        indicator.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 3000);
    }

    // Cleanup method
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.isInitialized = false;
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupPerformanceObserver();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.pageLoad = navigation.loadEventEnd - navigation.loadEventStart;
                this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
                
                console.log('Performance Metrics:', this.metrics);
            }
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.metrics.lcp = entry.startTime;
                        console.log('LCP:', entry.startTime);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize performance monitoring
        const performanceMonitor = new PerformanceMonitor();
        
        // Initialize dashboard
        const dashboard = new MemoryDashboard();
        
        // Make dashboard globally accessible for debugging
        window.memoryDashboard = dashboard;
        
        console.log('AI Agent Memory Dashboard loaded successfully');
        
        // Add loading animation removal
        document.body.classList.remove('loading');
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50';
        errorDiv.textContent = 'Dashboard failed to load. Please refresh the page.';
        document.body.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause auto-refresh when page is not visible
        if (window.memoryDashboard && window.memoryDashboard.refreshInterval) {
            clearInterval(window.memoryDashboard.refreshInterval);
        }
    } else {
        // Resume auto-refresh when page becomes visible
        if (window.memoryDashboard) {
            window.memoryDashboard.setupAutoRefresh();
        }
    }
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MemoryDashboard, PerformanceMonitor };
}
