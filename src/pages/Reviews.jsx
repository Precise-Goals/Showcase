import React, { useState } from "react";
import "./reviews.css";

const dummyReviews = [
  {
    id: 1,
    username: "Rajesh Sharma",
    description:
      "As a Senior Data Scientist, I found the platform extremely useful in streamlining workflows and improving model deployment efficiency.",
    email: "rajesh.sharma@datainsights.in",
    rating: 5,
    avatar: "/1.png", // male
  },
  {
    id: 2,
    username: "Priya Nair",
    description:
      "The analytics dashboard provided valuable insights. As a Data Analyst, I could derive patterns quickly and present them to stakeholders effectively.",
    email: "priya.nair@analyticspro.in",
    rating: 4,
    avatar: "/2.png", // female
  },
  {
    id: 3,
    username: "Ananya Gupta",
    description:
      "User-friendly interface with powerful data visualization features. Perfect for data storytelling and client presentations.",
    email: "ananya.gupta@datasolutions.in",
    rating: 5,
    avatar: "/3.png", // female
  },
  {
    id: 4,
    username: "Shreya Iyer",
    description:
      "Good experience overall. The automation features saved me a lot of manual effort in cleaning and preparing datasets.",
    email: "shreya.iyer@insightlabs.in",
    rating: 4,
    avatar: "/4.png", // female
  },
  {
    id: 5,
    username: "Amit Verma",
    description:
      "Efficient and reliable tool for large-scale data processing. It definitely enhanced the productivity of my data science team.",
    email: "amit.verma@predictiveai.in",
    rating: 5,
    avatar: "/5.png", // male
  },
  {
    id: 6,
    username: "Karan Malhotra",
    description:
      "The integration with machine learning pipelines was seamless. Great platform for experimenting with new models.",
    email: "karan.malhotra@mlhub.in",
    rating: 4,
    avatar: "/6.png", // male
  },
  {
    id: 7,
    username: "Neha Reddy",
    description:
      "Clean UI and smooth navigation. As a data analyst, I could focus more on insights rather than struggling with tools.",
    email: "neha.reddy@dataworks.in",
    rating: 5,
    avatar: "/2.png", // female
  },
  
];

const Reviews = () => {
  const [reviews, setReviews] = useState(dummyReviews);
  const [formData, setFormData] = useState({
    username: "",
    description: "",
    email: "",
    rating: 0,
    avatar: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomAvatar =
      formData.username.toLowerCase().includes("a") ||
      formData.username.toLowerCase().includes("e")
        ? `/2.png` // just pick one female avatar for demo
        : `/1.png`; // pick one male avatar for demo

    const newReview = {
      id: reviews.length + 1,
      ...formData,
      avatar: randomAvatar,
    };

    setReviews([...reviews, newReview]);
    setFormData({
      username: "",
      description: "",
      email: "",
      rating: 0,
      avatar: "",
    });
  };

  return (
    <div className="reviews">
      <h1>Our Reviews</h1>

      <div className="carousel">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <img
              src={"avatars/" + review.avatar}
              alt={review.username}
              className="avatar"
            />
            <h3>{review.username}</h3>
            <p>{review.description}</p>
            <p>Email: {review.email}</p>
            <p>Rating: {"⭐".repeat(review.rating)}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <input
          type="text"
          placeholder="Your Name"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <textarea
          placeholder="Your Review"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
        <input
          type="number"
          placeholder="Rating (1-5)"
          min="1"
          max="5"
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
