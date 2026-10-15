import React, { useState, useEffect, useRef, useMemo } from 'react';
import { searchDepartments, DEPARTMENTS_DATA } from '../data/departments';
import { BookOpen, Check, Sparkles, X, Layers } from 'lucide-react';

export default function DepartmentAutocomplete({
  value = '',
  onChange,
  placeholder = 'e.g. Computer Science and Engineering / IT',
  id = 'specialization-input',
  className = 'form-input'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Recommendations filtered by query
  const recommendations = useMemo(() => {
    return searchDepartments(value, 8);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (deptName) => {
    if (onChange) {
      onChange(deptName);
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
      setSelectedIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : recommendations.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < recommendations.length) {
        e.preventDefault();
        handleSelect(recommendations[selectedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Auto-scroll selected item into view
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
            maxHeight: '300px',
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
              Recommended Departments & Majors
            </span>
          </div>

          {recommendations.length > 0 ? (
            recommendations.map((dept, idx) => {
              const isSelected = idx === selectedIndex;
              const isExactMatch = value.trim().toLowerCase() === dept.name.toLowerCase();

              return (
                <div
                  key={`${dept.name}-${idx}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(dept.name)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background 0.15s ease',
                    background: isSelected
                      ? 'var(--surface-3, #f1f5f9)'
                      : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent, #3b82f6)' : '3px solid transparent'
                  }}
                >
                  <div
                    style={{
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
                    <BookOpen size={15} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #0f172a)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span>{dept.name}</span>
                      {dept.code && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'var(--surface-2, #f8fafc)',
                            border: '1px solid var(--border, #e2e8f0)',
                            color: 'var(--accent, #3b82f6)',
                            fontWeight: 700
                          }}
                        >
                          {dept.code}
                        </span>
                      )}
                      {isExactMatch && (
                        <Check size={14} color="#10b981" style={{ marginLeft: 'auto' }} />
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary, #475569)',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Layers size={11} />
                      <span>{dept.category}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '14px 12px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-secondary, #475569)'
              }}
            >
              No standard department found. You can keep your custom department name above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
