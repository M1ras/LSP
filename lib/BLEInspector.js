const BLESSED = require("blessed");
const NOBLE = require("noble");

const BLE_SERVICE_INSPECTOR = require("./classes/BLEServiceInspector.js");
const PAD_GATT = require("./utilities/PadGATT.js");
const PAD_STRING = require("./utilities/PadString.js");

const BLESSED_BORDER_TYPES = require("./constants/BlessedBorderTypes.json");
const BLESSED_COLORS = require("./constants/BlessedColors.json");
const NOBLE_EVENTS = require("./constants/NobleEvents.json");
const NOBLE_STATES = require("./constants/NobleStates.json");
const STRINGS = require("./constants/Strings.json");

const BOX_OPTIONS = {
  border: {
    type: BLESSED_BORDER_TYPES.line,
    fg: BLESSED_COLORS.magenta,
  },
  label: PAD_STRING(STRINGS.peripheral),
  content: PAD_GATT(STRINGS.declaration, STRINGS.uuid, STRINGS.type, STRINGS.name, STRINGS.properties, STRINGS.value),
};

const LAYOUT_OPTIONS = {
  top: 1,
  width: "100%-2",
  height: "100%-3",
};

class BLEInspector {
  constructor(screen) {
    this._screen = screen;
    this._box = BLESSED.box(BOX_OPTIONS);
    this._layout = BLESSED.layout(LAYOUT_OPTIONS);

    this.__noble_onConnect = this._noble_onConnect.bind(this);
    this.__noble_onDisconnect = this._noble_onDisconnect.bind(this);
    this.__peripheral_onDiscoverServices = this._peripheral_onDiscoverServices.bind(this);

    NOBLE._bindings.on(NOBLE_EVENTS.peripheral.connect, this.__noble_onConnect);
    NOBLE._bindings.on(NOBLE_EVENTS.peripheral.disconnect, this.__noble_onDisconnect);
  }

  destruct() {
    if (this._bleServiceInspectors) {
      while (this._bleServiceInspectors.length > 0) {
        this._bleServiceInspectors.pop().destruct();
      }

      delete this._bleServiceInspectors;
    }

    delete this._peripheral;

    NOBLE._bindings.removeListener(NOBLE_EVENTS.peripheral.disconnect, this.__noble_onDisconnect);
    NOBLE._bindings.removeListener(NOBLE_EVENTS.peripheral.connect, this.__noble_onConnect);

    delete this.__peripheral_onDiscoverServices;
    delete this.__noble_onDisconnect;
    delete this.__noble_onConnect;

    this._layout.destroy();
    this._box.destroy();

    delete this._layout;
    delete this._box;
    delete this._screen;
  }

  _noble_onConnect(peripheralUUID) {
    let peripheral = NOBLE._peripherals[peripheralUUID];

    if (peripheral && peripheral.state == NOBLE_STATES.peripheral.connected) {
      this._box.append(this._layout);
      this._screen.append(this._box);
      this._screen.render();

      this._peripheral = peripheral;
      this._peripheral.discoverServices([], this.__peripheral_onDiscoverServices);
    }
  }

  _noble_onDisconnect(peripheralUUID) {
    let peripheral = NOBLE._peripherals[peripheralUUID];

    if (peripheral && peripheral.state == NOBLE_STATES.peripheral.disconnected) {
      if (this._bleServiceInspectors) {
        while (this._bleServiceInspectors.length > 0) {
          this._bleServiceInspectors.pop().destruct();
        }

        delete this._bleServiceInspectors;
      }

      delete this._peripheral;

      this._box.remove(this._layout);
      this._screen.remove(this._box);
      this._screen.render();
    }
  }

  _peripheral_onDiscoverServices(error, services) {
    if (!error && services) {

      this._bleServiceInspectors = [];

      for (let index = 0; index < services.length; index++) {
        let hierarchy = undefined;
        let service = services[index];

        let bleServiceInspector = new BLE_SERVICE_INSPECTOR(this._screen, this._layout, hierarchy, service);
        this._bleServiceInspectors.push(bleServiceInspector);
      }

      this._screen.render();
    }
  }
}

module.exports = BLEInspector;
