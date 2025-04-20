'use strict';

function MainContent() {
  // Simulate map image URL
  const mapImageUrl = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400' preserveAspectRatio='none'%3E%3Crect width='800' height='400' fill='%23eee' /%3E%3Cpath d='M0,50 Q200,150 400,50 T800,50 L800,400 L0,400 Z' fill='%23aed581' /%3E%3Cpath d='M0,70 Q200,170 400,70 T800,70' fill='none' stroke='%2381c784' stroke-width='2' /%3E%3Ccircle cx='300' cy='150' r='10' fill='%23ff7043' /%3E%3Ccircle cx='500' cy='100' r='8' fill='%23ff7043' /%3E%3Cpath d='M150,200 Q400,100 650,300' fill='none' stroke='%236c8ebf' stroke-width='3' /%3E%3C/svg%3E";

  // Feature icons using Unicode characters
  const locationIcon = "📍";
  const musicIcon = "🎵";
  const eventIcon = "🎭";

  return React.createElement(
    'div',
    { className: 'hero-container' },
    React.createElement('div', { className: 'hero-content' },
      React.createElement('h1', { className: 'hero-title' }, 'Discover Music Through Places'),
      React.createElement('p', { className: 'hero-subtitle' }, 
        'GeoTunes connects you with the musical soul of cities around the world. Explore local playlists, discover events, and experience the rhythm of any location.')
    ),
    
    React.createElement('div', { className: 'button-container' },
      React.createElement('a', { 
        className: 'btn btn-primary', 
        href: '/signup',
        style: { textDecoration: 'none' }
      }, 'Get Started'),
      React.createElement('a', { 
        className: 'btn btn-secondary', 
        href: '/login',
        style: { textDecoration: 'none' }
      }, 'Sign In')
    ),

    React.createElement('div', { className: 'map-preview' },
      React.createElement('img', { 
        src: mapImageUrl,
        alt: 'Interactive map preview',
        className: 'map-bg'
      }),
      React.createElement('div', { className: 'map-overlay' },
        React.createElement('h3', { style: { color: 'var(--navy-blue)', fontSize: '1.8rem' } }, 
          'Start Exploring')
      )
    ),

    React.createElement('div', { className: 'feature-cards' },
      createFeatureCard(locationIcon, 'Explore Cities', 'Discover the musical identity of any city in the world with interactive maps and local insights.'),
      createFeatureCard(musicIcon, 'Custom Playlists', 'Experience curated playlists that capture the essence and culture of each location.'),
      createFeatureCard(eventIcon, 'Local Events', 'Find concerts, festivals, and music events happening near you or in cities you plan to visit.')
    ),
    
    React.createElement('div', { className: 'testimonials' },
      React.createElement('h2', { className: 'section-title' }, 'What Users Are Saying'),
      React.createElement('div', { className: 'testimonial-grid' },
        createTestimonial("GeoTunes helped me discover amazing local artists when I moved to a new city. It's like having a local music guide!", "Alex M."),
        createTestimonial("I love how I can explore different music cultures without leaving my home. The city playlists are incredibly well-curated.", "Jamie T.")
      )
    )
  );

  function createFeatureCard(icon, title, description) {
    return React.createElement('div', { className: 'feature-card' },
      React.createElement('div', { className: 'feature-icon' }, icon),
      React.createElement('h3', { className: 'feature-title' }, title),
      React.createElement('p', { className: 'feature-desc' }, description)
    );
  }
  
  function createTestimonial(text, author) {
    return React.createElement('div', { className: 'testimonial-card' },
      React.createElement('div', { className: 'quote-mark' }, '"'),
      React.createElement('p', { className: 'testimonial-text' }, text),
      React.createElement('p', { className: 'testimonial-author' }, author)
    );
  }
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