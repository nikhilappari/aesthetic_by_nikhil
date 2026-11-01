import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './LikeButton.css';

const LikeButton = ({ artworkId, initialLikes = 0, className = '', onLikesChange }) => {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setLikes(initialLikes || 0);
  }, [initialLikes]);

  useEffect(() => {
    try {
      const storedLikes = JSON.parse(localStorage.getItem('aesthetic_liked_artworks') || '[]');
      setIsLiked(storedLikes.includes(artworkId));
    } catch (e) {
      setIsLiked(false);
    }
  }, [artworkId]);

  const handleToggleLike = async (e) => {
    e.stopPropagation(); // Prevent opening image modal on card click

    const nextState = !isLiked;
    const delta = nextState ? 1 : -1;
    const newCount = Math.max(0, likes + delta);

    setIsLiked(nextState);
    setLikes(newCount);
    if (nextState) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }

    if (onLikesChange) {
      onLikesChange(newCount);
    }

    // Persist in localStorage
    try {
      const storedLikes = JSON.parse(localStorage.getItem('aesthetic_liked_artworks') || '[]');
      let updated;
      if (nextState) {
        updated = Array.from(new Set([...storedLikes, artworkId]));
      } else {
        updated = storedLikes.filter(id => id !== artworkId);
      }
      localStorage.setItem('aesthetic_liked_artworks', JSON.stringify(updated));
    } catch (e) {}

    // Call backend API
    try {
      const res = await api.toggleLikeArtwork(artworkId, nextState ? 'like' : 'unlike');
      if (res?.success && typeof res.likes === 'number') {
        setLikes(res.likes);
        if (onLikesChange) onLikesChange(res.likes);
      }
    } catch (err) {
      console.warn('Failed to sync like with backend:', err.message);
    }
  };

  return (
    <button 
      type="button"
      className={`like-button ${isLiked ? 'liked' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
      onClick={handleToggleLike}
      title={isLiked ? "Unlike sketch" : "Like this sketch"}
      aria-label={`${likes} likes. ${isLiked ? 'Unlike' : 'Like'} this sketch`}
    >
      <svg 
        className="like-heart-icon" 
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span className="like-count">{likes}</span>
    </button>
  );
};

export default LikeButton;
