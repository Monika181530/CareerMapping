import React, { useState, useEffect, useRef, useMemo } from 'react';
import { searchColleges, COLLEGES_DATA } from '../data/colleges';
import { GraduationCap, MapPin, Building, Check, Sparkles, X } from 'lucide-react';

export default function CollegeAutocomplete({
  value = '',
  onChange,
  placeholder = 'e.g. Bannari Amman Institute of Technology',
  id = 'institution-input',
  className = 'form-input'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [onlineResults, setOnlineResults] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // 1. Instant local search from curated database
  const localRecommendations = useMemo(() => {
    return searchColleges(value, 8);
  }, [value]);

  // 2. Fallback / supplementary online search for international / all global universities
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingOnline(true);
        const res = await fetch(`https://universities.hipolabs.com/search?name=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          // Map to standard college format
          const formatted = data.slice(0, 5).map(item => ({
            name: item.name,
            shortName: item.alpha_two_code || '',
            location: `${item['state-province'] ? item['state-province'] + ', ' : ''}${item.country}`,
            type: 'University',
            isOnlineResult: true
          }));
          setOnlineResults(formatted);
        }
      } catch (err) {
        // Silently ignore network failures for online fallback
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [value]);

  // Combined unique recommendations
  const allRecommendations = useMemo(() => {
    const seen = new Set();
    const list = [];

    // Add local results first (highest quality & relevant)
    for (const c of localRecommendations) {
      const key = c.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(c);
      }
    }

    // Merge online results if not already present
    for (const c of onlineResults) {
      const key = c.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(c);
      }
    }

    return list.slice(0, 10);
  }, [localRecommendations, onlineResults]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (collegeName) => {
    if (onChange) {
      onChange(collegeName);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allRecommendations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allRecommendations.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < allRecommendations.length) {
        e.preventDefault();
        handleSelect(allRecommendations[selectedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll selected item into view inside the dropdown list
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={className}
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            paddingRight: value ? '36px' : '14px',
            width: '100%'
          }}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              if (onChange) onChange('');
              inputRef.current?.focus();
            }}
            title="Clear"
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Recommendations Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
            zIndex: 1000,
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '6px'
          }}
        >
          {/* Header indicator */}
          <div
            style={{
              padding: '6px 12px 8px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary, #475569)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border, #e2e8f0)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="var(--accent, #3b82f6)" />
              Recommended Institutions & Colleges
            </span>
            {isSearchingOnline && (
              <span style={{ fontSize: '10px', color: 'var(--accent, #3b82f6)' }}>
                Searching global directory...
              </span>
            )}
          </div>

          {allRecommendations.length > 0 ? (
            allRecommendations.map((college, idx) => {
              const isSelected = idx === selectedIndex;
              const isExactMatch = value.trim().toLowerCase() === college.name.toLowerCase();

              return (
                <div
                  key={`${college.name}-${idx}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(college.name)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'background 0.15s ease',
                    background: isSelected
                      ? 'var(--surface-3, #e2e8f0)'
                      : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent, #3b82f6)' : '3px solid transparent'
                  }}
                >
                  <div
                    style={{
                      marginTop: '2px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      padding: '6px',
                      borderRadius: '6px',
                      color: 'var(--accent, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <GraduationCap size={16} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #0f172a)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span>{college.name}</span>
                      {college.shortName && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'var(--surface-2, #f8fafc)',
                            border: '1px solid var(--border, #e2e8f0)',
                            color: 'var(--text-secondary, #475569)',
                            fontWeight: 500
                          }}
                        >
                          {college.shortName}
                        </span>
                      )}
                      {isExactMatch && (
                        <Check size={14} color="#10b981" style={{ marginLeft: 'auto' }} />
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #475569)',
                        marginTop: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {college.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {college.location}
                        </span>
                      )}
                      {college.type && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Building size={12} />
                          {college.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '16px 12px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-secondary, #475569)'
              }}
            >
              No institution found in directory. You can keep typing your custom college name above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
