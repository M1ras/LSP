const BLESSED = require("blessed");
const NOBLE = require("noble");

const BLESSED_BORDER_TYPES = require("./constants/BlessedBorderTypes.json");
const BLESSED_COLORS = require("./constants/BlessedColors.json");
const NOBLE_EVENTS = require("./constants/NobleEvents.json");
const STRINGS = require("./constants/Strings.json");

const PAD_STRING = function(string = "") {
  return ` ${string} `;
};

const PAD_MAC_ADDRESS_NAME = function(macAddress, name) {
  let paddedMacAddress = PAD_STRING(macAddress).padEnd(19);
  let paddedName = PAD_STRING(name).padEnd(33);

  return paddedMacAddress + paddedName;
};

const BOX_OPTIONS = {
  border: {
    type: BLESSED_BORDER_TYPES.line,
    fg: BLESSED_COLORS.magenta,
  },
  label: PAD_STRING(STRINGS.peripherals),
  content: PAD_MAC_ADDRESS_NAME(STRINGS.macAddress, STRINGS.name),
};

const LIST_OPTIONS = {
  position: {
    top: 1,
    width: "100%-2",
    height: "100%-3",
  },
  selectedFg: BLESSED_COLORS.magenta,
  selectedInverse: true,
  scrollbar: {
    ch: STRINGS.scrollbar,
    fg: BLESSED_COLORS.magenta,
  },
  keys: true,
  mouse: true,
};

class BLEScanner {
  constructor(screen) {
    this._screen = screen;
    this._box = BLESSED.box(BOX_OPTIONS);
    this._list = BLESSED.list(LIST_OPTIONS);

    this.__noble_onScanStart = this._noble_onScanStart.bind(this);
    this.__noble_onScanStop = this._noble_onScanStop.bind(this);
    this.__noble_onDiscover = this._noble_onDiscover.bind(this);

    NOBLE.on(NOBLE_EVENTS.noble.scanStart, this.__noble_onScanStart);
    NOBLE.on(NOBLE_EVENTS.noble.scanStop, this.__noble_onScanStop);
    NOBLE.on(NOBLE_EVENTS.noble.discover, this.__noble_onDiscover);
  }

  destruct() {
    NOBLE.removeListener(NOBLE_EVENTS.noble.scanStart, this.__noble_onScanStart);
    NOBLE.removeListener(NOBLE_EVENTS.noble.scanStop, this.__noble_onScanStop);
    NOBLE.removeListener(NOBLE_EVENTS.noble.discover, this.__noble_onDiscover);

    delete this.__noble_onScanStart;
    delete this.__noble_onScanStop;
    delete this.__noble_onDiscover;

    this._list.destroy();
    this._box.destroy();

    delete this._list;
    delete this._box;
    delete this._screen;
  }

  _noble_onScanStart() {
    this._box.append(this._list);
    this._screen.append(this._box);
    this._screen.render();
  }

  _noble_onScanStop() {
    this._list.clearItems();
    this._box.remove(this._list);
    this._screen.remove(this._box);
    this._screen.render();
  }

  _noble_onDiscover(peripheral) {
    let macAddress = peripheral.address == "unknown" ? STRINGS.unknown : peripheral.address;
    let name = peripheral.advertisement.localName == undefined ? STRINGS.unknown : peripheral.advertisement.localName;

    this._list.appendItem(PAD_MAC_ADDRESS_NAME(macAddress, name));
    this._screen.render();
  }
}

module.exports = BLEScanner;
