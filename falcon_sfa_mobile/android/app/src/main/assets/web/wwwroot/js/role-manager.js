// Role Management for RM Selection System
const RoleManager = {
    // Available roles
    roles: [
        'Administrator',
        'Packaging Development',
        'Regulatory Affair',
        'Business Development',
        'Product Development'
    ],

    // Get current role from localStorage
    getCurrentRole: function () {
        return localStorage.getItem('currentRole') || 'Administrator';
    },

    // Set current role to localStorage
    setCurrentRole: function (role) {
        if (this.roles.includes(role)) {
            localStorage.setItem('currentRole', role);
            // Dispatch event for other components to listen
            window.dispatchEvent(new CustomEvent('roleChanged', { detail: { role: role } }));
            return true;
        }
        return false;
    },

    // Initialize role dropdown in navbar
    initRoleDropdown: function () {
        const currentRole = this.getCurrentRole();
        const navbarRight = document.querySelector('.navbar-nav.flex-row.align-items-center.ms-auto');

        if (!navbarRight) return;

        // Create role dropdown
        const roleDropdown = document.createElement('li');
        roleDropdown.className = 'nav-item navbar-dropdown dropdown-user dropdown me-3';
        roleDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                <div class="d-flex align-items-center">
                    <i class="fas fa-user-tag me-2"></i>
                    <span class="fw-semibold d-none d-md-inline" id="currentRoleDisplay">${currentRole}</span>
                </div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <div class="dropdown-header">
                        <h6 class="mb-0">Current Role</h6>
                        <small class="text-muted">${currentRole}</small>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item" href="ChooseRole.html?returnUrl=${encodeURIComponent(window.location.pathname)}">
                        <i class="fas fa-exchange-alt me-2"></i>
                        <span>Change Role</span>
                    </a>
                </li>
            </ul>
        `;

        // Insert before user dropdown
        navbarRight.insertBefore(roleDropdown, navbarRight.firstChild);
    }
};

// Auto-initialize when layout is ready
document.addEventListener('layoutReady', () => {
    RoleManager.initRoleDropdown();
});

// Export for global access
window.RoleManager = RoleManager;
