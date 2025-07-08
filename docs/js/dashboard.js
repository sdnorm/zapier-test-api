class ApiHealthDashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api/v1';
        this.refreshInterval = 30000; // 30 seconds
        this.intervalId = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.loadData();
        this.startAutoRefresh();
        this.updateLastUpdated();
    }

    async loadData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api_statuses`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.renderStatusCards(data.data);
            } else {
                this.showErrorState('Failed to load API status data');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showErrorState('Unable to connect to API. Using demo data.');
            this.renderDemoData();
        } finally {
            this.isLoading = false;
            this.updateLastUpdated();
        }
    }

    renderStatusCards(apiStatuses) {
        const statusGrid = document.getElementById('statusGrid');
        
        if (!apiStatuses || apiStatuses.length === 0) {
            statusGrid.innerHTML = `
                <div class="error-state">
                    <p>No API status data available. Make sure Zapier workflows are configured and running.</p>
                </div>
            `;
            return;
        }

        statusGrid.innerHTML = apiStatuses.map(status => this.createStatusCard(status)).join('');
    }

    createStatusCard(status) {
        const statusClass = status.status.toLowerCase();
        const responseTime = status.response_time || 0;
        const statusCode = status.status_code || 'N/A';
        const checkedAt = new Date(status.checked_at).toLocaleString();
        const endpoint = status.endpoint || 'Not specified';
        
        return `
            <div class="status-card status-${statusClass}">
                <div class="status-header">
                    <h3 class="api-name">${this.formatApiName(status.api_name)}</h3>
                    <span class="status-badge ${statusClass}">${status.status}</span>
                </div>
                
                <div class="status-details">
                    <div class="status-detail">
                        <span class="detail-label">Response Time</span>
                        <span class="detail-value response-time ${this.getResponseTimeClass(responseTime)}">
                            ${responseTime}ms
                        </span>
                    </div>
                    
                    <div class="status-detail">
                        <span class="detail-label">Status Code</span>
                        <span class="detail-value">${statusCode}</span>
                    </div>
                    
                    <div class="status-detail">
                        <span class="detail-label">Endpoint</span>
                        <span class="detail-value" style="font-size: 0.8rem; word-break: break-all;">
                            ${this.truncateUrl(endpoint)}
                        </span>
                    </div>
                    
                    ${status.error_message ? `
                        <div class="status-detail">
                            <span class="detail-label">Error</span>
                            <span class="detail-value" style="color: #f56565; font-size: 0.8rem;">
                                ${status.error_message}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="status-timestamp">
                    Last checked: ${checkedAt}
                </div>
            </div>
        `;
    }

    formatApiName(apiName) {
        return apiName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getResponseTimeClass(responseTime) {
        if (responseTime === 0) return 'down';
        if (responseTime > 1000) return 'slow';
        return '';
    }

    truncateUrl(url) {
        if (url.length > 40) {
            return url.substring(0, 40) + '...';
        }
        return url;
    }

    renderDemoData() {
        const demoData = [
            {
                api_name: 'github',
                status: 'UP',
                response_time: 245,
                status_code: 200,
                endpoint: 'https://api.github.com/users/octocat',
                checked_at: new Date().toISOString(),
                error_message: null
            },
            {
                api_name: 'stripe',
                status: 'UP',
                response_time: 156,
                status_code: 200,
                endpoint: 'https://api.stripe.com/v1/charges',
                checked_at: new Date().toISOString(),
                error_message: null
            },
            {
                api_name: 'jsonplaceholder',
                status: 'SLOW',
                response_time: 1200,
                status_code: 200,
                endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
                checked_at: new Date().toISOString(),
                error_message: null
            },
            {
                api_name: 'custom_api',
                status: 'DOWN',
                response_time: 0,
                status_code: 500,
                endpoint: 'https://example.com/api/health',
                checked_at: new Date().toISOString(),
                error_message: 'Connection timeout'
            }
        ];
        
        this.renderStatusCards(demoData);
    }

    showLoadingState() {
        const statusGrid = document.getElementById('statusGrid');
        statusGrid.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                Loading API status data...
            </div>
        `;
    }

    showErrorState(message) {
        const statusGrid = document.getElementById('statusGrid');
        statusGrid.innerHTML = `
            <div class="error-state">
                <p>${message}</p>
            </div>
        `;
    }

    startAutoRefresh() {
        this.intervalId = setInterval(() => {
            this.loadData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    updateLastUpdated() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleString();
        }
    }

    refreshData() {
        this.loadData();
    }
}

// Global function for refresh button
function refreshData() {
    if (window.dashboard) {
        window.dashboard.refreshData();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ApiHealthDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboard) {
        window.dashboard.stopAutoRefresh();
    }
});