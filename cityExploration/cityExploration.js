'use strict';

function CityExplorationApp() {
  const [city, setCity] = React.useState('');
  const [currentCity, setCurrentCity] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('spotify');
  const [tabContent, setTabContent] = React.useState('Loading...');
  const [mapInitialized, setMapInitialized] = React.useState(false);
  const [mapInstance, setMapInstance] = React.useState(null);
  const [marker, setMarker] = React.useState(null);
  const [feedPosts, setFeedPosts] = React.useState([]);
  const [feedInput, setFeedInput] = React.useState('');
  const [user, setUser] = React.useState(null);

  const normalizeCity = (name) => name.trim().toLowerCase();

  const formatCity = (name) =>
    name && typeof name === 'string'
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : name;

  React.useEffect(() => {
    if (!mapInitialized) {
      const defaultCoords = [42.729996, -73.681763];
      L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
      const map = L.map('map', {
        zoomControl: false
      }).setView(defaultCoords, 13);
      
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      const mkr = L.marker(defaultCoords).addTo(map);
      setMapInstance(map);
      setMarker(mkr);
      setMapInitialized(true);
    }
  }, [mapInitialized]);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (mapInstance) {
            mapInstance.setView([lat, lng], 13);
            if (marker) {
              marker.setLatLng([lat, lng]);
            } else {
              const mkr = L.marker([lat, lng]).addTo(mapInstance);
              setMarker(mkr);
            }
          }
          const cityName = await reverseGeocode(lat, lng);
          if (cityName) {
            const normalized = normalizeCity(cityName);
            setCity(normalized);
            setCurrentCity(normalized);
            setActiveTab('spotify');
            loadTabContent('spotify', normalized);
            fetchFeed(normalized);
          }

          const auth = await import('/user-auth/scripts/authHelpers.js');
          setUser(auth.getCurrentUser());
        },
        function (error) {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [mapInstance, marker]);

  function reverseGeocode(lat, lng) {
    return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.address) {
          return data.address.city || data.address.town || data.address.village || '';
        } else {
          throw new Error('No address found');
        }
      });
  }

  function geocodeCity(cityName) {
    return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          return { lat: data[0].lat, lon: data[0].lon };
        } else {
          throw new Error('City not found');
        }
      });
  }

  function updateMap(lat, lng) {
    if (mapInstance) {
      mapInstance.setView([lat, lng], 13);
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        const mkr = L.marker([lat, lng]).addTo(mapInstance);
        setMarker(mkr);
      }
    }
  }

  function loadTabContent(tab, cityName) {
    if (tab === 'spotify') {
      fetch(`/spotify?city=${encodeURIComponent(cityName)}`)
        .then((response) => response.json())
        .then((data) => {
          setTabContent(`<h4>Spotify Playlist for ${formatCity(cityName)}</h4><div id='embed-iframe'></div>`);
          window.onSpotifyIframeApiReady = (IFrameAPI) => {
            const element = document.getElementById('embed-iframe');
            const options = { uri: `${data.external_urls.spotify}` };
            IFrameAPI.createController(element, options, () => {});
          };
        })
        .catch(() => setTabContent('Error loading Spotify playlist.'));
    } else if (tab === 'info') {
      fetch(`/info?city=${encodeURIComponent(cityName)}`)
        .then((response) => response.json())
        .then((data) => {
          setTabContent(`<div>${data.info || 'No information available.'}</div>`);
        })
        .catch(() => setTabContent('Error loading information.'));
    } else if (tab === 'events') {
      fetch(`/events?city=${encodeURIComponent(cityName)}`)
        .then((response) => response.json())
        .then((data) => {
          const eventsHtml = data.events?.length
            ? data.events
                .map(
                  (event) => `
                  <li style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                    <strong>${event.name}</strong><br>
                    <em>${event.date} at ${event.time}</em><br>
                    Location: ${event.location.address}<br>
                    Cost: ${event.cost}<br>
                    Contact: <a href="mailto:${event.contact}">${event.contact}</a><br>
                    <p style="margin-top: 5px;">${event.description}</p>
                  </li>`
                )
                .join('')
            : `<p>No events available.</p>`;

          setTabContent(`
            <h4>Events in ${formatCity(cityName)}</h4>
            <ul style="list-style: none; padding: 0;">${eventsHtml}</ul>
            <div style="margin-top: 30px; text-align: center;">
              <a href="/create-event" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #FF6B6B;
                color: white;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-family: 'Oleo Script', cursive;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                transition: background 0.3s ease;
              ">
                Create New Event
              </a>
            </div>
          `);
        })
        .catch(() => setTabContent('Error loading events.'));
    }
  }

  function handleSearch() {
    if (city.trim() === '') {
      alert('Please enter a city name.');
      return;
    }
    const trimmedCity = normalizeCity(city);
    setCurrentCity(trimmedCity);
    geocodeCity(trimmedCity)
      .then((coords) => {
        updateMap(coords.lat, coords.lon);
        setActiveTab('spotify');
        loadTabContent('spotify', trimmedCity);
        fetchFeed(trimmedCity);
      })
      .catch((err) => {
        alert('Error: ' + err.message);
      });
  }

  function handleTabClick(tab) {
    setActiveTab(tab);
    if (currentCity) {
      loadTabContent(tab, currentCity);
    } else {
      setTabContent('Please search for a city first.');
    }
  }

  async function fetchFeed(cityName) {
    const res = await fetch(`/api/feed?city=${encodeURIComponent(cityName)}`);
    const data = await res.json();
    setFeedPosts(data);
  }

  async function postToFeed() {
    const trimmed = feedInput.trim();
    if (!trimmed) return;

    await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: currentCity,
        content: trimmed,
        username: user?.name || 'Anonymous'
      })
    });

    setFeedInput('');
    fetchFeed(currentCity);
  }

  // Colors based on the image you shared
  const colors = {
    spotifyTab: '#FF6B6B',   // Coral pink for Spotify tab
    infoTab: '#1A365D',      // Dark blue for Info tab
    eventsTab: '#1A365D',    // Dark blue for Events tab
    light: '#FFFFFF',
    border: '#2A2A2A',
    contentBg: '#FFFFFF',    // White background for content
    pageBg: '#F8F4EA',       // Cream background for page (from image)
    headingText: '#333333',
    bodyText: '#444444',
    feedBg: '#FCFCFC'
  };

  return React.createElement(
    'div',
    { 
      className: 'container', 
      style: { 
        width: '90%', 
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: colors.pageBg,
        padding: '20px',
        borderRadius: '8px'
      } 
    },
    React.createElement(
      'h2',
      { 
        style: { 
          textAlign: 'center', 
          color: colors.headingText,
          marginBottom: '20px',
          fontFamily: "'Oleo Script', cursive"
        } 
      },
      'GeoTunes City Exploration'
    ),
    React.createElement(
      'div',
      { 
        className: 'search-bar', 
        style: { 
          textAlign: 'center', 
          margin: '20px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        } 
      },
      React.createElement('input', {
        type: 'text',
        id: 'search-input',
        placeholder: 'Enter city name',
        value: city,
        onChange: (e) => setCity(e.target.value),
        style: {
          padding: '0.75rem',
          width: '300px',
          border: `1px solid #ccc`,
          borderRadius: '6px',
          fontSize: '16px',
          outline: 'none',
        }
      }),
      React.createElement(
        'button',
        {
          id: 'search-btn',
          style: {
            padding: '0.75rem 1.5rem',
            marginLeft: '10px',
            backgroundColor: colors.spotifyTab,
            color: colors.light,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          },
          onClick: handleSearch,
        },
        'Explore'
      )
    ),
    React.createElement(
      'div',
      {
        className: 'content-container',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }
      },
      // Top section with map and tabs side by side
      React.createElement(
        'div',
        {
          className: 'top-section',
          style: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }
        },
        // Map section
        React.createElement(
          'div',
          { 
            className: 'map-section', 
            style: { 
              flex: '1 1 400px',
              minHeight: '400px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              border: '1px solid #ccc'
            } 
          },
          React.createElement('div', {
            id: 'map',
            style: {
                height: '100%',
                minHeight: '400px',
                width: '100%',
              },
              
          })
        ),
        // Content tabs section - styling matched to your image
        React.createElement(
          'div',
          { 
            className: 'content-section', 
            style: { 
              flex: '1 1 400px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              border: '1px solid #ccc',
            } 
          },
          // Tabs - styling to match your image exactly
          React.createElement(
            'div',
            { 
              className: 'tabs', 
              style: { 
                display: 'flex',
                overflow: 'hidden',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              } 
            },
            [
              { name: 'spotify', color: colors.spotifyTab, text: 'Spotify' },
              { name: 'info', color: colors.infoTab, text: 'Info' },
              { name: 'events', color: colors.eventsTab, text: 'Events' }
            ].map((tab) =>
              React.createElement(
                'button',
                {
                  key: tab.name,
                  className: `tab-btn`,
                  onClick: () => handleTabClick(tab.name),
                  style: {
                    flex: 1,
                    padding: '12px',
                    backgroundColor: activeTab === tab.name ? '#FF6B6B' : colors.infoTab,
                    color: colors.light,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: "'Oleo Script', cursive",
                    fontSize: '18px',
                    textAlign: 'center',
                    outline: 'none'
                  },
                },
                tab.text
              )
            )
          ),
          // Tab content - with styling to match your image
          React.createElement('div', {
            className: 'tab-content',
            style: {
              padding: '20px',
              backgroundColor: colors.contentBg,
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              height: '350px',
              overflowY: 'auto'
            },
            dangerouslySetInnerHTML: { __html: tabContent },
          })
        )
      ),
      // Feed section - now below map and tabs
      React.createElement(
        'div',
        { 
          className: 'social-feed-section', 
          style: { 
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            border: '1px solid #ccc',
            padding: '20px',
            backgroundColor: colors.feedBg,
            marginTop: '10px'
          } 
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              borderBottom: '2px solid ' + colors.spotifyTab,
              paddingBottom: '8px'
            }
          },
          React.createElement('h3', { 
            style: { 
              color: colors.spotifyTab,
              margin: 0,
              fontFamily: "'Oleo Script', cursive",
            } 
          }, `${formatCity(currentCity) || 'City'} Feed`),
          React.createElement('small', { 
            style: { 
              color: colors.bodyText,
              fontStyle: 'italic'
            } 
          }, 'Share your experiences')
        ),
        // Post input area
        React.createElement(
          'div',
          {
            style: {
              marginBottom: '15px'
            }
          },
          React.createElement('textarea', {
            value: feedInput,
            placeholder: `What's happening in ${formatCity(currentCity) || 'this city'}?`,
            onChange: (e) => setFeedInput(e.target.value),
            rows: 3,
            style: {
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: 'Arial, sans-serif',
              marginBottom: '10px',
              resize: 'vertical'
            }
          }),
          React.createElement(
            'div',
            { style: { textAlign: 'right' } },
            React.createElement(
              'button',
              {
                onClick: postToFeed,
                style: {
                  padding: '8px 16px',
                  backgroundColor: colors.spotifyTab,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                },
              },
              'Post'
            )
          )
        ),
        React.createElement(
          'div',
          {
            style: {
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '5px',
              borderTop: '1px solid #eee',
              paddingTop: '10px'
            },
          },
          feedPosts.length === 0
            ? React.createElement('p', {
                style: {
                  textAlign: 'center',
                  fontStyle: 'italic',
                  color: colors.bodyText,
                  padding: '20px',
                },
              }, 'No posts yet. Be the first to share!')
            : feedPosts.map((post) =>
                React.createElement(
                  'div',
                  {
                    key: post._id,
                    style: {
                      background: colors.contentBg,
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '8px',
                      border: '1px solid #eee',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    },
                  },
                  React.createElement(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: '5px',
                      },
                    },
                    React.createElement('div', {
                      style: {
                        fontWeight: 'bold',
                        color: colors.infoTab,
                      },
                    }, post.username || 'Anonymous'),
                    React.createElement('small', {
                      style: {
                        color: '#888',
                      },
                    }, new Date(post.timestamp).toLocaleString())
                  ),
                  React.createElement('p', {
                    style: {
                      margin: '5px 0 0 0',
                      lineHeight: '1.4',
                      color: colors.bodyText,
                    },
                  }, post.content)
                )
              )
        )
      )
    )
  );
}

ReactDOM.render(
  React.createElement(CityExplorationApp),
  document.getElementById('root')
);