'use strict';

function AboutContent() {
  return React.createElement(
    'div',
    {
      className: 'main-content',
      style: {
        padding: '40px 30px',
        maxWidth: '900px',
        margin: '0 auto',
        color: '#1A365D',
        lineHeight: '1.75',
        fontSize: '1.15rem'
      }
    },
    React.createElement(
      'h2',
      {
        style: {
          color: '#FF6B6B',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }
      },
      'About GeoTunes'
    ),
    React.createElement(
      'p',
      { style: { marginBottom: '1.25rem', textAlign: 'justify' } },
      "GeoTunes is your cultural compass — a platform that helps you discover the real soul of a city. Whether you're traveling, exploring your hometown, or just vibing with new music, we connect you to authentic local experiences powered by community insights and Spotify-powered playlists."
    ),
    React.createElement(
      'p',
      { style: { marginBottom: '1.25rem', textAlign: 'justify' } },
      "Browse curated spots, hidden gems, underground events, and localized playlists. Our goal is to help you see places through the eyes (and ears) of those who live there."
    ),
    React.createElement(
      'p',
      { style: { marginBottom: '1.25rem', textAlign: 'justify' } },
      "Whether you're a local culture enthusiast, a music explorer, or a curious traveler, GeoTunes brings culture to your fingertips."
    ),
    React.createElement(
      'p',
      {
        style: {
          fontStyle: 'italic',
          fontWeight: 'bold',
          marginTop: '2rem',
          textAlign: 'center'
        }
      },
      'Built by: Harry Hargreaves, Isaac Lee, Cooper Kelly, Izik Bakhshiyev, Dure Mehmood — ITWS 4500'
    )
  );
}

const rootNode = document.getElementById('root');
const root = ReactDOM.createRoot(rootNode);
root.render(
  React.createElement(
    React.Fragment,
    null,
    React.createElement(AboutContent)
  )
);
