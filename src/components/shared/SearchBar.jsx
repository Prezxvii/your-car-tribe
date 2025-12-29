import React, { useState } from 'react';
import { Search, HelpCircle } from 'lucide-react';

const FAQSearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to send 'query' to the Admin Dashboard database
    alert("Your question has been sent to our team to help build our FAQ!");
    setQuery("");
  };

  return (
    <div className="faq-search-container">
      <div className="faq-intro">
        <HelpCircle size={40} color="var(--primary-blue)" />
        <h2>Ask the Tribe</h2>
        <p>We're building our FAQ based on your actual questions. Ask anything below.</p>
      </div>
      <form onSubmit={handleSubmit} className="faq-form">
        <input 
          type="text" 
          placeholder="What do you need to know about cars or the community?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit"><Search size={20} /></button>
      </form>
    </div>
  );
};

export default FAQSearchBar;