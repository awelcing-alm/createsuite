import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import GaussianBackground from './GaussianBackground';
import {
  BACKGROUND_EVALUATION_PRESETS,
  DEAKINS_EVALUATION_CUES,
  PERFORMANCE_EVALUATION_CUES,
  getBackgroundEvaluationPreset,
  mergeEvaluationVisualState,
} from './gaussianBackground/evaluation';
import type { BackgroundRenderConfig } from './gaussianBackground/types';

declare global {
  interface Window {
    __backgroundEvaluation?: {
      currentPresetId: string;
      presetIds: string[];
      captureMode: boolean;
      motionMode: boolean;
    };
  }
}

const LabShell = styled.main`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.94);
  background: #05070d;
`;

const Overlay = styled.aside`
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 3;
  width: min(420px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 20px;
  border-radius: 20px;
  background: rgba(6, 10, 18, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
`;

const Heading = styled.h1`
  font-size: 20px;
  margin-bottom: 8px;
`;

const Intro = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 18px;
`;

const SectionTitle = styled.h2`
  margin-top: 18px;
  margin-bottom: 10px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(130, 201, 255, 0.9);
`;

const PresetList = styled.div`
  display: grid;
  gap: 10px;
`;

const PresetButton = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(111, 215, 255, 0.6)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(26, 57, 79, 0.78)' : 'rgba(255, 255, 255, 0.04)')};
  color: inherit;
  text-align: left;
  cursor: pointer;
`;

const PresetTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const PresetDescription = styled.div`
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.68);
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.76);
`;

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.76);
`;

const Footer = styled.div`
  margin-top: 18px;
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.56);
`;

const CaptureBadge = styled.div`
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 2;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(4, 7, 14, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
`;

function readSearchParams() {
  return new URLSearchParams(window.location.search);
}

const BackgroundEvaluationLab: React.FC = () => {
  const params = readSearchParams();
  const captureMode = params.get('capture') === 'true';
  const motionMode = params.get('motion') === 'true';
  const initialPreset = getBackgroundEvaluationPreset(params.get('preset'));
  const [selectedPresetId, setSelectedPresetId] = useState(initialPreset.id);

  const preset = useMemo(() => getBackgroundEvaluationPreset(selectedPresetId), [selectedPresetId]);

  const renderConfig: BackgroundRenderConfig = useMemo(() => {
    if (!motionMode) return preset.renderConfig;

    return {
      ...preset.renderConfig,
      animate: true,
      fixedTimeSeconds: undefined,
    };
  }, [motionMode, preset]);

  useEffect(() => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('preset', selectedPresetId);
    if (captureMode) nextUrl.searchParams.set('capture', 'true');
    if (motionMode) nextUrl.searchParams.set('motion', 'true');
    window.history.replaceState({}, '', nextUrl.toString());

    document.body.dataset.backgroundEvaluationPreset = selectedPresetId;
    document.body.dataset.backgroundEvaluationCapture = String(captureMode);
    document.body.dataset.backgroundEvaluationMotion = String(motionMode);

    window.__backgroundEvaluation = {
      currentPresetId: selectedPresetId,
      presetIds: BACKGROUND_EVALUATION_PRESETS.map((entry) => entry.id),
      captureMode,
      motionMode,
    };
  }, [captureMode, motionMode, selectedPresetId]);

  return (
    <LabShell>
      <GaussianBackground
        visualState={mergeEvaluationVisualState(preset.visualState)}
        renderConfig={renderConfig}
      />

      {!captureMode && (
        <Overlay>
          <Heading>Background Evaluation Lab</Heading>
          <Intro>
            Canonical review surface for hill-climbing the shader against two targets: stronger cinematic
            composition and lower GPU cost. Presets freeze comparable frames unless motion mode is enabled.
          </Intro>

          <SectionTitle>Capture Presets</SectionTitle>
          <PresetList>
            {BACKGROUND_EVALUATION_PRESETS.map((entry) => (
              <PresetButton
                key={entry.id}
                type="button"
                $active={entry.id === preset.id}
                onClick={() => setSelectedPresetId(entry.id)}
              >
                <PresetTitle>{entry.title}</PresetTitle>
                <PresetDescription>{entry.description}</PresetDescription>
              </PresetButton>
            ))}
          </PresetList>

          <ChipRow>
            <Chip>preset={preset.id}</Chip>
            <Chip>{motionMode ? 'motion benchmark' : 'still capture'}</Chip>
            <Chip>dpr cap {renderConfig.dprCap ?? 1.25}</Chip>
          </ChipRow>

          <SectionTitle>Roger Deakins Targets</SectionTitle>
          <List>
            {preset.deakinsTargets.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {DEAKINS_EVALUATION_CUES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>

          <SectionTitle>Performance Focus</SectionTitle>
          <List>
            {preset.performanceFocus.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {PERFORMANCE_EVALUATION_CUES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>

          <Footer>
            Use <code>/background-lab?capture=true&amp;preset=&lt;id&gt;</code> for deterministic screenshots and add
            <code>&amp;motion=true</code> for frame-pacing runs.
          </Footer>
        </Overlay>
      )}

      {captureMode && <CaptureBadge>{preset.title}{motionMode ? ' · motion' : ' · still'}</CaptureBadge>}
    </LabShell>
  );
};

export default BackgroundEvaluationLab;
