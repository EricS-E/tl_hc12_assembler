const registers = [
  {
    name: 'a',
    rel9code: '0',
  },
  {
    name: 'b',
    rel9code: '1',
  },
  {
    name: 'd',
    rel9code: '4',
  },
  {
    name: 'x',
    rel9code: '5',
    indexedCode: '000',
  },
  {
    name: 'y',
    rel9code: '6',
    indexedCode: '01',
  },
  {
    name: 'sp',
    rel9code: '7',
    indexedCode: '10',
  },
  {
    name: 'pc',
    indexedCode: '11',
  },
];

const directives = [
  {
    name: 'start',
  },
  {
    name: 'end',
  },
  {
    name: 'org',
  },
  {
    name: 'equ',
  },
  {
    name: 'bsz',
  },
  {
    name: 'zmb',
  },
  {
    name: 'fill',
  },
  {
    name: 'fcb',
  },
  {
    name: 'fcc',
  },
  {
    name: 'dc.b',
  },
];

const addressingModes = [
  {
    //inherent
    type: 'inh',
    testFunction: function (operandTokens) {
      return !operandTokens || operandTokens.length == 0;
    },
    parseFunction: function (operandTokens, _pc) {
      return '';
    },
    length: 0,
  },
  {
    //immediate8b
    type: 'imm8',
    testFunction: function (operandTokens, _pc) {
      if (!/^#.*/.test(operandTokens[0])) return false;
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 8 - 1);
    },
    parseFunction: function (operandTokens, _pc) {
      return parseNumber(operandTokens[0]).toString(16).padStart(2, '0');
    },
    length: 1,
  },
  {
    //immediate16b
    type: 'imm16',
    testFunction: function (operandTokens) {
      if (!/^#.*/.test(operandTokens[0])) return false;
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 16 - 1);
    },
    parseFunction: function (operandTokens, _pc) {
      return parseNumber(operandTokens[0]).toString(16).padStart(4, '0');
    },
    length: 2,
  },
  {
    //direct
    type: 'dir',
    testFunction: function (operandTokens) {
      if (/^#.*/.test(operandTokens[0])) return false;
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 8 - 1);
    },
    parseFunction: function (operandTokens, _pc) {
      return parseNumber(operandTokens[0]).toString(16).padStart(2, '0');
    },
    length: 1,
  },
  {
    //extended
    type: 'ext',
    testFunction: function (operandTokens) {
      if (/^#.*/.test(operandTokens[0])) return false;
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 16 - 1);
    },
    parseFunction: function (operandTokens, _pc) {
      return parseNumber(operandTokens[0]).toString(16).padStart(4, '0');
    },
    length: 2,
  },
  {
    //relative8b
    type: 'rel8',
    testFunction: function (operandTokens, pc) {
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      let offset = numValue - (pc + 2);
      return isInRange(offset, -(2 ** 7), 2 ** 7 - 1);
    },
    parseFunction: function (operandTokens, pc) {
      let numValue = parseNumber(operandTokens[0]);
      let offset = numValue - (pc + 2);
      return parseInt(twosComplement(offset, 8), 2)
        .toString(16)
        .padStart(2, '0');
    },
    length: 1,
  },
  {
    //relative16b
    type: 'rel16',
    testFunction: function (operandTokens, pc) {
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      let offset = numValue - (pc + 4);
      return isInRange(offset, -(2 ** 15), 2 ** 15 - 1);
    },
    parseFunction: function (operandTokens, pc) {
      let numValue = parseNumber(operandTokens[0]);
      let offset = numValue - (pc + 4);
      return parseInt(twosComplement(offset, 16), 2)
        .toString(16)
        .padStart(4, '0');
    },
    length: 2,
  },
  {
    //relative9b
    type: 'rel9',
    testFunction: function (operandTokens, pc) {
      let [reg, target] = operandTokens[0].split(',');
      if (!findRegister(reg)) return false;
      let numValue = parseNumber(target);
      if (isNaN(numValue)) return false;
      let offset = numValue - (pc + 3);
      return isInRange(offset, -(2 ** 8), 2 ** 8 - 1);
    },
    parseFunction: function (operandTokens, pc, mode) {
      let [reg, target] = operandTokens[0].split(',');
      let regInfo = findRegister(reg);
      let numValue = parseNumber(target);
      let offset = numValue - (pc + 3);
      let secondCode;
      if (Math.sign(offset) == -1) {
        secondCode = (parseInt(mode.secOpcode, 16) + 1).toString(16);
        offset = parseInt(twosComplement(offset, 8), 2);
      } else secondCode = mode.secOpcode;
      secondCode += regInfo.rel9code;
      return `${secondCode} ${offset.toString(16)}`;
    },
    length: 2,
  },
  {
    //indexed 1 - 5b
    type: 'idx1_5b',
    testFunction: function (operandTokens, pc) {
      let [offset, reg] = operandTokens[0].split(',');
      if (!findRegister(reg) || !findRegister(reg).indexedCode) return false;
      let numValue = parseNumber(offset);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, -(2 ** 4), 2 ** 4 - 1);
    },
    parseFunction: function (operandTokens, pc, mode) {
      let [offset, reg] = operandTokens[0].split(',');
      if (!findRegister(reg)) return false;
      let numValue = parseNumber(offset);
      let regInfo = findRegister(reg);
      let bx = '';

      bx += regInfo.indexedCode + '0';
      bx += twosComplement(numValue, 5).padStart(5, '0');

      return `${bx}`;
    },
    length: 1,
  },
  {
    //indexed 1 - 9b
    type: 'idx1_9b',
    testFunction: function (operandTokens, pc) {
      let [offset, reg] = operandTokens[0].split(',');
      if (!findRegister(reg) || !findRegister(reg).indexedCode) return false;
      let numValue = parseNumber(offset);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, -(2 ** 8), 2 ** 8 - 1);
    },
    parseFunction: function (operandTokens, pc, mode) {
      let [offset, reg] = operandTokens[0].split(',');
      if (!findRegister(reg)) return false;
      let numValue = parseNumber(offset);
      let regInfo = findRegister(reg);
      let bx = '';

      bx += '111' + regInfo.indexedCode + '0' + '0';
      bx += (+(Math.sign(numValue) == -1)).toString();
      bx = parseInt(bx, 2).toString(16).padStart(2, '0');
      offset = parseInt(twosComplement(numValue, 8), 2)
        .toString(16)
        .padStart(2, '0');

      return `${bx} ${offset}`;
    },
    length: 2,
  },
  {
    //indexed 1 - 16b
    type: 'idx1_16b',
    testFunction: function (operandTokens, pc) {
      let [offset, reg] = operandTokens[0].split(',');
      if (!findRegister(reg) || !findRegister(reg).indexedCode) return false;
      let numValue = parseNumber(offset);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, -(2 ** 15), 2 ** 15 - 1);
    },
    parseFunction: function (operandTokens, pc, mode) {
      let [offset, reg] = operandTokens[0].split(',');
      if (!findRegister(reg)) return false;
      let numValue = parseNumber(offset);
      let regInfo = findRegister(reg);
      let bx = '';

      bx += '111' + regInfo.indexedCode + '010';
      bx = parseInt(bx, 2).toString(16).padStart(2, '0');
      offset = parseInt(twosComplement(numValue, 16), 2)
        .toString(16)
        .padStart(4, '0');

      return `${bx} ${offset}`;
    },
    length: 3,
  },
];

const set = [
  {
    name: 'aba',
    modes: [
      {
        type: 'inh',
        opcode: '1806',
      },
    ],
  },
  // "abx",
  // "aby",
  {
    name: 'adca',
    modes: [
      {
        type: 'imm8',
        opcode: '89',
      },
      {
        type: 'dir',
        opcode: '99',
      },
      {
        type: 'ext',
        opcode: 'b9',
      },
    ],
  },
  {
    name: 'adcb',
    modes: [
      {
        type: 'imm8',
        opcode: 'c9',
      },
      {
        type: 'dir',
        opcode: 'd9',
      },
      {
        type: 'ext',
        opcode: 'f9',
      },
    ],
  },
  {
    name: 'adda',
    modes: [
      {
        type: 'imm8',
        opcode: '8b',
      },
      {
        type: 'dir',
        opcode: '9b',
      },
      {
        type: 'ext',
        opcode: 'bb',
      },
    ],
  },
  {
    name: 'addb',
    modes: [
      {
        type: 'imm8',
        opcode: 'cb',
      },
      {
        type: 'dir',
        opcode: 'db',
      },
      {
        type: 'ext',
        opcode: 'fb',
      },
    ],
  },
  {
    name: 'addd',
    modes: [
      {
        type: 'imm16',
        opcode: 'c3',
      },
      {
        type: 'dir',
        opcode: 'd3',
      },
      {
        type: 'ext',
        opcode: 'f3',
      },
    ],
  },
  {
    name: 'anda',
    modes: [
      {
        type: 'imm8',
        opcode: '84',
      },
      {
        type: 'dir',
        opcode: '94',
      },
      {
        type: 'ext',
        opcode: 'b4',
      },
    ],
  },
  {
    name: 'andb',
    modes: [
      {
        type: 'imm8',
        opcode: 'c4',
      },
      {
        type: 'dir',
        opcode: 'd4',
      },
      {
        type: 'ext',
        opcode: 'f4',
      },
    ],
  },
  {
    name: 'andcc',
    modes: [
      {
        type: 'imm8',
        opcode: '10',
      },
    ],
  },
  {
    name: 'asl',
    modes: [
      {
        type: 'ext',
        opcode: '78',
      },
    ],
  },
  {
    name: 'asla',
    modes: [
      {
        type: 'inh',
        opcode: '48',
      },
    ],
  },
  {
    name: 'aslb',
    modes: [
      {
        type: 'inh',
        opcode: '58',
      },
    ],
  },
  {
    name: 'asld',
    modes: [
      {
        type: 'inh',
        opcode: '59',
      },
    ],
  },
  {
    name: 'asr',
    modes: [
      {
        type: 'ext',
        opcode: '77',
      },
    ],
  },
  {
    name: 'bcc',
    modes: [
      {
        type: 'inh',
        opcode: '47',
      },
    ],
  },
  {
    name: 'bclr',
    modes: [],
  },
  {
    name: 'bcs',
    modes: [],
  },
  {
    name: 'beq',
    modes: [
      {
        type: 'rel8',
        opcode: '27',
      },
    ],
  },
  {
    name: 'bge',
    modes: [],
  },
  {
    name: 'bgnd',
    modes: [],
  },
  {
    name: 'bgt',
    modes: [],
  },
  {
    name: 'bhi',
    modes: [],
  },
  {
    name: 'bne',
    modes: [
      {
        type: 'rel8',
        opcode: '26',
      },
    ],
  },
  {
    name: 'lbne',
    modes: [
      {
        type: 'rel16',
        opcode: '1826',
      },
    ],
  },
  {
    name: 'jmp',
    modes: [
      {
        type: 'ext',
        opcode: '06',
      },
    ],
  },
  {
    name: 'ibne',
    modes: [
      {
        type: 'rel9',
        opcode: '04',
        secOpcode: 'a',
      },
    ],
  },
];

const findDirective = (directiveName) => {
  return directives.find((directive) => {
    return directive.name == directiveName;
  });
};

const findInstruction = (instructionName) => {
  const foundInstruction = set.find((instruction) => {
    return instruction.name == instructionName;
  });
  return foundInstruction;
};

const findAddressingMode = (addressingModeType) => {
  return addressingModes.find((addressingMode) => {
    return addressingMode.type == addressingModeType;
  });
};

const findRegister = (regName) => {
  return registers.find((register) => {
    return register.name == regName;
  });
};

function parseNumber(number) {
  if (number == '') return 0;
  number = number.replace('#', '');
  let radix;
  if (/^\$/.test(number)) radix = 16;
  else if (/^\@/.test(number)) radix = 8;
  else if (/^\%/.test(number)) radix = 2;
  else radix = 10;
  number = number.replace(/@|%|\$/, '');
  return parseInt(number, radix);
}

function isInRange(number, low, high) {
  return number >= low && number <= high;
}

function twosComplement(value, bitCount) {
  let binaryStr;

  if (value >= 0) {
    let twosComp = value.toString(2);
    binaryStr = padAndChop(twosComp, '0', bitCount || twosComp.length);
  } else {
    binaryStr = (Math.pow(2, bitCount) + value).toString(2);

    if (Number(binaryStr) < 0) {
      return undefined;
    }
  }

  return `${binaryStr}`;
}

function padAndChop(str, padChar, length) {
  return (Array(length).fill(padChar).join('') + str).slice(length * -1);
}

exports.set = set;
exports.addressingModes = addressingModes;
exports.directives = directives;
exports.findDirective = findDirective;
exports.findInstruction = findInstruction;
exports.findAddressingMode = findAddressingMode;
exports.parseNumber = parseNumber;
