// src/components/ReviewCarousel.js
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import "../pages/reviews.css";

const ReviewCard = ({ review }) => {
  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star ${index < rating ? "filled" : "empty"}`}
      />
    ));

  return (
    <div className="review-card">
      <div className="review-header">
        <img
          src={`/avatars/${review.avatar}.png`}
          alt={review.username}
          className="avatar"
        />
        <div className="user-info">
          <h3>{review.username}</h3>
          <div className="rating-date">
            <div className="stars">{renderStars(review.rating)}</div>
            <span className="date">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="review-text">{review.description}</p>
    </div>
  );
};

const ReviewCarousel = ({ reviews }) => {
  const initialIndex = Math.floor(reviews.length / 2);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const getCardClass = (index) => {
    const position = (index - currentIndex + reviews.length) % reviews.length;

    if (position === 0) return "carousel-card center";
    if (position === 1 || position === reviews.length - 1)
      return "carousel-card side";
    if (position === 2 || position === reviews.length - 2)
      return "carousel-card edge";
    return "carousel-card hidden";
  };

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        {reviews.map((review, index) => (
          <div key={review.id} className={getCardClass(index)}>
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
      <button onClick={prevSlide} className="nav-arrow left">
        <ChevronLeft />
      </button>
      <button onClick={nextSlide} className="nav-arrow right">
        <ChevronRight />
      </button>
      <div className="dots-container">
        {reviews.map((review, index) => (
          <button
            key={review.id}
            onClick={() => goToSlide(index)}
            className={`dot ${index === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCarousel;
