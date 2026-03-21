import React from "react";

function SearchBar({ city, setCity, handleSearch }) {
  return (
    <div className="search-wrapper">
      <input
        type="text"
        placeholder="Enter city..."
        value={city}
        onChange={(e) =>
          setCity(e.target.value.replace(/[^a-zA-Z ]/g, ""))
        }
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;