import * as THREE from 'three';
import { SphereGeometry } from '@chitrashensah/geant4-csg';
import { UIDiv, UIPanel } from '../vendor/threejs/editor/js/libs/ui.js';
import { AddObjectCommand } from '../vendor/threejs/editor/js/commands/AddObjectCommand.js';
import { GEOMETRY_CONFIGS } from './configs/geometryConfigs.js';

import sphereImg from '../packages/geant4-csg/images/aOrb.jpg';

function LeftPanelSolids(editor) {
  const strings = editor.strings;
  const camera = editor.camera;

  const container = new UIPanel();
  container.setId('leftpanel');

  function getPositionFromMouse(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const renderer =
      document.getElementById('viewport') ||
      document.querySelector('.Viewport');

    if (!renderer) {
      return new THREE.Vector3(0, 0, 0);
    }

    const rect = renderer.getBoundingClientRect();
    const mouseSceneX = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const mouseSceneY = -((mouseY - rect.top) / rect.height) * 2 + 1;

    const mouseScenePosition = new THREE.Vector3(mouseSceneX, mouseSceneY, 0);
    mouseScenePosition.unproject(camera);

    const direction = mouseScenePosition.sub(camera.position).normalize();
    const distance = -camera.position.y / direction.y;
    const position = camera.position
      .clone()
      .add(direction.multiplyScalar(distance));

    return position;
  }

  function createShapeItem(config) {
    const item = new UIDiv();
    item.setClass('Category-item');

    if (config.image) {
      item.dom.style.backgroundImage = `url(${config.image})`;
    } else {
      item.dom.classList.add('no-image');
    }

    item.dom.setAttribute('draggable', true);
    item.dom.setAttribute('item-type', config.type);

    const textDiv = document.createElement('div');
    textDiv.textContent = config.name;
    item.dom.appendChild(textDiv);

    item.onClick(function () {
      const geometry = config.createGeometry();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
      const shortUUID = mesh.uuid.substring(0, 6);
      mesh.name = `${config.type}_${shortUUID}`;

      // Set geometry type for later identification
      geometry.type = config.type;

      editor.execute(new AddObjectCommand(editor, mesh));
    });

    item.dom.addEventListener('dragend', function (event) {
      const position = getPositionFromMouse(event);
      const geometry = config.createGeometry();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
      const shortUUID = mesh.uuid.substring(0, 6);
      mesh.name = `${config.type}_${shortUUID}`;

      // Set geometry type for later identification
      geometry.type = config.type;

      mesh.position.copy(position);
      editor.execute(new AddObjectCommand(editor, mesh));
    });

    return item;
  }

  function createItem(title, shapes) {
    const section = new UIPanel();
    section.setClass('Panel-section');

    const header = new UIDiv();
    header.setClass('Panel-header');
    header.setTextContent(title);
    section.add(header);

    const widget = new UIPanel();
    widget.setClass('Category-widget');

    shapes.forEach((shapeConfig) => {
      const shapeItem = createShapeItem(shapeConfig);
      widget.add(shapeItem);
    });

    section.add(widget);

    let isCollapsed = false;
    header.onClick(function () {
      isCollapsed = !isCollapsed;
      widget.dom.style.display = isCollapsed ? 'none' : 'block';
    });

    return section;
  }

  const solidsShapes = [
    {
      name: 'Sphere',
      type: 'SphereGeometry',
      image: sphereImg,
      createGeometry: () => {
        // Get default parameters from config
        const config = GEOMETRY_CONFIGS['SphereGeometry'];
        const params = {};

        Object.keys(config.parameters).forEach((paramName) => {
          params[paramName] = config.parameters[paramName].default;
        });

        return config.createGeometry(params);
      },
    },

    // Add more shapes here as you implement them
  ];

  const solidsSection = createItem('SOLIDS', solidsShapes);
  container.add(solidsSection);

  return container;
}

export { LeftPanelSolids };
