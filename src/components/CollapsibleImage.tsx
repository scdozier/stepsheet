import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';

interface CollapsibleImageProps {
  src: string;
  alt: string;
  basePath?: string; // Base path for resolving relative URLs
}

const CollapsibleImage: React.FC<CollapsibleImageProps> = ({ src, alt, basePath }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Resolve the image source
  // If it's a relative path and we have a basePath, resolve it
  const resolvedSrc = React.useMemo(() => {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    if (basePath) {
      // Handle relative paths
      const baseDir = basePath.replace(/[^/\\]*$/, '');
      return `file://${baseDir}${src}`;
    }
    return src;
  }, [src, basePath]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    setIsExpanded(!isExpanded);
  };

  if (hasError) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.textMuted,
          backgroundColor: theme.colors.hoverBg,
          borderRadius: 4,
          cursor: 'default',
          transition: 'color 0.3s, background-color 0.3s',
        }}
      >
        <span>🖼️</span>
        <span>{alt || 'Image failed to load'}</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        marginTop: 8,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {isExpanded ? (
        // Expanded view - full image
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
            transition: 'border-color 0.3s, background-color 0.3s',
          }}
        >
          <img
            src={resolvedSrc}
            alt={alt}
            onError={() => setHasError(true)}
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              transition: 'opacity 0.2s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              padding: '2px 6px',
              fontSize: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 4,
            }}
          >
            Click to collapse
          </div>
        </div>
      ) : (
        // Collapsed view - thumbnail/placeholder
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            backgroundColor: theme.colors.hoverBg,
            borderRadius: 6,
            border: `1px solid ${theme.colors.border}`,
            transition: 'all 0.15s ease',
          }}
        >
          {/* Thumbnail preview */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
              flexShrink: 0,
            }}
          >
            <img
              src={resolvedSrc}
              alt={alt}
              onError={() => setHasError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s',
            }}
          >
            {alt || 'Image'}
          </span>
          <span
            style={{
              fontSize: 10,
              color: theme.colors.textMuted,
              transition: 'color 0.3s',
            }}
          >
            Click to expand
          </span>
        </div>
      )}
    </div>
  );
};

export default CollapsibleImage;
