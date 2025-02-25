
function CityExplorationApp() {
    var _a = React.useState(""), city = _a[0], setCity = _a[1];
    var _b = React.useState(""), currentCity = _b[0], setCurrentCity = _b[1];
    var _c = React.useState("spotify"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = React.useState("Loading Spotify Playlist..."), tabContent = _d[0], setTabContent = _d[1];
    var _e = React.useState(false), mapInitialized = _e[0], setMapInitialized = _e[1];
    var _f = React.useState(null), mapInstance = _f[0], setMapInstance = _f[1];
    var _g = React.useState(null), marker = _g[0], setMarker = _g[1];

    React.useEffect(function () {
    if (!mapInitialized) {
        var defaultCoords = [42.729996, -73.681763]; 
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
        .then(function(response) { return response.json(); })
        .then(function(data) {
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
    if (tab === "spotify") {
        fetch("/node/spotify?city=" + encodeURIComponent(cityName))
        .then(function (response) { return response.json(); })
        .then(function (data) {
            // TODO: Replace with  actual Spotify playlist from the database.
            setTabContent("<h4>Spotify Playlist for " + cityName + "</h4><p>" +
            (data.playlist || "No playlist available.") + "</p>");
        })
        .catch(function (err) {
            console.error(err);
            setTabContent("Error loading Spotify playlist.");
        });
    } else if (tab === "info") {
        fetch("/node/info?city=" + encodeURIComponent(cityName))
        .then(function (response) { return response.json(); })
        .then(function (data) {
            // TODO: Replace with actual city information from the database.
            setTabContent("<h4>Information about " + cityName + "</h4><p>" +
            (data.info || "No information available.") + "</p>");
        })
        .catch(function (err) {
            console.error(err);
            setTabContent("Error loading information.");
        });
    } else if (tab === "events") {
        fetch("/node/events?city=" + encodeURIComponent(cityName))
        .then(function (response) { return response.json(); })
        .then(function (data) {
            // TODO: Replace with actual events from the database.
            setTabContent("<h4>Events in " + cityName + "</h4><p>" +
            (data.events || "No events available.") + "</p>");
        })
        .catch(function (err) {
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
        })
        .catch(function (err) {
        alert("Error: " + err.message);
        });
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
    // Search Bar
    React.createElement(
        "div",
        { className: "search-bar", style: { textAlign: "center", margin: "20px 0" } },
        React.createElement("input", {
        type: "text",
        id: "search-input",
        placeholder: "Enter city name",
        value: city,
        onChange: function (e) { setCity(e.target.value); },
        style: { padding: "0.5rem", width: "250px" },
        }),
        React.createElement(
        "button",
        { id: "search-btn", style: { padding: "0.5rem", marginLeft: "10px" }, onClick: handleSearch },
        "Search"
        )
    ),
    React.createElement(
        "div",
        {
        className: "city-content-container",
        style: { display: "flex", justifyContent: "space-between", marginBottom: "20px"},
        },
        React.createElement(
        "div",
        { className: "map-section", style: { flex: 1, marginRight: "10px" } },
        React.createElement("div", { id: "map", style: { height: "300px", backgroundColor: "#ddd" } })
        ),
        React.createElement(
        "div",
        { className: "right-panel", style: { flex: 1, marginLeft: "10px", display: "flex", flexDirection: "column" } },
        React.createElement(
            "div",
            { className: "tabs", style: { display: "flex", justifyContent: "space-around", marginBottom: "10px" } },
            React.createElement(
            "button",
            {
                className: "tab-btn" + (activeTab === "spotify" ? " active" : ""),
                onClick: function () { handleTabClick("spotify"); },
                style: { flex: 1, padding: "10px", backgroundColor: activeTab === "spotify" ? "#FF6B6B" : "#1A365D", color: "white", border: "none", cursor: "pointer" },
            },
            "Spotify Playlist"
            ),
            React.createElement(
            "button",
            {
                className: "tab-btn" + (activeTab === "info" ? " active" : ""),
                onClick: function () { handleTabClick("info"); },
                style: { flex: 1, padding: "10px", backgroundColor: activeTab === "info" ? "#FF6B6B" : "#1A365D", color: "white", border: "none", cursor: "pointer" },
            },
            "Information"
            ),
            React.createElement(
            "button",
            {
                className: "tab-btn" + (activeTab === "events" ? " active" : ""),
                onClick: function () { handleTabClick("events"); },
                style: { flex: 1, padding: "10px", backgroundColor: activeTab === "events" ? "#FF6B6B" : "#1A365D", color: "white", border: "none", cursor: "pointer" },
            },
            "Events"
            )
        ),
        React.createElement("div", {
            className: "tab-content",
            style: { border: "1px solid #2A2A2A", padding: "10px", height: "300px", overflowY: "auto" },
            dangerouslySetInnerHTML: { __html: tabContent },
        })
        )
    ),
    React.createElement(
        "div",
        { className: "bottom-buttons", style: { textAlign: "center", marginTop: "20px" } },
        React.createElement("a", {
        href: "/public/add-song.html",
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
        href: "/reviewPage/reviewPage.html",
        style: {
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1A365D",
            color: "#fff",
            borderRadius: "4px",
            margin: "0 10px",
            textDecoration: "none"
        }
        }, "Leave a Review")
    )
    );
}

ReactDOM.render(
    React.createElement(CityExplorationApp, null),
    document.getElementById("root")
);
