import tippy from 'tippy.js';

import {
  UIPanel,
  UIRow,
  UIText,
  UIInput,
  UISpan,
  UINumber,
} from '../vendor/threejs/editor/js/libs/ui.js';
import { SetGeometryValueCommand } from '../vendor/threejs/editor/js/commands/SetGeometryValueCommand.js';
import { GEOMETRY_CONFIGS } from './configs/geometryConfigs.js';

function SidebarGeometry(editor) {
  const strings = editor.strings;
  const signals = editor.signals;

  const container = new UIPanel();

  let currentGeometryType = null;

  const geometryTypeRow = new UIRow();
  const geometryType = new UIText();

  geometryTypeRow.add(new UIText('Type').setWidth('90px'));
  geometryTypeRow.add(geometryType);

  container.add(geometryTypeRow);

  const geometryNameRow = new UIRow();
  const geometryName = new UIInput().onChange(function () {
    const nameConstraint = (name) => {
      const regex = /^[a-zA-Z0-9]+$/;

      if (!regex.test(name)) {
        alert('Warning: Name cannot contain spaces or symbols.');
        geometryName.setValue('');
        return false;
      } else {
        return true;
      }
    };

    if (editor.selected.geometry && nameConstraint(geometryName.getValue())) {
      editor.execute(
        new SetGeometryValueCommand(
          editor,
          editor.selected,
          'name',
          geometryName.getValue()
        )
      );
    }
  });

  geometryNameRow.add(new UIText('Name').setWidth('90px'));
  geometryNameRow.add(geometryName);

  container.add(geometryNameRow);

  const parameters = new UISpan();
  container.add(parameters);

  function buildGeometryParameters(object) {
    const geometry = object.geometry;
    const geometryType = geometry.type;
    const parametersContainer = new UIPanel();

    const config = GEOMETRY_CONFIGS[geometryType];

    if (!config) {
      console.warn('No configuration found for:', geometryType);
      return parametersContainer;
    }

    const uiControls = {};
    const currentValues = {};

    const gridSpaceRow = new UIRow();
    const gridSpace = new UIText('Grid Info').setClass('grid_Space');
    gridSpaceRow.add(gridSpace);
    parametersContainer.add(gridSpaceRow);

    tippy(gridSpace.dom, {
      content:
        'The grid is 6x6, with each square and the space between lines measuring 1 cm.',
      placement: 'top',
    });

    Object.keys(config.parameters).forEach((paramName) => {
      const param = config.parameters[paramName];
      const geometryKey = param.geometryKey || paramName;
      currentValues[paramName] =
        geometry.parameters[geometryKey] !== undefined
          ? geometry.parameters[geometryKey]
          : param.default;
    });

    Object.keys(config.parameters).forEach((paramName) => {
      const param = config.parameters[paramName];

      const row = new UIRow();

      const label = new UIText(param.label).setWidth('90px');

      const control = new UINumber(currentValues[paramName])
        .setRange(param.min, param.max)
        .setStep(param.step || 1)
        .onChange(() => updateGeometry(paramName));

      row.add(label);
      row.add(control);

      if (param.type === 'angle') {
        const angleUnit = new UIText('°').setWidth('20px');
        row.add(angleUnit);
      }

      uiControls[paramName] = control;

      parametersContainer.add(row);
    });

    function updateGeometry(changedParam) {
      Object.keys(uiControls).forEach((paramName) => {
        currentValues[paramName] = uiControls[paramName].getValue();
      });

      if (config.validate) {
        const validatedValues = config.validate({ ...currentValues });

        Object.keys(validatedValues).forEach((paramName) => {
          if (currentValues[paramName] !== validatedValues[paramName]) {
            currentValues[paramName] = validatedValues[paramName];
            if (uiControls[paramName]) {
              uiControls[paramName].setValue(validatedValues[paramName]);
            }
          }
        });
      }

      const newGeometry = config.createGeometry(currentValues);

      editor.execute(
        new config.SetGeometryCommand(editor, object, newGeometry)
      );
    }

    return parametersContainer;
  }

  async function build() {
    const object = editor.selected;

    if (object && object.geometry && !object.source) {
      const geometry = object.geometry;

      container.setDisplay('block');

      if (geometry.type.includes('Geometry2')) {
        geometryType.setValue(geometry.type.slice(0, -9));
      } else if (geometry.type[0] === 'a') {
        geometryType.setValue(geometry.type.slice(1, -8));
      } else if (geometry.type.includes('Geometry')) {
        geometryType.setValue(geometry.type.slice(0, -8));
      } else {
        geometryType.setValue(geometry.type);
      }

      geometryName.setValue(geometry.name);

      if (currentGeometryType !== geometry.type) {
        parameters.clear();

        parameters.add(buildGeometryParameters(object));

        currentGeometryType = geometry.type;
      }
    } else {
      container.setDisplay('none');
    }
  }

  signals.objectSelected.add(function (object) {
    currentGeometryType = null;

    if (object && !object.source && object.geometry) {
      build();
    } else {
      container.setDisplay('none');
    }
  });

  signals.geometryChanged.add(function (object) {
    if (object && !object.source && object === editor.selected) {
      build();
    }
  });

  return container;
}

export { SidebarGeometry };
