import React, { useState, useEffect } from 'react';
import searchIcon from './icons8-search-50.png';
import jusIcon from './iconJus.png';

function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [visibleStart, setVisibleStart] = useState(0);

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightMatch = (text, query) => {
    if (!query) return text;

    const escapedQuery = escapeRegExp(query);
    if (text.toLowerCase().startsWith(query.toLowerCase())) {
      const prefix = text.slice(0, query.length);
      const rest = text.slice(query.length);
      return `<strong>${prefix}</strong>${rest}`;
    }
    return text;
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 4) {
        setSuggestions([]);
        setHighlightedIndex(-1);
        setVisibleStart(0);
        return;
      }

      try {
        const graphqlQuery = {
          query: `
            query Autocomplete($userQuery: String!) {
              autocomplete(query: $userQuery) {
                suggestions
              }
            }
          `,
          variables: {
            userQuery: query
          }
        };

        const response = await fetch('http://localhost:5000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(graphqlQuery)
        });

        const result = await response.json();
        setSuggestions(result.data.autocomplete.suggestions || []);
        setHighlightedIndex(-1);
        setVisibleStart(0);
      } catch (error) {
        console.error('Erro na busca GraphQL:', error);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 10);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => {
        const next = Math.min(prev + 1, suggestions.length - 1);
        if (next >= visibleStart + 10) setVisibleStart(visibleStart + 1);
        return next;
      });
    }

    if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next < visibleStart) setVisibleStart(Math.max(visibleStart - 1, 0));
        return next;
      });
    }
  };

  const visibleSuggestions = suggestions.slice(visibleStart, visibleStart + 10);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
      flexDirection: 'column',
      fontFamily: "'Poppins', sans-serif",
      paddingBottom: '400px'   
    }}>
    
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img src={jusIcon} alt="Logo" style={{ width: '100px', height: '100px', marginRight: '15px' }} />
        <h2 style={{ fontSize: '4rem', fontWeight: '800', margin: 0 }}>Jus Search</h2>
      </div>

      <div style={{ position: 'relative', width: '400px' }}>
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #ccc',
      borderRadius: '25px',
      padding: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      width: '100%',
      backgroundColor: 'white'
    }}>
      <input
        type="text"
        placeholder="Digite sua busca..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: '1rem',
          paddingLeft: '10px',
          backgroundColor: 'transparent'
        }}
      />
      <img src={searchIcon} alt="Search" style={{ width: '25px', height: '25px', cursor: 'pointer' }} />
    </div>

    {query.length >= 4 && visibleSuggestions.length > 0 && (
      <ul style={{
        position: 'absolute',
        top: '55px',
        left: '0',
        width: '100%',
        border: '1px solid #ccc',
        backgroundColor: 'white',
        padding: '10px 0',
        marginTop: '5px',
        listStyle: 'none',
        maxHeight: '250px',
        overflowY: 'auto',
        textAlign: 'left',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        zIndex: 1000
      }}>
        {visibleSuggestions.map((sug, index) => {
          const absoluteIndex = visibleStart + index;
          const isHighlighted = absoluteIndex === highlightedIndex;

          return (
            <li
              key={absoluteIndex}
              onMouseEnter={() => setHighlightedIndex(absoluteIndex)}
              onTouchStart={() => setHighlightedIndex(absoluteIndex)}
              onClick={() => setQuery(sug)}
              style={{
                padding: '8px 16px',
                backgroundColor: isHighlighted ? '#f0f0f0' : 'transparent',
                cursor: 'pointer'
              }}
              dangerouslySetInnerHTML={{ __html: highlightMatch(sug, query) }}
            ></li>
          );
        })}
      </ul>
    )}
  </div>

    </div>
  );
}

export default App;
