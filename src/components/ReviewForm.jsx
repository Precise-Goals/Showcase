// src/components/ReviewForm.js
import React, { useState } from "react";
import { Star, User } from "lucide-react";
import "../pages/reviews.css";

const ReviewForm = ({ onReviewSubmit, reviewCount }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    description: "",
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      user: <User size={48} className="avatar-placeholder" />,
      date: new Date().toISOString().split("T")[0],
      rating: 0,
      ...prev,
      reviewCount: 0,
      onReviewSubmit: () => {},
      isSubmitting: false,
      initialReviews: [],
      currentIndex: 0,
      initialIndex: 0,
      goToSlide: () => {},
      getCardClass: () => "",
      nextSlide: () => {},
      prevSlide: () => {},
      reviews: [],
      setCurrentIndex: () => {},
      handleReviewSubmit: () => {},
      initialReviewsLength: 0,
      handleRatingChange: (rating) => {
        setFormData((prev) => ({
          ...prev,
          rating,
        }));
      },
      getRandomAvatar: () => {
        return Math.floor(Math.random() * 6) + 1;
      },
      handleSubmit: async (e) => {
        e.preventDefault();
        if (
          !formData.username ||
          !formData.email ||
          !formData.description ||
          !formData.rating
        ) {
          alert("Please fill in all fields and provide a rating");
          return;
        }

        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newReview = {
          id: reviewCount + 1,
          username: formData.username,
          email: formData.email,
          description: formData.description,
          rating: formData.rating,
          avatar: getRandomAvatar(),
          date: new Date().toISOString().split("T")[0],
        };

        onReviewSubmit(newReview);
        setFormData({
          username: "",
          email: "",
          description: "",
          rating: 0,
        });
        setIsSubmitting(false);
        alert("Review submitted successfully!");
      },
      renderStars: (rating, interactive = false, onStarClick = null) => {
        return Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`star ${index < rating ? "filled" : "empty"} ${
              interactive ? "interactive" : ""
            }`}
            onClick={interactive ? () => onStarClick(index + 1) : undefined}
          />
        ));
      },
      ...prev,
      name: value,
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const getRandomAvatar = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.username ||
      !formData.email ||
      !formData.description ||
      formData.rating === 0
    ) {
      alert("Please fill in all fields and provide a rating");
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newReview = {
      id: reviewCount + 1,
      username: formData.username,
      email: formData.email,
      description: formData.description,
      rating: formData.rating,
      avatar: getRandomAvatar(),
      date: new Date().toISOString().split("T")[0],
    };

    onReviewSubmit(newReview);
    setFormData({
      username: "",
      email: "",
      description: "",
      rating: 0,
    });
    setIsSubmitting(false);
    alert("Review submitted successfully!");
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star ${index < rating ? "filled" : "empty"} ${
          interactive ? "interactive" : ""
        }`}
        onClick={interactive ? () => onStarClick(index + 1) : undefined}
      />
    ));
  };

  return (
    <div className="form-container">
      <h2>Leave a Review</h2>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Review Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Share your experience with us..."
            required
          />
        </div>
        <div className="form-group">
          <label>Rating * ({formData.rating}/5)</label>
          <div className="rating-input">
            {renderStars(formData.rating, true, handleRatingChange)}
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
