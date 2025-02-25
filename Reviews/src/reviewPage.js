'use strict';

function CityExploration() {
    return React.createElement(
        "div",
        { className: "city-container" },
        React.createElement(
            "div",
            { className: "search-container" },
            React.createElement("span", { className: "search-icon" }, "🔍"),
            React.createElement("h2", null, "Troy, NY")
        ),
        React.createElement("button", { className: "btn" }, "WRITE A REVIEW"),
        React.createElement(
            "div",
            { className: "review-box" },
            React.createElement("p", null, "WRITE A REVIEW...")
        )
    );
}

const rootNode = document.getElementById("root"); // Ensure ID is 'root'
const root = ReactDOM.createRoot(rootNode); // ✅ Works only in React 18+

root.render(
    React.createElement(
        React.Fragment,
        null,
        React.createElement(CityExploration)
    )
);