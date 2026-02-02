import React from 'react';
import { ChecklistData } from './types';
import Section from './Section';
import { useTheme } from '../ThemeContext';

interface ChecklistProps {
  data: ChecklistData;
  onToggleItem?: (id: string) => void;
  onSelectItem?: (id: string) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ data, onToggleItem, onSelectItem }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
      }}
    >
      {/* Sections */}
      {data.sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          onToggleItem={onToggleItem}
          onSelectItem={onSelectItem}
        />
      ))}

      {/* Empty state */}
      {data.sections.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.textMuted,
            fontSize: '0.875em',
            transition: 'color 0.3s',
          }}
        >
          No checklist loaded
        </div>
      )}
    </div>
  );
};

export default Checklist;
