'use strict';

// function Navbar() {
//   return React.createElement(
//     'nav',
//     { className: 'navbar' },
//     React.createElement('div', { className: 'logo' }, 'LOGO'),
//     React.createElement(
//       'a',
//       { className: 'login-link', href: '#login' },
//       'LOGIN/SIGN UP'
//     )
//   );
// }

function MainContent() {
  return React.createElement(
    'div',
    { className: 'main-content' },
    React.createElement('h1', {}, 'GeoTunes'),
    React.createElement('p', {}, 'Mini desc describing concept'),
    React.createElement(
      'div',
      { className: 'button-container' },
      React.createElement(
        'a',
        { className: 'btn', href: '/user-auth/signup.html' },
        'Sign Up'
      ),
      React.createElement(
        'a',
        { className: 'btn', href: '/user-auth/login.html' },
        'Login'
      )
    )
  );
}

const rootNode = document.getElementById('root');
const root = ReactDOM.createRoot(rootNode);
root.render(
  React.createElement(
    React.Fragment,
    null,
    // React.createElement(Navbar),
    React.createElement(MainContent)
  )
);
