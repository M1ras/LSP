const BLESSED = require("blessed");

const PAD_GATT = require("../utilities/PadGATT.js");
const STRINGS = require("../constants/Strings.json");

const TEXT_OPTIONS = {
  width: "100%",
  height: 1,
};

class BLEDescriptorInspector {
  constructor(screen, parent, hierarchy, descriptor) {
    this._initProperties(screen, parent, hierarchy, descriptor);
    this._initLifecycle();
  }

  destruct() {
    delete this.__descriptor_onReadValue;

    this._text.destroy();

    delete this._text;

    delete this._cache;

    delete this._descriptor;
    delete this._hierarchy;
    delete this._parent;
    delete this._screen;
  }

  _initProperties(screen, parent, hierarchy, descriptor) {
    this._screen = screen;
    this._parent = parent;
    this._hierarchy = hierarchy;
    this._descriptor = descriptor;

    this._cache = {
      drawnHierarchy: this._hierarchy.draw(),
      type: this._descriptor.type || STRINGS.unknown,
      name: this._descriptor.name || STRINGS.unknown,
    };

    this._text = BLESSED.text(Object.assign({}, TEXT_OPTIONS));

    this.__descriptor_onReadValue = this._descriptor_onReadValue.bind(this);
  }

  _initLifecycle() {
    let content = PAD_GATT(this._cache.drawnHierarchy + STRINGS.descriptor, this._descriptor.uuid, this._cache.type, this._cache.name);
    this._text.setContent(content);

    this._parent.append(this._text);
    this._screen.render();

    this._descriptor.readValue(this.__descriptor_onReadValue);
  }

  _descriptor_onReadValue(error, value) {
    if (!error && value) {
      let content = PAD_GATT(this._cache.drawnHierarchy + STRINGS.descriptor, this._descriptor.uuid, this._cache.type, this._cache.name, undefined, value);
      this._text.setContent(content);

      this._screen.render();
    }
  }
}

module.exports = BLEDescriptorInspector;
