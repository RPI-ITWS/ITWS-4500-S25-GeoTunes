'use strict';

function MainContent() {
  return React.createElement(
    'div',
    { className: 'main-content' },
    React.createElement('h1', { className: 'main-title' }, 'GeoTunes'),
    React.createElement('p', { className: 'main-subtitle' }, 
      'Discover local music and events as you explore cities around the world. GeoTunes connects your location with curated playlists and nearby music experiences.'
    ),
    
    React.createElement('div', { className: 'button-container' },
      React.createElement(
        'a',
        { className: 'btn sign-up', href: '/signup', style: { textDecoration:'none', color:'white' } },
        'Sign Up'
      ),
      React.createElement(
        'a',
        { className: 'btn', href: '/login', style: { textDecoration:'none', color:'white' } },
        'Login'
      )
    ),

    React.createElement('div', { className: 'feature-section' },
      createFeatureBox(
        'City Exploration', 
        'Search for any city and discover local playlists curated based on geographical influences and cultural sounds.'
      ),
      createFeatureBox(
        'Music Discovery', 
        'Find songs and artists that represent the musical identity of each location you explore.'
      ),
      createFeatureBox(
        'Local Events', 
        'Discover concerts and music events happening in cities of interest.'
      )
    )
  );

  function createFeatureBox(title, description) {
    return React.createElement('div', { className: 'feature-box' },
      React.createElement('h3', { className: 'feature-title' }, title),
      React.createElement('p', { className: 'feature-desc' }, description)
    );
  }
}

ReactDOM.render(
  React.createElement(
    React.Fragment, 
    null,
    React.createElement(MainContent)
  ),
  document.getElementById('root')
);