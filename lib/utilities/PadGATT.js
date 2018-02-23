const PAD_STRING = require("./PadString.js");

function PadGATT(declaration, uuid, type, name, properties, value) {
  let paddedDeclaration = PAD_STRING(declaration).padEnd(22);
  let paddedUUID = PAD_STRING(uuid).padEnd(38);
  let paddedType = PAD_STRING(type).padEnd(82);
  let paddedName = PAD_STRING(name).padEnd(53);
  let paddedProperties = PAD_STRING(properties).padEnd(12);
  let paddedValue = PAD_STRING(value).padEnd(33);

  return paddedDeclaration + paddedUUID + paddedType + paddedName + paddedProperties + paddedValue;
}

module.exports = PadGATT;
