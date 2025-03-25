function run() {
    addGoogleFont();
    addStickyFooterStyles();

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React and ReactDOM must be loaded');
        return;
    }

    const { useState, useEffect } = React;

    let isAuthenticated, getCurrentUser, logout;

    const importAuthHelpers = async () => {
        try {
            const module = await import('/user-auth/scripts/authHelpers.js');
            isAuthenticated = module.isAuthenticated;
            getCurrentUser = module.getCurrentUser;
            logout = module.logout;
            return true;
        } catch (error) {
            console.error('Failed to import auth helpers:', error);
            return false;
        }
    };

    const GeoTunesHeader = () => {
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [showDropdown, setShowDropdown] = useState(false);
        const [currentUser, setCurrentUser] = useState(null);
        const [helpersLoaded, setHelpersLoaded] = useState(false);

        useEffect(() => {
            importAuthHelpers().then(success => {
                if (success) {
                    setHelpersLoaded(true);
                    const authenticated = isAuthenticated();
                    setIsLoggedIn(authenticated);

                    if (authenticated) {
                        setCurrentUser(getCurrentUser());
                    }
                }
            });
        }, []);

        const handleLogout = () => {
            if (helpersLoaded) {
                logout();
                setIsLoggedIn(false);
                setCurrentUser(null);
                window.location.reload();
            }
        };

        const toggleDropdown = () => setShowDropdown(!showDropdown);

        return React.createElement('header', {
            className: 'geotunes-header',
            style: headerStyle
        },
            React.createElement('div', { className: 'logo' },
                React.createElement('a', { href: '/' },
                    React.createElement('img', {
                        src: '/assets/logo.png',
                        alt: "GeoTunes Logo",
                        style: { height: '50px' }
                    })
                )
            ),
            React.createElement('h1', { style: titleStyle },
                React.createElement('a', { href: '/cityExploration/cityExploration.html', style: titleLinkStyle }, 'GeoTunes')
            ),
            React.createElement('div', { className: 'auth-controls' },
                isLoggedIn ? createDropdown() : createLoginButton()
            )
        );

        function createDropdown() {
            return React.createElement('div', {
                className: 'user-dropdown',
                style: { position: 'relative', display: 'inline-block' }
            },
                React.createElement('button', {
                    onClick: toggleDropdown,
                    style: dropdownButtonStyle
                }, `${currentUser ? currentUser.name : 'Account'} \u25BC`),
                showDropdown && React.createElement('ul', {
                    className: 'dropdown-menu',
                    style: dropdownMenuStyle
                },
                    createDropdownItem('/profile', 'Profile'),
                    React.createElement('li', { style: dropdownItemStyle },
                        React.createElement('button', {
                            onClick: handleLogout,
                            style: dropdownLinkStyle
                        }, 'Log Out')
                    )
                )
            );
        }

        function createDropdownItem(href, text) {
            return React.createElement('li', { style: dropdownItemStyle },
                React.createElement('a', { href: href, style: dropdownLinkStyle }, text)
            );
        }

        function createLoginButton() {
            return React.createElement('div', { style: { display: 'flex', gap: '10px' } },
                React.createElement('button', {
                    className: 'login-button',
                    style: loginButtonStyle,
                    onClick: () => { window.location.href = '/user-auth/login.html'; }
                }, 'Log In')
            );
        }
    };

    const GeoTunesFooter = () => {
        return React.createElement('footer', {
            className: 'geotunes-footer',
            style: footerStyle
        },
            React.createElement('p', { style: { margin: '0' } }, '\u00A9 2025 GeoTunes'),
            React.createElement('nav', { className: 'footer-nav' },
                React.createElement('ul', { style: footerNavListStyle },
                    React.createElement('li', { style: footerNavItemStyle },
                        React.createElement('a', { href: '/about', style: footerNavLinkStyle }, 'About')
                    ),
                    React.createElement('li', { style: footerNavItemStyle },
                        React.createElement('a', { href: '/contact', style: footerNavLinkStyle }, 'Contact')
                    )
                )
            )
        );
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#5D4037',
        borderBottom: '1px solid var(--border-color)',
        padding: '10px 20px',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
    };

    const titleStyle = {
        margin: '0 auto',
        fontSize: '2.2em',
    };

    const titleLinkStyle = {
        textDecoration: 'none',
        color: 'var(--primary-bg)'
    };

    const loginButtonStyle = {
        padding: '8px 16px',
        backgroundColor: 'var(--coral-pink)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
        transition: 'var(--transition-default)',
        marginRight: '20px'
    };

    const dropdownButtonStyle = {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'var(--primary-text)',
        fontWeight: 'bold',
        cursor: 'pointer'
    };

    const dropdownMenuStyle = {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: '#fff',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        listStyle: 'none',
        margin: 0,
        padding: '5px 0',
        zIndex: 1000
    };

    const dropdownItemStyle = {
        padding: '8px 16px'
    };

    const dropdownLinkStyle = {
        textDecoration: 'none',
        color: 'var(--primary-text)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        font: 'inherit',
        width: '100%',
        textAlign: 'left'
    };

    const footerStyle = {
        backgroundColor: '#755146',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        padding: '10px 20px',
        fontSize: '0.9em',
        color: 'var(--primary-bg)',
        width: '100%',
        position: 'relative'
    };

    const footerNavListStyle = {
        listStyle: 'none',
        margin: '5px 0 0 0',
        padding: 0,
        display: 'flex',
        justifyContent: 'center'
    };

    const footerNavItemStyle = {
        margin: '0 10px'
    };

    const footerNavLinkStyle = {
        textDecoration: 'none',
        color: 'var(--primary-bg)'
    };

    const mountComponents = () => {
        const headerMount = document.getElementById('header-root');
        const footerMount = document.getElementById('footer-root');

        if (headerMount) {
            headerMount.innerHTML = '';
            ReactDOM.render(React.createElement(GeoTunesHeader), headerMount);
        }

        if (footerMount) {
            footerMount.innerHTML = '';
            ReactDOM.render(React.createElement(GeoTunesFooter), footerMount);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountComponents);
    } else {
        mountComponents();
    }
}

function addGoogleFont() {
    if (!document.querySelector('link[href*="googleapis.com/css?family=Oleo+Script"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css?family=Oleo+Script';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
}

function addStickyFooterStyles() {
    if (!document.getElementById('sticky-footer-styles')) {
        const style = document.createElement('style');
        style.id = 'sticky-footer-styles';
        style.innerHTML = `
            html, body {
                height: 100%;
                margin: 0;
            }
            body {
                display: flex;
                flex-direction: column;
                padding-top: 70px;
            }
            #root {
                flex: 1;
                margin-bottom: 20px;
            }
        `;
        document.head.appendChild(style);
    }
}

if (!window.headerFooterInitialized) {
    window.headerFooterInitialized = true;
    run();
}
