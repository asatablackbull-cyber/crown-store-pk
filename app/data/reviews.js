export const productReviews = {
  'yin-yang-bead-bracelet-set': [
    { name: 'Usman Tariq', location: 'Peshawar', initials: 'UT', rating: 5, text: 'Bought the matching set for me and my wife. The beads have held up great — no fading, no smell, the waterproof claim is real.' },
    { name: 'Fatima Noor', location: 'Karachi', initials: 'FN', rating: 5, text: 'Elegant and simple. I wear it daily including in the shower, zero issues after 2 months.' },
    { name: 'Kamran Sultan', location: 'Sialkot', initials: 'KS', rating: 4, text: 'Good quality beads, elastic could be slightly tighter but overall happy with the purchase.' },
  ],
  'royal-mesh-bracelet-ring-set': [
    { name: 'Mahnoor Aslam', location: 'Islamabad', initials: 'MA', rating: 5, text: 'Got this for my fiancé, he wears it to work every day. The gold plating hasn’t faded at all.' },
    { name: 'Adeel Chaudhry', location: 'Gujranwala', initials: 'AC', rating: 5, text: 'Premium feel for the price. The ring size runs true — ordered based on their size chart and it fit perfectly.' },
    { name: 'Sadia Baig', location: 'Lahore', initials: 'SB', rating: 4, text: 'Beautiful set, arrived well packaged. Took 4 days to deliver to Lahore but worth the wait.' },
  ],
  'crown-crest-open-bangle': [
    { name: 'Waqas Anjum', location: 'Multan', initials: 'WA', rating: 5, text: 'The open-cuff design makes it so easy to adjust. Wore it during a workout and it stayed spotless.' },
    { name: 'Hira Farooq', location: 'Hyderabad', initials: 'HF', rating: 5, text: 'Statement piece, gets compliments every time I wear it. The steel feels solid, not flimsy at all.' },
    { name: 'Junaid Malik', location: 'Quetta', initials: 'JM', rating: 4, text: 'Good product, matches the pictures exactly. Delivery to Quetta took about a week.' },
  ],
  'crown-signet-mesh-ring': [
    { name: 'Rabia Yousaf', location: 'Faisalabad', initials: 'RY', rating: 5, text: 'Subtle and elegant, exactly what I wanted for everyday wear. Hasn’t tarnished after a month of wear.' },
    { name: 'Tariq Mehmood', location: 'Rawalpindi', initials: 'TM', rating: 5, text: 'Comfortable fit, true to size. Cash on Delivery made ordering risk-free.' },
    { name: 'Nida Aziz', location: 'Sargodha', initials: 'NA', rating: 4, text: 'Nice ring, good value. Wish there were more size options between 8 and 9.' },
  ],
};

export function getProductReviews(slug) {
  return productReviews[slug] || [];
}

export function getAverageRating(slug) {
  const reviews = getProductReviews(slug);
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  return { average: (sum / reviews.length).toFixed(1), count: reviews.length };
}
