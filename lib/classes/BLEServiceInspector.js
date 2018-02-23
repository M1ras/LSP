const BLESSED = require("blessed");

const BLE_CHARACTERISTIC_INSPECTOR = require("./BLECharacteristicInspector.js");
const HIERARCHY = require("./Hierarchy.js");
const PAD_GATT = require("../utilities/PadGATT.js");

const STRINGS = require("../constants/Strings.json");

const LAYOUT_OPTIONS = {
  width: "100%",
  height: 1,
};

const TEXT_OPTIONS = {
  width: "100%",
  height: 1,
};

class BLEServiceInspector {
  constructor(screen, parent, hierarchy, service) {
    this._initProperties(screen, parent, hierarchy, service);
    this._initLifecycle();
  }

  destruct() {
    if (this._bleCharacteristicInspectors) {
      while (this._bleCharacteristicInspectors.length > 0) {
        this._bleCharacteristicInspectors.pop().destruct();
      }

      delete this._bleCharacteristicInspectors;
    }

    if (this._bleServiceInspectors) {
      while (this._bleServiceInspectors.length > 0) {
        this._bleServiceInspectors.pop().destruct();
      }

      delete this._bleServiceInspectors;
    }

    delete this.__service_onDiscoverCharacteristics;
    delete this.__service_onDiscoverIncludedServices;

    this._text.destroy();
    this._layout.destroy();

    delete this._text;
    delete this._layout;

    delete this._service;
    delete this._hierarchy;
    delete this._parent;
    delete this._screen;
  }

  _initProperties(screen, parent, hierarchy, service) {
    this._screen = screen;
    this._parent = parent;
    this._hierarchy = hierarchy || new HIERARCHY();
    this._service = service;

    this._layout = BLESSED.layout(Object.assign({}, LAYOUT_OPTIONS));
    this._text = BLESSED.text(Object.assign({}, TEXT_OPTIONS));

    this.__service_onDiscoverIncludedServices = this._service_onDiscoverIncludedServices.bind(this);
    this.__service_onDiscoverCharacteristics = this._service_onDiscoverCharacteristics.bind(this);
  }

  _initLifecycle() {
    let drawnHierarchy = this._hierarchy.draw();
    let type = this._service.type || STRINGS.unknown;
    let name = this._service.name || STRINGS.unknown;

    let content = PAD_GATT(drawnHierarchy + STRINGS.service, this._service.uuid, type, name);
    this._text.setContent(content);

    this._layout.append(this._text);
    this._parent.append(this._layout);
    this._screen.render();

    this._service.discoverIncludedServices([], this.__service_onDiscoverIncludedServices);
    this._service.discoverCharacteristics([], this.__service_onDiscoverCharacteristics);
  }

  _service_onDiscoverIncludedServices(error, services) {
    if (!error && services) {
      this._layout.position.height += services.length;

      for (let index = 0; index < this._hierarchy.length; index++) {
        let parent = this._hierarchy[index].parent;
        parent._layout.position.height += services.length;
      }

      this._bleServiceInspectors = [];

      for (let index = 0; index < services.length; index++) {
        let hierarchy = this._hierarchy.add(this, services, index);
        let service = services[index];

        let bleServiceInspector = new BLEServiceInspector(this._screen, this._layout, hierarchy, service);
        this._bleServiceInspectors.push(bleServiceInspector);
      }

      this._screen.render();
    }
  }

  _service_onDiscoverCharacteristics(error, characteristics) {
    if (!error && characteristics) {
      this._layout.position.height += characteristics.length;

      for (let index = 0; index < this._hierarchy.length; index++) {
        let parent = this._hierarchy[index].parent;
        parent._layout.position.height += characteristics.length;
      }

      this._bleCharacteristicInspectors = [];

      for (let index = 0; index < characteristics.length; index++) {
        let hierarchy = this._hierarchy.add(this, characteristics, index);
        let characteristic = characteristics[index];

        let bleCharacteristicInspector = new BLE_CHARACTERISTIC_INSPECTOR(this._screen, this._layout, hierarchy, characteristic);
        this._bleCharacteristicInspectors.push(bleCharacteristicInspector);
      }

      this._screen.render();
    }
  }
}

module.exports = BLEServiceInspector;
