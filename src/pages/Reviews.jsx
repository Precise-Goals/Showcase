import React, { useEffect, useState } from "react";
import "./reviews.css";
import { db } from "../firebase/config";
import { ref, push, onValue } from "firebase/database";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    description: "",
    email: "",
    rating: 0,
  });

  // Fetch reviews from realtime db
  useEffect(() => {
    const reviewsRef = ref(db, "reviews");
    onValue(reviewsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setReviews(loaded);
      }
    });
  }, []);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const reviewsRef = ref(db, "reviews");
    const newReview = {
      ...formData,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
      createdAt: Date.now(),
    };
    push(reviewsRef, newReview);
    setFormData({ username: "", description: "", email: "", rating: 0 });
  };

  // Add dummy reviews button
  const handleAddDummy = () => {
    const reviewsRef = ref(db, "reviews");
    const dummy = {
      username: "John Doe",
      description: "Great platform! Really helped me grow.",
      email: "john@example.com",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe",
      createdAt: Date.now(),
    };
    push(reviewsRef, dummy);
  };

  return (
    <div className="reviews">
      <h1>Our Reviews</h1>

      {/* Dummy button */}
      <button onClick={handleAddDummy}>Add Dummy Review</button>

      {/* Carousel of reviews */}
      <div className="carousel">
        {reviews.map((review) => (
          <div className="card" key={review.id}>
            <img src={review.avatar} alt={review.username} className="avatar" />
            <h3>{review.username}</h3>
            <p>{review.description}</p>
            <p>{review.email}</p>
            <p>⭐ {review.rating}/5</p>
          </div>
        ))}
      </div>

      {/* Form for adding review */}
      <form className="review-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
        <input
          type="number"
          min="1"
          max="5"
          placeholder="Rating (1-5)"
          value={formData.rating}
          onChange={(e) =>
            setFormData({ ...formData, rating: Number(e.target.value) })
          }
          required
        />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default Reviews;
