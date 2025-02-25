function run() {
    addGoogleFont();

    addStickyFooterStyles();

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React and ReactDOM must be loaded');
        return;
    }

    const { useState, useEffect } = React;

    const GeoTunesHeader = () => {
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [showDropdown, setShowDropdown] = useState(false);

        useEffect(() => {
            const authToken = localStorage.getItem('authToken');
            if (authToken) setIsLoggedIn(true);
        }, []);

        const handleLogout = () => {
            localStorage.removeItem('authToken');
            setIsLoggedIn(false);
            window.location.reload();
        };

        const toggleDropdown = () => setShowDropdown(!showDropdown);

        return React.createElement('header', {
            className: 'geotunes-header',
            style: headerStyle
        },
            React.createElement('div', { className: 'logo' },
                React.createElement('a', { href: '/' },
                    React.createElement('img', {
                        src: "", //add file pathing for logo
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
                }, 'Account \u25BC'),
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
            return React.createElement('a', {
                href: '/user-auth/login.html',
                className: 'login-button',
                style: loginButtonStyle
            }, 'Log In');
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
        width:'100%',
        position:'fixed'
    };

    const titleStyle = {
        margin: '0 auto',
        fontSize: '2.2em',
    };

    const titleLinkStyle = {
        textDecoration: 'none',
        color: 'var(--primary-bg)'
    };

    // const navListStyle = {
    //     listStyle: 'none',
    //     margin: 0,
    //     padding: 0,
    //     display: 'flex'
    // };

    // const navItemStyle = {
    //     margin: '0 10px'
    // };

    // const navLinkStyle = {
    //     textDecoration: 'none',
    //     color: 'var(--primary-text)',
    //     fontWeight: 'bold',
    //     transition: 'var(--transition-default)'
    // };

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
        marginRight: '40px'
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
        color: 'var(--primary-bg)'
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
        color: '#ffff',
        color: 'var(--primary-bg)'
    };

    const mountComponents = () => {
        const headerMount = document.getElementById('header-root');
        if (headerMount)
            ReactDOM.render(React.createElement(GeoTunesHeader), headerMount);

        const footerMount = document.getElementById('footer-root');
        if (footerMount)
            ReactDOM.render(React.createElement(GeoTunesFooter), footerMount);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountComponents);
    } else {
        mountComponents();
    }
}

function addGoogleFont() {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css?family=Oleo+Script';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

function addStickyFooterStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
    html, body {
        height: 100%;
        margin: 0;
    }
    body {
        display: flex;
        flex-direction: column;
    }
    #content {
        flex: 1;
    }
    `;
    document.head.appendChild(style);
}

run();
