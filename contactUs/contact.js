'use strict';

function ContactContent() {
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
        fontSize: '1.3rem'
      }
    },
    React.createElement(
      'h2',
      {
        style: {
          color: '#FF6B6B',
          fontSize: '3rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }
      },
      'Contact Us'
    ),
    React.createElement(
      'p',
      { style: { marginBottom: '1.25rem', textAlign: 'justify' } },
      "We’d love to hear from you! Whether you have feedback, suggestions, or just want to say hello, feel free to reach out to the GeoTunes team."
    ),
    React.createElement(
      'p',
      { style: { marginBottom: '1.25rem', textAlign: 'justify' } },
      "For general inquiries, collaborations, or technical support, email us at:"
    ),
    React.createElement(
      'p',
      { style: { textAlign: 'center', fontWeight: 'bold' } },
      React.createElement('a', { href: 'mailto:contact@geotunes.app', style: { color: '#1A365D', textDecoration: 'none' } }, 'contact@geotunes.app')
    ),
    React.createElement(
      'p',
      { style: { marginTop: '2rem', textAlign: 'center', fontStyle: 'italic' } },
      'Thank you for supporting local culture!'
    )
  );
}

const rootNode = document.getElementById('root');
const root = ReactDOM.createRoot(rootNode);
root.render(
  React.createElement(
    React.Fragment,
    null,
    React.createElement(ContactContent)
  )
);
