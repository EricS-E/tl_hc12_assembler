#!/usr/bin/node
let fs = require("fs");

let result = "";
let pc = 0;
let tags = [];

const instructions = require("./instructions");

const addressingModes = instructions.addressingModes;
const directives = instructions.directives;
const findInstruction = instructions.findInstruction;
const findDirective = instructions.findDirective;
const findAddressingMode = instructions.findAddressingMode;
const instructionSet = instructions.set;
const parseNumber = instructions.parseNumber;

let addressingMode = instructionTokens => {
  const [instructionName, ...operands] = instructionTokens;
  let instructionInfo = findInstruction(instructionName);
  let mode = null;
  instructionInfo.modes.forEach(currentMode => {
    let modeInfo = findAddressingMode(currentMode.type);
    if (modeInfo && modeInfo.testFunction(operands, pc)) {
      mode = currentMode;
    }
  });
  if (mode) return mode;
  else return { type: "err" };
};

function preprocessString(data) {
  let processedData = data.replace(/\t/g, " ");
  processedData = processedData.replace(/ +/g, " ");
  processedData = processedData.replace(/;.*\n/g, "\n");
  processedData = processedData.toLowerCase();
  return processedData;
}

function processDirective(instructionTokens) {
  const [directiveName, ...operands] = instructionTokens;
  if (directiveName == "org") {
    pc = parseNumber(operands[0]);
    result += parseNumber(operands[0]).toString(16).padStart(4, '0') + "\n";
  }
  if (directiveName == "bsz") {
    result += pc.toString(16) + " ";
    for (let i = 0; i < parseNumber(operands[0]); i++) result += "00 ";
    result += "\n";
    pc += parseNumber(operands[0]);
  }
  if (directiveName == "fcb") {
    result += pc.toString(16) + " ";
    operands.forEach(element => {
      result += parseInt(element).toString(16) + " ";
    });
    result += "\n";
    pc += operands.length;
  }
  if (directiveName == "fcc") {
    result += pc.toString(16) + " ";
    for (let i = 1; i < operands[0].length - 1; i++) {
      result += operands[0].charCodeAt(i) + " ";
    }
    result += "\n";
    pc += operands[0].length - 2;
  }
  if (directiveName == "equ") {
    tags[tags.length - 1].address = parseNumber(operands[0]);
  }
  if (directiveName == "dc.b" ) {
    result += pc.toString(16) + " ";
    dirOperands = operands[0].split(',').map(e => parseInt(e).toString(16).padStart(2, '0'));
    dirOperands.forEach(element => {
      result += element + " ";
    });
    result += "\n";
    pc += dirOperands.length;
  }
}

let analyseInstruction = (instructionTokens, _index) => {
  const [instructionName, ...operands] = instructionTokens;
  if (instructionName)
    if (!!findInstruction(instructionName)) {
      result += `\tInstruction: ${instructionName}\n`;
      let mode = addressingMode(instructionTokens);
      if (mode.type != "err") {
        instructionSize =
          Math.ceil(mode.opcode.length / 2) +
          addressingModes.find(amode => {
            return amode.type == mode.type;
          }).length;
        result += `\tMode: ${mode.type}\n`;

        let modeInfo = findAddressingMode(mode.type);
        let parsedOperands = modeInfo.parseFunction(operands, pc, mode);
        result += `${pc.toString(16)} ${mode.opcode} ${parsedOperands}\n`;
        pc += instructionSize;
      } else {
        result += "\tInvalid addressing mode or range\n";
      }
    } else if (!!findDirective(instructionTokens[0]))
      processDirective(instructionTokens);
    else if (instructionTokens[0])
      result += `Error: invalid token ${instructionName}\n`;
};

let analyseLine = (line, _index) => {
  if (line != "") {
    let tokens = line.split(" ");
    if (tokens[0] != "") {
      tags.push({ tag: tokens[0], address: pc });
    }
    analyseInstruction(tokens.slice(1));
  }
  result += "\n";
};

if (process.argv.length < 3) {
  console.log("Usage: assembler [FILE]");
  process.exit(1);
}
let filename = process.argv[2];

fs.readFile(filename, "utf8", (error, rawData) => {
  if (error) console.log(error);
  else {
    let data = preprocessString(rawData);
    let instructions = data.split("\n");
    instructions.forEach((line, lineIndex) => {
      analyseLine(line, lineIndex);
    });
    console.log('TABSIM:\n')
    tags.forEach(tag => {
      console.log(tag.tag, tag.address.toString(16));
      //TODO properly replace tag values
      data = data.replace(new RegExp(` ${tag.tag}`, 'g'), ' $' + tag.address.toString(16));
      data = data.replace(new RegExp(`,${tag.tag}`, 'g'), ',$' + tag.address.toString(16));
    });
    instructions = data.split("\n");
    result = "";
    instructions.forEach((line, lineIndex) => {
      analyseLine(line, lineIndex);
    });
    console.log('\nRESULT:\n')
    console.log(result.toUpperCase());
  }
});
