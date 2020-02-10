

exports.set = [
  {
    name: "aba",
    modes: [
      {
        type: "inh",
        opcode: "18 06",
        cycles: 2,
      },
    ]
  },
  // "abx",
  // "aby",
  {
    name: "adca",
    modes: [
      {
        type: "imm",
        opcode: "89",
        cycles: 1,
      },
      {
        type: "dir",
        opcode: "99",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "b9",
        cycles: 3,
      },
    ]
  },
  // "adcb",
  // "adda",
  // "addb",
  // "addd",
  // "anda",
  // "andb",
  // "andcc",
  // "asl",
  // "asld",
  // "asr",
  // "bcc",
  // "bclr",
  // "bcs",
  // "beq",
  // "bge",
  // "bgnd",
  // "bgt",
  // "bhi",
  // "end"
];
