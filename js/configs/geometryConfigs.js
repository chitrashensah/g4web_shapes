import { SetGeometryCommand } from '../../vendor/threejs/editor/js/commands/SetGeometryCommand.js';
import { SphereGeometry } from '@chitrashensah/geant4-csg';

export const GEOMETRY_CONFIGS = {
  SphereGeometry: {
    parameters: {
      radiusIn: {
        type: 'number',
        label: 'Inner Radius',
        min: 0,
        max: Infinity,
        step: 0.1,
        default: 0.5,
        geometryKey: 'pRMin',
      },
      radiusOut: {
        type: 'number',
        label: 'Outer Radius',
        min: 0,
        max: Infinity,
        step: 0.1,
        default: 1,
        geometryKey: 'pRMax',
      },
      startTheta: {
        type: 'angle',
        label: 'Start Theta',
        min: 0,
        max: 180,
        step: 1,
        default: 0,
        geometryKey: 'pSTheta',
      },
      deltaTheta: {
        type: 'angle',
        label: 'Delta Theta',
        min: 0,
        max: 180,
        step: 1,
        default: 360,
        geometryKey: 'pDTheta',
      },
      startPhi: {
        type: 'angle',
        label: 'Start Phi',
        min: 0,
        max: 360,
        step: 5,
        default: 0,
        geometryKey: 'pSPhi',
      },
      deltaPhi: {
        type: 'angle',
        label: 'Delta Phi',
        min: 0,
        max: 360,
        step: 1,
        default: 180,
        geometryKey: 'pDPhi',
      },
    },
    validate: (params) => {
      if (params.radiusOut <= params.radiusIn) {
        params.radiusOut = params.radiusIn + 0.01;
      }
      if (params.radiusIn >= params.radiusOut) {
        params.radiusIn = params.radiusOut - 0.01;
      }
      return params;
    },
    createGeometry: (params) => {
      return new SphereGeometry(
        params.radiusIn,
        params.radiusOut,
        params.startTheta,
        params.deltaTheta,
        params.startPhi,
        params.deltaPhi
      );
    },
    SetGeometryCommand: SetGeometryCommand,
  },
};
