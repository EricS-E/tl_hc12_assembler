#!/usr/bin/node
let fs = require("fs");
const colors = require("ansi-colors");

let result = '';


const instructions = require("./instruction-set");

let addressingModesExpressions = [
  {   //inherent
    type: 'inh',
    expression: /^$/,
  },
  {   //immediate
    type: 'imm',
    expression: /^#\$?([0-9A-Fa-f]{2,4})$/,
  },
  {  //direct
    type: 'dir',
    expression: /^\$?([0-9A-Fa-f]{2})$/,
  },
  {  //extended
    type: 'ext',
    expression: /^\$?([0-9A-Fa-f]{4})$/,
  },

];


let isMnemonic = instructionName => {
  let foundIndex = instructions.set.findIndex((instruction) => {
    return instruction.name == instructionName;
  });
  return  foundIndex >= 0;
};

let addressingMode = (instructionName, operand) => {
  let instructionObject = instructions.set.find((instruction) => {
    return instruction.name == instructionName;
  });
  let mode = null;
  instructionObject.modes.forEach((currentMode) => {
    let expression = addressingModesExpressions.find((addressingExpression) => {
      return addressingExpression.type == currentMode.type;
    });
    if(expression.expression.test(operand)){
      mode = currentMode;
    }
  });
  if(mode)
    return mode;
  else
    return {type: 'err'}
};

function preprocessString(data) {
  let processedData = data.replace(/\t/g, ' ');
  processedData = processedData.replace(/ +/g, ' ');
  processedData = processedData.replace(/;.*\n/g, '\n');
  processedData = processedData.toLowerCase();
  return processedData;
}

let analyseInstruction = (instruction, _index) => {
  if (instruction[0])
    if (isMnemonic(instruction[0])) {
      result += `\tInstruction: ${instruction[0]}\n`;
      let operand = instruction.slice(1);
      if(operand.length < 1)
        result += `Error: unexpected token ${operand[1]}\n`;
      else {
        result += `\tOperand: ${operand}\n`;
        let mode = addressingMode(instruction[0], instruction[1]);

        result += `\Mode: ${mode.type}\n`;
        result += `\Code: ${mode.opcode}\n`;
        result += `\Cycles: ${mode.cycles}\n`;

      }
    } else {
      if(instruction[0])
        result += `Error: invalid token ${instruction[0]}\n`;
    }
};

let analyseLine = (line, _index) => {
  if (line != '') {
    let tokens = line.split(' ');
    if (tokens[0] != '') {
      result += `Tag: ${tokens[0]}\n`;
    }
    analyseInstruction(tokens.slice(1));
  }
  result += '\n';
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
    let instructions = data.split('\n');
    instructions.forEach((line, lineIndex) => {
      analyseLine(line, lineIndex);
    });
    console.log(result.toUpperCase());
  }
});
