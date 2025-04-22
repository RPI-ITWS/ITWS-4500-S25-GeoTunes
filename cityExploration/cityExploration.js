import { requireAuth } from '/user-auth/scripts/authHelpers.js';

if (!requireAuth()) {
  throw new Error('Unauthorized');
}


function CityExplorationApp() {
    var _a = React.useState(""), city = _a[0], setCity = _a[1];
    var _b = React.useState(""), currentCity = _b[0], setCurrentCity = _b[1];
    var _c = React.useState("spotify"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = React.useState("Loading Spotify Playlist..."), tabContent = _d[0], setTabContent = _d[1];
    var _e = React.useState(false), mapInitialized = _e[0], setMapInitialized = _e[1];
    var _f = React.useState(null), mapInstance = _f[0], setMapInstance = _f[1];
    var _g = React.useState(null), marker = _g[0], setMarker = _g[1];
    const [feedPosts, setFeedPosts] = React.useState([]);
    const [feedInput, setFeedInput] = React.useState('');
    const [user, setUser] = React.useState(null);


  React.useEffect(function () {
    if (!mapInitialized) {

      var defaultCoords = [42.729996, -73.681763];
      L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
      var map = L.map("map").setView(defaultCoords, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      var mkr = L.marker(defaultCoords).addTo(map);
      setMapInstance(map);
      setMarker(mkr);
      setMapInitialized(true);
    }
  }, [mapInitialized]);

  function reverseGeocode(lat, lng) {
    return fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data && data.address) {
          return data.address.city || data.address.town || data.address.village || "";
        } else {
          throw new Error("No address found");
        }
      });
  }

  React.useEffect(function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          if (mapInstance) {
            mapInstance.setView([lat, lng], 13);
            if (marker) {
              marker.setLatLng([lat, lng]);
            } else {
              var mkr = L.marker([lat, lng]).addTo(mapInstance);
              setMarker(mkr);
            }
          }
          reverseGeocode(lat, lng)
            .then(function (cityName) {
              if (cityName) {
                setCity(cityName);
                setCurrentCity(cityName);
                setActiveTab("spotify");
                loadTabContent("spotify", cityName);
              }
            })
            .catch(function (error) {
              console.error("Reverse geocode error:", error);
            });
        },
        function (error) {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, [mapInstance, marker]);

  function geocodeCity(cityName) {
    return fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(cityName))
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data && data.length > 0) {
          return { lat: data[0].lat, lon: data[0].lon };
        } else {
          throw new Error("City not found");
        }
      });
  }

  function updateMap(lat, lng) {
    if (mapInstance) {
      mapInstance.setView([lat, lng], 13);
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        var mkr = L.marker([lat, lng]).addTo(mapInstance);
        setMarker(mkr);
      }
    }

  }

  function loadTabContent(tab, cityName) {
    if (tab === 'spotify') {
      fetch(`/spotify?city=${encodeURIComponent(cityName)}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setTabContent(`
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <h4 style="margin: 0;">Spotify Playlists for ${cityName}</h4>
              <a href="/create-playlist" style="
                display: inline-block;
                padding: 8px 16px;
                background-color: #FF6B6B;
                color: white;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-family: 'Oleo Script', cursive;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                transition: background 0.3s ease;
                margin-top: 10px;
              ">
                Create New Event
              </a>
            </div>
            <div id='embed-container' style="margin-top: 20px;"></div>
          `);
          window.onSpotifyIframeApiReady = (IFrameAPI) => {
            const container = document.getElementById('embed-container');
            data.forEach((playlist, index) => {
              const div = document.createElement('div');
              div.id = `embed-iframe-${index}`;
              div.style.marginBottom = '20px';
              container.appendChild(div);

              const options = {
                uri: `spotify:playlist:${playlist.playlist_id}`,
                width: '100%',
                height: '80',
                theme: 'black',
                view: 'list',
              }; IFrameAPI.createController(div, options, () => { });
            });
          };
        })
        .catch((err) => {
          console.error("Spotify fetch or embed error:", err);
          setTabContent('Error loading Spotify playlist.');
        });
    } else if (tab === "info") {
      fetch("/info?city=" + encodeURIComponent(cityName))
        .then(function (response) { return response.json(); })
        .then(function (data) {
          setTabContent("<div>" + (data.info || "No information available.") + "</div>");
        })
        .catch(function (err) {
          console.error(err);
          setTabContent("Error loading information.");
        });
    } else if (tab === "events") {
      fetch("/events?city=" + encodeURIComponent(cityName))
        .then(response => response.json())
        .then(data => {
          if (!data.events || data.events.length === 0) {
            setTabContent(`<h4>Events in ${cityName}</h4><p>No events available.</p>`);
            return;
          }

          let html = `<h4>Events in ${cityName}</h4><ul style="list-style: none; padding: 0;">`;

          data.events.forEach(event => {
            html += `
                                <li style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                                    <strong>${event.name}</strong><br>
                                    <em>${event.date} at ${event.time}</em><br>
                                    Location: ${event.location.address}<br>
                                    Cost: ${event.cost}<br>
                                    Contact: <a href="mailto:${event.contact}">${event.contact}</a><br>
                                    <p style="margin-top: 5px;">${event.description}</p>
                                    <button class="save-event-btn" data-id="${event._id}" style="margin-top: 10px; padding: 5px 10px; background-color: var(--emerald-green); color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        Save
                                    </button>
                                </li>
                            `;
          });

          html += '</ul>';
          setTabContent(html);

          setTimeout(() => {
            document.querySelectorAll('.save-event-btn').forEach(btn => {
              btn.addEventListener('click', async () => {
                const eventId = btn.getAttribute('data-id');
                try {
                  const response = await fetch('/api/user/events', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ eventId })
                  });
                  const result = await response.json();
                  if (response.ok) {
                    alert("Event saved!");
                  } else {
                    alert(result.error || "Failed to save event");
                  }
                } catch (err) {
                  alert("Server error while saving event.");
                  console.error(err);
                }
              });
            });
          }, 100);
        })
        .catch(err => {
          console.error(err);
          setTabContent("Error loading events.");
        });
    }
  }

  function handleSearch() {
    if (city.trim() === "") {
      alert("Please enter a city name.");
      return;
    }
    var trimmedCity = city.trim();
    setCurrentCity(trimmedCity);
    geocodeCity(trimmedCity)
      .then(function (coords) {
        updateMap(coords.lat, coords.lon);
        setActiveTab("spotify");
        loadTabContent("spotify", trimmedCity);
        fetchFeed(trimmedCity);
        })
        .catch(function (err) {
        alert("Error: " + err.message);
      });
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

    function handleTabClick(tab) {
    setActiveTab(tab);
    if (currentCity) {
      loadTabContent(tab, currentCity);
    } else {
      setTabContent("Please search for a city first.");
    }
  }

  return React.createElement(
    "div",
    { className: "container", style: { width: "90%", margin: "0 auto" } },
    React.createElement(
      "div",
      { className: "search-bar", style: { textAlign: "center", margin: "20px 0" } },
      React.createElement("input", {
        type: "text",
        id: "search-input",
        placeholder: "Enter city name",
        value: city,
        onChange: function (e) { setCity(e.target.value); },
        style: {
          padding: "0.5rem",
          width: "250px",
          border: "1px solid var(--border-color)",
          borderRadius: "6px"
        }
      }),
      React.createElement(
        "button",
        {
          id: "search-btn",
          style: {
            padding: "0.5rem 1rem",
            marginLeft: "10px",
            backgroundColor: "var(--coral-pink)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          },
          onClick: handleSearch
        },
        "Search"
      )
    ),
    React.createElement(
      "div",
      {
        className: "city-content-container",
        style: {
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          // background: "clear",
          padding: "20px",
          borderRadius: "12px",
          // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
        }
      },
      React.createElement(
        "div",
        { className: "map-section", style: { flex: 1, margin: "10px", height: "400px" } },
        React.createElement("div", {
          id: "map",
          style: {
            height: "100%",
            backgroundColor: "#ddd",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            border: "1px solid var(--border-color)"
          }
        })
      ),
      React.createElement(
        "div",
        { className: "right-panel", style: { flex: 1, margin: "10px", height: "400px", display: "flex", flexDirection: "column" } },
        React.createElement(
          "div",
          { className: "tabs", style: { display: "flex", justifyContent: "space-around", marginBottom: "10px" } },
          React.createElement(
            "button",
            {
              className: "tab-btn" + (activeTab === "spotify" ? " active" : ""),
              onClick: function () { handleTabClick("spotify"); },
              style: {
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "spotify" ? "#FF6B6B" : "#1A365D",
                color: "white",
                border: "none",
                cursor: "pointer"
              }
            },
            "Spotify Playlist"
          ),
          React.createElement(
            "button",
            {
              className: "tab-btn" + (activeTab === "info" ? " active" : ""),
              onClick: function () { handleTabClick("info"); },
              style: {
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "info" ? "#FF6B6B" : "#1A365D",
                color: "white",
                border: "none",
                cursor: "pointer"
              }
            },
            "Information"
          ),
          React.createElement(
            "button",
            {
              className: "tab-btn" + (activeTab === "events" ? " active" : ""),
              onClick: function () { handleTabClick("events"); },
              style: {
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "events" ? "#FF6B6B" : "#1A365D",
                color: "white",
                border: "none",
                cursor: "pointer"
              }
            },
            "Events"
          )
        ),
        React.createElement(
        "div",
        { className: "bottom-buttons", style: { textAlign: "center", marginTop: "20px" } },
        React.createElement("a", {
            href: "/add-song",
            style: {
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1A365D",
            color: "#fff",
            borderRadius: "4px",
            margin: "0 10px",
            textDecoration: "none"
            }
        }, "Add to Playlist"),
        React.createElement("a", {
            href: "/create-event",
            style: {
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1A365D",
            color: "#fff",
            borderRadius: "4px",
            margin: "0 10px",
            textDecoration: "none"
            }
        }, "Add an Event")
        ),
        React.createElement(
          "div",
          { className: "social-feed", style: { marginTop: "30px" } },
          React.createElement("h3", null, `${currentCity || 'City'} Feed`),
          React.createElement("textarea", {
              value: feedInput,
              onChange: (e) => setFeedInput(e.target.value),
              placeholder: `What's happening in ${currentCity || 'this city'}?`,
              rows: 3,
              style: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }
          }),
          React.createElement("button", {
              onClick: postToFeed,
              style: { marginTop: "10px", padding: "6px 12px", backgroundColor: "#FF6B6B", color: "white", border: "none", borderRadius: "4px" }
          }, "Post"),
          feedPosts.length === 0
              ? React.createElement("p", null, "No posts yet. Be the first to share!")
              : feedPosts.map(post =>
                  React.createElement("div", {
                      key: post._id,
                      style: {
                          marginTop: "15px",
                          padding: "10px",
                          border: "1px solid #eee",
                          borderRadius: "6px",
                          backgroundColor: "#fafafa"
                      }
                  },
                      React.createElement("strong", null, post.username || "Anonymous"),
                      React.createElement("small", { style: { display: "block", color: "#888" } }, new Date(post.timestamp).toLocaleString()),
                      React.createElement("p", null, post.content)
                  )
              )
      )      
    );      
}

ReactDOM.render(
  React.createElement(CityExplorationApp, null),
  document.getElementById("root")
);
