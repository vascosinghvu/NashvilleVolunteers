import React from 'react';
import Icon from './Icon';

export type ViewType = 'grid' | 'calendar';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="ViewToggle">
      <div className="ViewToggle-container" role="group" aria-label="View toggle">
        <div className={`ViewToggle-slider ${currentView === 'grid' ? 'ViewToggle-slider--left' : 'ViewToggle-slider--right'}`}></div>
        <button
          type="button"
          className={`ViewToggle-button ${currentView === 'grid' ? 'ViewToggle-button--active' : ''}`}
          onClick={() => onViewChange('grid')}
          aria-pressed={currentView === 'grid'}
        >
          <Icon glyph="th" className="Margin-right--8" />
          Grid View
        </button>
        <button
          type="button"
          className={`ViewToggle-button ${currentView === 'calendar' ? 'ViewToggle-button--active' : ''}`}
          onClick={() => onViewChange('calendar')}
          aria-pressed={currentView === 'calendar'}
        >
          <Icon glyph="calendar" className="Margin-right--8" />
          Calendar View
        </button>
      </div>
    </div>
  );
};

export default ViewToggle; 