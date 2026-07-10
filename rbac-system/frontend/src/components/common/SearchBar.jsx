import { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`search-bar ${focused ? 'focused' : ''}`}>
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={placeholder}
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => { onChange(''); onClear?.(); }}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
