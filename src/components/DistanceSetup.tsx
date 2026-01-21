import { useState } from 'react';
import { getDistancePresets } from '../utils';
import './DistanceSetup.css';

interface DistanceSetupProps {
  lapDistance: number;
  onDistanceChange: (distance: number) => void;
  disabled: boolean;
}

export function DistanceSetup({ lapDistance, onDistanceChange, disabled }: DistanceSetupProps) {
  const [customValue, setCustomValue] = useState(lapDistance.toString());
  const [showCustom, setShowCustom] = useState(false);
  const presets = getDistancePresets();

  const handlePresetClick = (meters: number) => {
    onDistanceChange(meters);
    setCustomValue(meters.toString());
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    const value = parseInt(customValue, 10);
    if (value > 0 && value <= 2000) {
      onDistanceChange(value);
      setShowCustom(false);
    }
  };

  return (
    <div className={`distance-setup ${disabled ? 'disabled' : ''}`}>
      <div className="distance-header">
        <span className="distance-label">Lap Distance</span>
        <span className="distance-current">{lapDistance}m</span>
      </div>

      {!disabled && (
        <>
          <div className="distance-presets">
            {presets.map((preset) => (
              <button
                key={preset.meters}
                className={`preset-btn ${lapDistance === preset.meters ? 'active' : ''}`}
                onClick={() => handlePresetClick(preset.meters)}
              >
                {preset.label}
              </button>
            ))}
            <button
              className={`preset-btn custom ${showCustom ? 'active' : ''}`}
              onClick={() => setShowCustom(!showCustom)}
            >
              Custom
            </button>
          </div>

          {showCustom && (
            <div className="custom-input-container">
              <input
                type="number"
                className="custom-input"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Enter distance in meters"
                min="1"
                max="2000"
              />
              <button className="custom-submit" onClick={handleCustomSubmit}>
                Set
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
