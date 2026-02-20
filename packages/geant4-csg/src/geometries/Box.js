import * as THREE from 'three';

class Box extends THREE.BufferGeometry {
  constructor(width, height, depth) {
    super();

    this.type = 'BoxGeometry';

    const Width = width;
    const Height = height;
    const Depth = depth;
    const boxGeometry = new THREE.BoxGeometry(Width * 2, Height * 2, Depth * 2);

    const finalGeometry = boxGeometry;
    finalGeometry.type = 'BoxGeometry';
    finalGeometry.parameters = { width, height, depth };

    Object.assign(this, finalGeometry);
  }

  copy(source) {
    super.copy(source);
    this.parameters = Object.assign({}, source.parameters);
    return this;
  }

  static fromJSON(data) {
    return new Box(data.width, data.height, data.depth);
  }
}

export { Box };
