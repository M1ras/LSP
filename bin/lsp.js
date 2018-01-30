#!/usr/bin/env node

const BLESSED = require("blessed");
const NOBLE = require("noble");

const PROCESS_EVENTS = require("../lib/constants/ProcessEvents.json");
const NOBLE_EVENTS = require("../lib/constants/NobleEvents.json");
const NOBLE_STATES = require("../lib/constants/NobleStates.json");

const BLE_SCANNER = require("../lib/BLEScanner.js");

const SCREEN_OPTIONS = {
  fastCSR: true,
  useBCE: true,
  ignoreLocked: [
    "escape",
    "q",
  ],
};

class LSP {
  constructor() {
    this._screen = new BLESSED.screen(SCREEN_OPTIONS);

    this.__destruct = this._destruct.bind(this);
    this.__noble_onStateChange = this._noble_onStateChange.bind(this);

    NOBLE.on(NOBLE_EVENTS.noble.stateChange, this.__noble_onStateChange);
    this._screen.key(SCREEN_OPTIONS.ignoreLocked, process.exit);
    process.on(PROCESS_EVENTS.exit, this.__destruct);

    this._bleScanner = new BLE_SCANNER(this._screen);
  }

  _destruct() {
    this._bleScanner.destruct();
    delete this._bleScanner;

    NOBLE.removeListener(NOBLE_EVENTS.noble.stateChange, this.__noble_onStateChange);
    this._screen.unkey(SCREEN_OPTIONS.ignoreLocked, process.exit);
    process.removeListener(PROCESS_EVENTS.exit, this.__destruct);

    delete this.__destruct;
    delete this.__noble_onStateChange;

    this._screen.destroy();
    delete this._screen;
  }

  _noble_onStateChange(state) {
    if (state == NOBLE_STATES.noble.poweredOn) {
      NOBLE.startScanning();
    }
  }
}

let lsp = new LSP();
