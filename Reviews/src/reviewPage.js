'use strict';

function CityExploration() {
    return React.createElement(
        "div",
        { className: "city-container" },
        React.createElement(
            "div",
            { className: "search-container" },
            React.createElement("span", { className: "search-icon" }, ""),
            React.createElement("h2", null, "Troy, NY")
        ),
        React.createElement(
            "div",
            { className: "review-box" },
            React.createElement("p", null, "WRITE A REVIEW...")
        ),
        React.createElement(
            "a",
            { href: "../cityExploration/cityExploration.html", className: "btn back-btn" },
            "BACK"
        )
    );
}

const rootNode = document.getElementById("root");
const root = ReactDOM.createRoot(rootNode);

root.render(
    React.createElement(
        React.Fragment,
        null,
        React.createElement(CityExploration)
    )
);
