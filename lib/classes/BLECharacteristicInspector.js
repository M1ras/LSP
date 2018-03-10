const BLESSED = require("blessed");

const BLE_DESCRIPTOR_INSPECTOR = require("./BLEDescriptorInspector.js");
const PAD_GATT = require("../utilities/PadGATT.js");

const NOBLE_EVENTS = require("../constants/NobleEvents.json");
const NOBLE_PROPERTIES = require("../constants/NobleProperties.json");
const STRINGS = require("../constants/Strings.json");

const LAYOUT_OPTIONS = {
  width: "100%",
  height: 1,
};

const TEXT_OPTIONS = {
  width: "100%",
  height: 1,
};

class BLECharacteristicInspector {
  constructor(screen, parent, hierarchy, characteristic) {
    this._initProperties(screen, parent, hierarchy, characteristic);
    this._initLifecycle();
  }

  destruct() {
    if (this._bleDescriptorInspectors) {
      while (this._bleDescriptorInspectors.length > 0) {
        this._bleDescriptorInspectors.pop().destruct();
      }

      delete this._bleDescriptorInspectors;
    }

    if (this._characteristic.properties.includes(NOBLE_PROPERTIES.characteristic.notify) ||
        this._characteristic.properties.includes(NOBLE_PROPERTIES.characteristic.indicate)) {

      this._characteristic.removeListener(NOBLE_EVENTS.characteristic.data, this.__characteristic_onData);
      this._characteristic.unsubscribe();
    }

    delete this.__characteristic_onDiscoverDescriptors;
    delete this.__characteristic_onData;
    delete this.__characteristic_onRead;

    this._text.destroy();
    this._layout.destroy();

    delete this._text;
    delete this._layout;

    delete this._cache;

    delete this._characteristic;
    delete this._hierarchy;
    delete this._parent;
    delete this._screen;
  }

  _initProperties(screen, parent, hierarchy, characteristic) {
    this._screen = screen;
    this._parent = parent;
    this._hierarchy = hierarchy;
    this._characteristic = characteristic;

    this._cache = {
      drawnHierarchy: this._hierarchy.draw(),
      type: this._characteristic.type || STRINGS.unknown,
      name: this._characteristic.name || STRINGS.unknown,
      drawnProperties: this._drawProperties(this._characteristic.properties),
    };

    this._layout = BLESSED.layout(Object.assign({}, LAYOUT_OPTIONS));
    this._text = BLESSED.text(Object.assign({}, TEXT_OPTIONS));

    this.__characteristic_onRead = this._characteristic_onRead.bind(this);
    this.__characteristic_onData = this._characteristic_onData.bind(this);
    this.__characteristic_onDiscoverDescriptors = this._characteristic_onDiscoverDescriptors.bind(this);
  }

  _initLifecycle() {
    let content = PAD_GATT(this._cache.drawnHierarchy + STRINGS.characteristic, this._characteristic.uuid, this._cache.type, this._cache.name, this._cache.drawnProperties);
    this._text.setContent(content);

    this._layout.append(this._text);
    this._parent.append(this._layout);
    this._screen.render();

    if (this._characteristic.properties.includes(NOBLE_PROPERTIES.characteristic.read)) this._characteristic.read(this.__characteristic_onRead);

    if (this._characteristic.properties.includes(NOBLE_PROPERTIES.characteristic.notify) ||
        this._characteristic.properties.includes(NOBLE_PROPERTIES.characteristic.indicate)) {

      this._characteristic.subscribe();
      this._characteristic.on(NOBLE_EVENTS.characteristic.data, this.__characteristic_onData);
    }

    this._characteristic.discoverDescriptors(this.__characteristic_onDiscoverDescriptors);
  }

  _drawProperties(properties) {
    let canvas = "";

    if (properties.includes(NOBLE_PROPERTIES.characteristic.broadcast)) canvas += "B";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.read)) canvas += "R";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.writeWithoutResponse)) canvas += "A";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.write)) canvas += "W";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.notify)) canvas += "N";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.indicate)) canvas += "I";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.authenticatedSignedWrites)) canvas += "B";
    if (properties.includes(NOBLE_PROPERTIES.characteristic.extendedProperties)) canvas += "C";

    return canvas;
  }

  _characteristic_onRead(error, value) {
    if (!error && value) {
      let content = PAD_GATT(this._cache.drawnHierarchy + STRINGS.characteristic, this._characteristic.uuid, this._cache.type, this._cache.name, this._cache.drawnProperties, value);
      this._text.setContent(content);

      this._screen.render();
    }
  }

  _characteristic_onData(value) {
    let content = PAD_GATT(this._cache.drawnHierarchy + STRINGS.characteristic, this._characteristic.uuid, this._cache.type, this._cache.name, this._cache.drawnProperties, value);
    this._text.setContent(content);

    this._screen.render();
  }

  _characteristic_onDiscoverDescriptors(error, descriptors) {
    if (!error && descriptors) {
      this._layout.position.height += descriptors.length;

      for (let index = 0; index < this._hierarchy.length; index++) {
        let parent = this._hierarchy[index].parent;
        parent._layout.position.height += descriptors.length;
      }

      this._bleDescriptorInspectors = [];

      for (let index = 0; index < descriptors.length; index++) {
        let hierarchy = this._hierarchy.add(this, descriptors, index);
        let descriptor = descriptors[index];

        let bleDescriptorInspector = new BLE_DESCRIPTOR_INSPECTOR(this._screen, this._layout, hierarchy, descriptor);
        this._bleDescriptorInspectors.push(bleDescriptorInspector);
      }

      this._screen.render();
    }
  }
}

module.exports = BLECharacteristicInspector;
