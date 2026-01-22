import { useState } from 'react';
import type { UserProfile } from '../types';
import { convertWeight } from '../utils';
import './ProfileSetup.css';

interface ProfileSetupProps {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile) => void;
}

export function ProfileSetup({ profile, onProfileChange }: ProfileSetupProps) {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [unit, setUnit] = useState<'kg' | 'lbs'>(profile?.weightUnit ?? 'kg');
  const [weightValue, setWeightValue] = useState(() => {
    if (!profile || !profile.weight) return '';
    const displayWeight = profile.weightUnit === unit
      ? profile.weight
      : convertWeight(profile.weight, 'kg', profile.weightUnit);
    return displayWeight.toFixed(1);
  });

  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === unit) return;

    const currentValue = parseFloat(weightValue);
    if (!isNaN(currentValue) && currentValue > 0) {
      const converted = convertWeight(currentValue, unit, newUnit);
      setWeightValue(converted.toFixed(1));
    }
    setUnit(newUnit);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const weight = parseFloat(weightValue);
    const validWeight = !isNaN(weight) && weight > 0 && weight <= 500;

    onProfileChange({
      name: trimmedName,
      weight: validWeight ? (unit === 'kg' ? weight : convertWeight(weight, 'lbs', 'kg')) : 0,
      weightUnit: unit,
    });
    setShowInput(false);
  };

  const displayWeight = profile && profile.weight > 0
    ? (unit === 'kg' ? profile.weight : convertWeight(profile.weight, 'kg', 'lbs')).toFixed(1)
    : null;

  const openEdit = () => {
    setName(profile?.name ?? '');
    setUnit(profile?.weightUnit ?? 'kg');
    if (profile && profile.weight > 0) {
      const displayW = profile.weightUnit === unit
        ? profile.weight
        : convertWeight(profile.weight, 'kg', profile.weightUnit);
      setWeightValue(displayW.toFixed(1));
    } else {
      setWeightValue('');
    }
    setShowInput(true);
  };

  return (
    <div className="profile-setup">
      {!showInput && !profile && (
        <button className="profile-add-btn" onClick={() => setShowInput(true)}>
          + Set up your profile
        </button>
      )}

      {!showInput && profile && (
        <div className="profile-display">
          <div className="profile-info">
            <span className="profile-name">{profile.name}</span>
            {displayWeight && (
              <span className="profile-weight">{displayWeight} {unit}</span>
            )}
          </div>
          <button className="profile-edit-btn" onClick={openEdit}>
            Edit
          </button>
        </div>
      )}

      {showInput && (
        <div className="profile-input-section">
          <div className="input-group">
            <label className="input-label">Name</label>
            <input
              type="text"
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Weight (optional)</label>
            <div className="unit-toggle">
              <button
                className={`unit-btn ${unit === 'kg' ? 'active' : ''}`}
                onClick={() => handleUnitChange('kg')}
              >
                kg
              </button>
              <button
                className={`unit-btn ${unit === 'lbs' ? 'active' : ''}`}
                onClick={() => handleUnitChange('lbs')}
              >
                lbs
              </button>
            </div>
            <input
              type="number"
              className="profile-input"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder={`Weight in ${unit}`}
              min="20"
              max="500"
              step="0.1"
            />
          </div>

          <div className="profile-actions">
            <button className="profile-save-btn" onClick={handleSave} disabled={!name.trim()}>
              Save Profile
            </button>
            <button className="profile-cancel-btn" onClick={() => setShowInput(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
