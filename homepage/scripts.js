'use strict';

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
        { className: 'btn', href: '/signup', style: { textDecoration:'none', color:'var(--primary-text)' } },
        'Sign Up'
      ),
      React.createElement(
        'a',
        { className: 'btn', href: '/login', style: { textDecoration:'none', color:'var(--primary-text)' } },
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
    React.createElement(MainContent)
  )
);
