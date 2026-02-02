import React, { useState } from 'react';
import { SectionData } from './types';
import ChecklistItem from './ChecklistItem';
import { useTheme } from '../ThemeContext';

interface SectionProps {
  section: SectionData;
  onToggleItem?: (id: string) => void;
  onSelectItem?: (id: string) => void;
}

const Section: React.FC<SectionProps> = ({ section, onToggleItem, onSelectItem }) => {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(section.isCollapsed ?? false);

  const completedCount = section.items.filter((item) => item.isCompleted).length;
  const totalCount = section.items.length;

  return (
    <div
      style={{
        marginBottom: 8,
      }}
    >
      {/* Section Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          cursor: 'pointer',
          borderRadius: 8,
          backgroundColor: theme.colors.sectionBg,
          transition: 'background-color 0.2s',
        }}
      >
        {/* Chevron */}
        <div
          style={{
            marginRight: 10,
            transition: 'transform 0.2s',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke={theme.colors.textMuted}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: '0.8125em',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            flex: 1,
            transition: 'color 0.3s',
          }}
        >
          {section.title}
        </span>

        {/* Progress indicator */}
        <span
          style={{
            fontSize: '0.6875em',
            color: theme.colors.textMuted,
            marginLeft: 8,
            transition: 'color 0.3s',
          }}
        >
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Items */}
      {!isCollapsed && (
        <div
          style={{
            padding: '8px 4px 4px 4px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {section.items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Section;
