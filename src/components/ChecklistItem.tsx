import React from 'react';
import { ChecklistItemData } from './types';
import CollapsibleImage from './CollapsibleImage';
import { useTheme } from '../ThemeContext';

interface ChecklistItemProps {
  item: ChecklistItemData;
  depth?: number;
  onToggle?: (id: string) => void;
  onSelect?: (id: string) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, depth = 0, onToggle, onSelect }) => {
  const { theme } = useTheme();
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    onSelect?.(item.id);
    onToggle?.(item.id);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Connecting line for nested items */}
      {depth > 0 && (
        <div
          style={{
            position: 'absolute',
            left: -12,
            top: 0,
            bottom: hasChildren ? '50%' : 0,
            width: 1,
            backgroundColor: theme.colors.borderLight,
          }}
        />
      )}
      {depth > 0 && (
        <div
          style={{
            position: 'absolute',
            left: -12,
            top: '50%',
            width: 12,
            height: 1,
            backgroundColor: theme.colors.borderLight,
          }}
        />
      )}

      {/* Main item row */}
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '6px 8px',
          marginLeft: depth * 20,
          borderRadius: 6,
          cursor: 'pointer',
          opacity: item.isCompleted ? 0.6 : 1,
          transition: 'background-color 0.15s, opacity 0.15s',
          borderLeft: item.isActive
            ? `3px solid ${theme.colors.activeBorder}`
            : '3px solid transparent',
          backgroundColor: item.isActive ? theme.colors.activeBg : 'transparent',
        }}
      >
        {/* Checkbox */}
        <div
          style={{
            width: 18,
            height: 18,
            marginRight: 10,
            marginTop: 1,
            borderRadius: 4,
            border: item.isCompleted ? 'none' : `2px solid ${theme.colors.textMuted}`,
            backgroundColor: item.isCompleted ? theme.colors.checkmark : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {item.isCompleted && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Text */}
        <span
          style={{
            fontSize: '0.875em',
            lineHeight: 1.43,
            color: item.isCompleted ? theme.colors.textCompleted : theme.colors.textPrimary,
            textDecoration: item.isCompleted ? 'line-through' : 'none',
            flex: 1,
            transition: 'color 0.3s',
          }}
        >
          {item.text}
        </span>
      </div>

      {/* Image (if present) */}
      {item.image && (
        <div style={{ marginLeft: depth * 20 + 28, paddingRight: 8 }}>
          <CollapsibleImage src={item.image.src} alt={item.image.alt} />
        </div>
      )}

      {/* Children */}
      {hasChildren && (
        <div style={{ position: 'relative' }}>
          {item.children!.map((child) => (
            <ChecklistItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistItem;
