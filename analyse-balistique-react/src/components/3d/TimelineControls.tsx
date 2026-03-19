import { useCallback, useMemo } from 'react';
import type { DenseSimulationResult } from '../../lib/ballistics-sim';
import type { SimulationTimeState } from './RealisticSimulationMode';
import { pelletMassFromDiameter } from '../../lib/ballistics-sim';
import type { BallisticParams } from '../../lib/ballistics-sim';

interface TimelineControlsProps {
  timeState: SimulationTimeState;
  denseSim: DenseSimulationResult | null;
  ballisticParams: BallisticParams | null;
  distanceM: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onTimeChange: (t: number) => void;
  onSpeedChange: (speed: number) => void;
}

// ─── Clean color palette for HUD ────────────────────────────
const HUD = {
  bg:           'rgba(20, 24, 32, 0.92)',   // fond sombre translucide
  bgGradient:   'linear-gradient(transparent, rgba(20, 24, 32, 0.95) 25%)',
  text:         '#e2e8f0',                   // texte principal — blanc doux
  textMuted:    '#7a8194',                   // texte secondaire — gris moyen
  textDim:      '#4e5568',                   // labels très discrets

  // Stat badge colors — pastels lisibles
  time:         '#93c5fd',    // bleu ciel clair
  speedGood:    '#6ee7b7',    // vert menthe
  speedMid:     '#fcd34d',    // jaune doux
  speedLow:     '#fca5a5',    // rose saumon
  energy:       '#c4b5fd',    // lavande
  spread:       '#fdba74',    // pêche
  distance:     '#93c5fd',    // bleu ciel
  impacts:      '#6ee7b7',    // vert menthe

  // Slider
  trackBg:      '#1e2130',
  progressFrom: '#60a5fa',    // bleu
  progressTo:   '#a78bfa',    // violet
  impactMark:   '#f87171',    // rouge clair

  // Buttons
  btnActive:    'rgba(96, 165, 250, 0.15)',
  btnActiveText:'#93c5fd',
};

const SPEED_PRESETS = [
  { label: '1000×', speed: 0.001, desc: 'Ultra slow-mo' },
  { label: '100×', speed: 0.01, desc: 'Slow-motion' },
  { label: '10×', speed: 0.1, desc: 'Ralenti' },
  { label: '1×', speed: 1, desc: 'Temps réel' },
];

export function TimelineControls({
  timeState,
  denseSim,
  ballisticParams,
  distanceM,
  onPlay,
  onPause,
  onReset,
  onTimeChange,
  onSpeedChange,
}: TimelineControlsProps) {
  const maxTime = denseSim ? denseSim.maxFlightTime * 1.2 : 0.2;
  const timeMs = timeState.currentTime * 1000;
  const progress = maxTime > 0 ? timeState.currentTime / maxTime : 0;

  const params = ballisticParams ?? {
    muzzleVelocity: 400,
    dragCoefficient: 0.47,
    pelletDiameterMm: 3.0,
    pelletMassGrams: 0,
    barrelDiameterMm: 18.5,
  };

  const liveStats = useMemo(() => {
    if (!denseSim || timeState.currentTime <= 0) {
      return {
        avgSpeed: params.muzzleVelocity,
        avgEnergy: 0,
        spreadCm: 0,
        distanceTraveled: 0,
        pelletsArrived: 0,
      };
    }

    const massKg = params.pelletMassGrams > 0
      ? params.pelletMassGrams / 1000
      : pelletMassFromDiameter(params.pelletDiameterMm);

    let totalSpeed = 0;
    let totalEnergy = 0;
    let maxLateral = 0;
    let meanZ = 0;
    let active = 0;
    let arrived = 0;

    for (const pellet of denseSim.pellets) {
      if (timeState.currentTime >= pellet.flightTime) {
        arrived++;
        totalSpeed += pellet.impactVelocity;
        totalEnergy += pellet.energyJoules;
        continue;
      }

      const pts = pellet.points;
      for (let j = 0; j < pts.length - 1; j++) {
        if (pts[j + 1].t >= timeState.currentTime) {
          const frac = (timeState.currentTime - pts[j].t) / (pts[j + 1].t - pts[j].t);
          const speed = pts[j].speed + (pts[j + 1].speed - pts[j].speed) * frac;
          const x = pts[j].x + (pts[j + 1].x - pts[j].x) * frac;
          const y = pts[j].y + (pts[j + 1].y - pts[j].y) * frac;
          const z = pts[j].z + (pts[j + 1].z - pts[j].z) * frac;

          totalSpeed += speed;
          totalEnergy += 0.5 * massKg * speed * speed;
          const lateral = Math.sqrt(x * x + y * y) * 100;
          if (lateral > maxLateral) maxLateral = lateral;
          meanZ += z;
          active++;
          break;
        }
      }
    }

    const totalActive = active + arrived;
    return {
      avgSpeed: totalActive > 0 ? totalSpeed / totalActive : 0,
      avgEnergy: totalActive > 0 ? totalEnergy / totalActive : 0,
      spreadCm: maxLateral * 2,
      distanceTraveled: active > 0 ? meanZ / active : distanceM,
      pelletsArrived: arrived,
    };
  }, [denseSim, timeState.currentTime, params, distanceM]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(parseFloat(e.target.value) * maxTime);
  }, [onTimeChange, maxTime]);

  // Speed color
  const speedColor = liveStats.avgSpeed > params.muzzleVelocity * 0.7
    ? HUD.speedGood
    : liveStats.avgSpeed > params.muzzleVelocity * 0.4
    ? HUD.speedMid
    : HUD.speedLow;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: HUD.bgGradient,
      padding: '28px 16px 12px',
      zIndex: 10,
    }}>
      {/* HUD Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 28,
        marginBottom: 10, flexWrap: 'wrap',
      }}>
        <StatBadge label="Temps" value={`${timeMs.toFixed(1)} ms`} color={HUD.time} />
        <StatBadge label="Vitesse moy" value={`${liveStats.avgSpeed.toFixed(0)} m/s`} color={speedColor} />
        <StatBadge label="Énergie moy" value={`${liveStats.avgEnergy.toFixed(2)} J`} color={HUD.energy} />
        <StatBadge label="Dispersion" value={`∅ ${liveStats.spreadCm.toFixed(1)} cm`} color={HUD.spread} />
        <StatBadge label="Distance" value={`${liveStats.distanceTraveled.toFixed(1)} m`} color={HUD.distance} />
        <StatBadge label="Impacts" value={`${liveStats.pelletsArrived} / ${denseSim?.pellets.length ?? 0}`} color={HUD.impacts} />
      </div>

      {/* Timeline slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: HUD.text, fontFamily: 'monospace', minWidth: 72, fontWeight: 600 }}>
          {timeMs.toFixed(1)} ms
        </span>

        <div style={{ flex: 1, position: 'relative', height: 28 }}>
          <input
            type="range"
            min={0} max={1} step={0.0005}
            value={progress}
            onChange={handleSlider}
            style={{
              width: '100%', height: 28,
              appearance: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative', zIndex: 2,
            }}
          />
          {/* Track */}
          <div style={{
            position: 'absolute', top: 12, left: 0, right: 0, height: 4,
            background: HUD.trackBg, borderRadius: 2,
          }} />
          {/* Progress */}
          <div style={{
            position: 'absolute', top: 12, left: 0, height: 4,
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${HUD.progressFrom}, ${HUD.progressTo})`,
            borderRadius: 2,
          }} />
          {/* Impact time marker */}
          {denseSim && (
            <div style={{
              position: 'absolute', top: 7,
              left: `${(denseSim.maxFlightTime / maxTime) * 100}%`,
              width: 2, height: 14,
              background: HUD.impactMark,
              borderRadius: 1,
              transform: 'translateX(-1px)',
            }} title={`Impact: ${(denseSim.maxFlightTime * 1000).toFixed(1)}ms`} />
          )}
        </div>

        <span style={{ fontSize: 12, color: HUD.textMuted, fontFamily: 'monospace', minWidth: 72, textAlign: 'right' }}>
          {(maxTime * 1000).toFixed(0)} ms
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <button className="btn btn-sm" onClick={onReset} style={{ fontSize: 14, padding: '4px 10px' }} title="Rembobiner">
          ⏮
        </button>

        <button
          className="btn btn-sm"
          onClick={timeState.playing ? onPause : onPlay}
          style={{
            fontSize: 16, padding: '6px 18px',
            background: timeState.playing ? HUD.btnActive : undefined,
            color: timeState.playing ? HUD.btnActiveText : undefined,
          }}
        >
          {timeState.playing ? '⏸' : '▶'}
        </button>

        <div style={{ display: 'flex', gap: 3, marginLeft: 12 }}>
          {SPEED_PRESETS.map(preset => (
            <button
              key={preset.label}
              className={`btn btn-sm ${Math.abs(timeState.speed - preset.speed) < 0.0001 ? 'active' : ''}`}
              onClick={() => onSpeedChange(preset.speed)}
              title={preset.desc}
              style={{ fontSize: 10, padding: '3px 7px' }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {denseSim && (
          <span style={{ marginLeft: 12, fontSize: 10, color: HUD.textMuted }}>
            Vol: {(denseSim.maxFlightTime * 1000).toFixed(1)}ms
            | V₀: {denseSim.muzzleVelocity}m/s
            | Rét: {denseSim.velocityRetention.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: HUD.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color, fontWeight: 700, fontFamily: 'monospace' }}>
        {value}
      </div>
    </div>
  );
}
