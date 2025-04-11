'use strict';

function Reviws() {
    const [review, setReview] = React.useState("");
    const [reviews, setReviews] = React.useState([]);

    React.useEffect(() => {
        const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
        setReviews(storedReviews);
    }, []);

    const handleSubmit = () => {
        if (!review.trim()) return;

        const newReviews = [...reviews, review];

        localStorage.setItem("reviews", JSON.stringify(newReviews));
        setReviews(newReviews);
        setReview("");
    };

    const handleClear = () => {
        localStorage.removeItem("reviews");
        setReviews([]);
    };

    return React.createElement(
        "div",
        { className: "text-box" },
        React.createElement(
            "div",
            { className: "search-container" },
            React.createElement("h2", null, "Troy, NY")
        ),
        React.createElement("h3", null, "Write a Review"),
        React.createElement(
            "div",
            { className: "review-box" },
            React.createElement("textarea", {
                placeholder: "Write about your experience...",
                value: review,
                onChange: (e) => setReview(e.target.value),
                className: "review-input"
            }),
            React.createElement(
                "button",
                { onClick: handleSubmit, className: "btn submit-btn" },
                "Submit Review"
            )
        ),
        React.createElement("h3", null, "User Reviews"),
        reviews.length > 0
            ? React.createElement(
                  "div",
                  { className: "review-list" },
                  reviews.map((r, index) =>
                      React.createElement(
                          "div",
                          { key: index, className: "review-item" },
                          React.createElement("p", { className: "user-review" }, r)
                      )
                  )
              )
            : React.createElement("p", { className: "no-reviews" }, "No reviews yet. Be the first to review!"),
        React.createElement(
            "div",
            { className: "button-group" },
            React.createElement(
                "button",
                { onClick: handleClear, className: "btn clear-btn" },
                "Clear Reviews"
            ),
            React.createElement(
                "a",
                { href: "../cityExploration/cityExploration.html", className: "btn back-btn" },
                "BACK"
            )
        )
    );
}

const rootNode = document.getElementById("root");
const root = ReactDOM.createRoot(rootNode);

root.render(
    React.createElement(
        React.Fragment,
        null,
        React.createElement(Reviews)
    )
);
