#!/usr/bin/node
if (process.argv.length < 3) {
  console.log("error");
  process.exit(1);
}
let fs = require("fs");
const colors = require("ansi-colors");
let filename = process.argv[2];

let result = "";
// let instruction = class {
//     constructor(name, operandCount) {
//         this.name = name;
//         this. operandConut = operandCount;
//     }
// }

let instructionSet = [
  "aba",
  "abx",
  "aby",
  "adca",
  "adcb",
  "adda",
  "addb",
  "addd",
  "anda",
  "andb",
  "andcc",
  "asl",
  "asld",
  "asr",
  "bcc",
  "bclr",
  "bcs",
  "beq",
  "bge",
  "bgnd",
  "bgt",
  "bhi",
  "end"
];

let isMnemonic = instruction => {
  return instructionSet.includes(instruction);
};

function preprocessString(data) {
  let processedData = data.replace(/\t/g, " ");
  processedData = processedData.replace(/ +/g, " ");
  processedData = processedData.toLowerCase();
  return processedData;
}

let analyseInstruction = (instruction, _index) => {
  if (instruction[0])
    if (isMnemonic(instruction[0])) {
      result += `\tInstrunction: ${instruction[0]}\n`;
      let operands = "";
      instruction.slice(1).forEach(operand => {
        operands += operand + " ";
      });
      result += `\tOperands: ${operands}\n`;
    } else {
      result += `Error: invalid token ${instruction[0]}\n`;
    }
};

let analyseLine = (instruction, _index) => {
  if (instruction != "") {
    let fragments = instruction.split(" ");
    if (fragments[0] == ";") return;
    if (fragments[0] != "") {
      result += `Tag: ${fragments[0]}\n`;
    }
    analyseInstruction(fragments.slice(1));
  }
  result += "\n";
};

fs.readFile(filename, "utf8", (error, rawData) => {
  if (error) console.log(error);
  else {
    let data = preprocessString(rawData);
    let instructions = data.split("\n");
    instructions.forEach((line, lineIndex) => {
      analyseLine(line, lineIndex);
    });
    console.log(result.toUpperCase());
  }
});
