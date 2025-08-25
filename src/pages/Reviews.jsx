import React, { useState, useEffect } from "react";
import "./reviews.css";
import { datab } from "../firebase/config"; // adjust path
import { ref, get, push, set } from "firebase/database";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    rating: 5,
  });

  // Fetch reviews one-time on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = ref(datab, "reviews");
        const snapshot = await get(reviewsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const reviewsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setReviews(reviewsArray);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const nextReview = () => {
    if (reviews.length > 0) {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }
  };

  const prevReview = () => {
    if (reviews.length > 0) {
      setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewsRef = ref(datab, "reviews");
      const newReviewRef = push(reviewsRef);
      await set(newReviewRef, {
        ...formData,
        createdAt: Date.now(),
      });

      // re-fetch reviews after adding
      const snapshot = await get(reviewsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const updatedReviews = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setReviews(updatedReviews);
        setCurrent(updatedReviews.length - 1); // move to newest
      }

      setFormData({ name: "", text: "", rating: 5 });
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const renderStars = (count) => {
    return "★".repeat(count) + "☆".repeat(5 - count);
  };

  return (
    <div className="reviews-container">
      {reviews.length > 0 ? (
        <div className="review-card">
          <div className="review-stars">
            {renderStars(reviews[current].rating)}
          </div>
          <p className="review-text">"{reviews[current].text}"</p>
          <h4 className="review-author">- {reviews[current].name}</h4>
        </div>
      ) : (
        <p>No reviews yet. Be the first to add one!</p>
      )}

      {reviews.length > 1 && (
        <div className="review-buttons">
          <button onClick={prevReview}>◀</button>
          <button onClick={nextReview}>▶</button>
        </div>
      )}

      <form className="review-form" onSubmit={handleSubmit}>
        <h3>Add Your Review</h3>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="text"
          placeholder="Your review"
          value={formData.text}
          onChange={handleChange}
          required
        />
        <label>
          Rating:
          <select name="rating" value={formData.rating} onChange={handleChange}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}
