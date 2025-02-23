// cityExploration.js

function CityExplorationApp() {
    const [city, setCity] = React.useState("");
    const [results, setResults] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    try {
        const response = await fetch(`/city-search?name=${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data);
    } catch (err) {
        setError("Error fetching city data.");
        console.error(err);
    }
    setLoading(false);
    };

    return React.createElement(
    "div",
    { className: "city-exploration-app" },
    React.createElement(
        "div",
        {
        className: "search-bar",
        style: { textAlign: "center", margin: "20px 0" }
        },
        React.createElement(
        "form",
        { onSubmit: handleSearch },
        React.createElement("input", {
            type: "text",
            placeholder: "Enter city name...",
            value: city,
            onChange: (e) => setCity(e.target.value),
            style: { padding: "0.5rem", width: "250px" }
        }),
        React.createElement(
            "button",
            { type: "submit", style: { marginLeft: "10px" } },
            "Search"
        )
        )
    ),
    React.createElement(
        "div",
        {
        className: "city-content-container",
        style: {
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-start",
            margin: "20px 0"
        }
        },
        React.createElement(
        "div",
        { className: "map-section", style: { flex: 1, marginRight: "10px" } },
        React.createElement("h3", null, "Map"),
        results && results.mapEmbedUrl
            ? React.createElement("iframe", {
                title: "City Map",
                src: results.mapEmbedUrl,
                width: "100%",
                height: "300",
                frameBorder: "0",
                style: { border: 0 }
            })
            : React.createElement(
                "div",
                {
                style: {
                    width: "100%",
                    height: "300px",
                    backgroundColor: "#ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }
                },
                "Map will be displayed here"
            )
        ),
        React.createElement(
        "div",
        { className: "playlist-section", style: { flex: 1, marginLeft: "10px" } },
        React.createElement("h3", null, "Playlist"),
        results && results.playlist
            ? React.createElement(
                "ul",
                null,
                results.playlist.map((song, index) =>
                React.createElement("li", { key: index }, song)
                )
            )
            : React.createElement(
                "div",
                {
                style: {
                    width: "100%",
                    height: "300px",
                    backgroundColor: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }
                },
                "Playlist will be displayed here"
            )
        )
    ),
    React.createElement(
        "div",
        {
        className: "info-box",
        style: {
            marginTop: "20px",
            padding: "10px",
            border: "1px solid var(--border-color)"
        }
        },
        React.createElement("h3", null, "Information"),
        results && results.info
        ? React.createElement("p", null, results.info)
        : React.createElement("p", null, "City information will be displayed here")
    ),
    loading && React.createElement("p", null, "Loading..."),
    error && React.createElement("p", { style: { color: "var(--error-red)" } }, error)
    );
}

ReactDOM.render(
    React.createElement(CityExplorationApp),
    document.getElementById("page-content")
);
