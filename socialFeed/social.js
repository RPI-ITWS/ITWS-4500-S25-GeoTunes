'use strict';

function CityFeed() {
  const [city, setCity] = React.useState('');
  const [posts, setPosts] = React.useState([]);
  const [newPost, setNewPost] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [user, setUser] = React.useState(null);
  const textRef = React.useRef(null);

  const formatCity = (name) =>
    name && typeof name === 'string'
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : name;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityName = params.get("city") || "Unknown";
    setCity(cityName);
    fetchPosts(cityName);

    import('/user-auth/scripts/authHelpers.js').then(mod => {
      setUser(mod.getCurrentUser());
    });
  }, []);

  const fetchPosts = async (cityName) => {
    const res = await fetch(`/api/feed?city=${encodeURIComponent(cityName)}`);
    const data = await res.json();
    setPosts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newPost.trim();
    if (!trimmed) return;

    const newEntry = {
      _id: 'temp-' + Date.now(),
      username: user?.name || "Anonymous",
      content: trimmed,
      timestamp: new Date().toISOString()
    };

    setPosts(prev => [newEntry, ...prev]);
    setNewPost('');
    setStatus('Posted!');
    textRef.current?.focus();
    document.getElementById('root')?.scrollIntoView({ behavior: 'smooth' });

    const res = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        content: trimmed,
        username: newEntry.username
      })
    });

    if (res.ok) {
      fetchPosts(city);
      setTimeout(() => setStatus(''), 2000);
    } else {
      setStatus('Error posting');
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        maxWidth: '700px',
        margin: '60px auto 40px',
        padding: '0 15px',
        fontFamily: "'Oleo Script', cursive",
      }
    },

    React.createElement('div', {
      style: {
        marginBottom: '20px',
        textAlign: 'left'
      }
    },
      React.createElement('h1', {
        style: {
          color: '#FF6B6B',
          fontSize: '2rem',
          marginBottom: '4px'
        }
      }, `${formatCity(city)} Feed`),
      React.createElement('p', {
        style: {
          fontSize: '1rem',
          color: '#333',
        }
      }, `Posting as ${user?.name || 'Anonymous'}`)
    ),

    React.createElement('form', {
      onSubmit: handleSubmit,
      style: {
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    },
      React.createElement('textarea', {
        ref: textRef,
        placeholder: `What's happening in ${formatCity(city)}?`,
        value: newPost,
        onChange: (e) => setNewPost(e.target.value),
        rows: 2,
        style: {
          width: '100%',
          padding: '12px 16px',
          paddingRight: '48px',
          fontSize: '1rem',
          fontFamily: "'Oleo Script', cursive",
          backgroundColor: '#fdfdfd',
          border: '1px solid #ccc',
          borderRadius: '14px',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.4',
          boxSizing: 'border-box',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        },
        required: true
      }),
      React.createElement('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
      },
        React.createElement('small', { style: { color: '#888' } }, status),
        React.createElement('button', {
          type: 'submit',
          style: {
            backgroundColor: '#FF6B6B',
            color: '#fff',
            padding: '8px 18px',
            border: 'none',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }
        }, 'Post')
      )
    ),

    React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }
    },
      posts.length === 0
        ? React.createElement('p', {
          style: {
            textAlign: 'center',
            fontStyle: 'italic',
            color: '#aaa',
            fontSize: '0.9rem'
          }
        }, 'No posts yet in this city...')
        : posts.map(post =>
          React.createElement('div', {
            key: post._id,
            style: {
              display: 'flex',
              gap: '10px',
              backgroundColor: '#fff',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid #eee',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }
          },
            React.createElement('div', {
              style: {
                width: '36px',
                height: '36px',
                backgroundColor: '#1A365D',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                flexShrink: 0
              }
            }, post.username?.charAt(0).toUpperCase() || 'A'),

            React.createElement('div', null,
              React.createElement('div', {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '2px'
                }
              },
                React.createElement('strong', {
                  style: {
                    fontSize: '0.95rem',
                    color: '#1A365D'
                  }
                }, post.username || 'Anonymous'),
                React.createElement('small', {
                  style: { color: '#888', fontSize: '0.8rem', whiteSpace: 'nowrap' }
                }, new Date(post.timestamp).toLocaleString())
              ),
              React.createElement('p', {
                style: {
                  fontSize: '0.95rem',
                  margin: 0,
                  color: '#333'
                }
              }, post.content)
            )
          )
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
    React.createElement(CityFeed)
  )
);
