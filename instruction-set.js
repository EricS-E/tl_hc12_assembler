

exports.set = [
  {
    name: "aba",
    modes: [
      {
        type: "inh",
        opcode: "1806",
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
        type: "imm8",
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
  {
    name: "adcb",
    modes: [
      {
        type: "imm8",
        opcode: "c9",
        cycles: 1,
      },
      {
        type: "dir",
        opcode: "d9",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "f9",
        cycles: 3,
      },
    ],
  },
  {
    name: "adda",
    modes: [
      {
        type: "imm8",
        opcode: "8b",
        cycles: 1,
      },
      {
        type: "dir",
        opcode: "9b",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "bb",
        cycles: 3,
      },
    ],
  },
  {
    name: "addb",
    modes: [
      {
        type: "imm8",
        opcode: "cb",
        cycles: 1,
      },
      {
        type: "dir",
        opcode: "db",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "fb",
        cycles: 3,
      },
    ],
  },
  {
    name: "addd",
    modes: [
      {
        type: "imm16",
        opcode: "c3",
        cycles: 2,
      },
      {
        type: "dir",
        opcode: "d3",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "f3",
        cycles: 3,
      },
    ],
  },
  {
    name: "anda",
    modes: [
      {
        type: "imm8",
        opcode: "84",
        cycles: 1,
      },
      {
        type: "dir",
        opcode: "94",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "b4",
        cycles: 3,
      },
    ],
  },
  {
    name: "andb",
    modes: [
      {
        type: "imm8",
        opcode: "c4",
        cycles: 1,
      },
      {
        type: "dir",
        opcode: "d4",
        cycles: 3,
      },
      {
        type: "ext",
        opcode: "f4",
        cycles: 3,
      },
    ],
  },
  {
    name: "andcc",
    modes: [
      {
        type: "imm8",
        opcode: "10",
        cycles: 1,
      },
    ],
  },
  {
    name: "asl",
    modes: [
      {
        type: "ext",
        opcode: "78",
        cycles: 4,
      },
    ],
  },
  {
    name: "asla",
    modes: [
      {
        type: "inh",
        opcode: "48",
        cycles: 1,
      },
    ],
  },
  {
    name: "aslb",
    modes: [
      {
        type: "inh",
        opcode: "58",
        cycles: 1,
      },
    ],
  },
  {
    name: "asld",
    modes: [
      {
        type: "inh",
        opcode: "59",
        cycles: 1,
      },
    ],
  },
  {
    name: "asr",
    modes: [
      {
        type: "ext",
        opcode: "77",
        cycles: 4,
      },
    ],
  },
  {
    name: "bcc",
    modes: [
      {
        type: "inh",
        opcode: "47",
        cycles: 1,
      },
    ],
  },
  {
    name: "bclr",
    modes: [
    ],
  },
  {
    name: "bcs",
    modes: [
    ],
  },
  {
    name: "beq",
    modes: [
    ],
  },
  {
    name: "bge",
    modes: [
    ],
  },
  {
    name: "bgnd",
    modes: [
    ],
  },
  {
    name: "bgt",
    modes: [
    ],
  },
  {
    name: "bhi",
    modes: [
    ],
  },
  {
    name: "end",
    modes: [
      {
        type: "inh",
        opcode: "",
        cycles: 0,
      },
    ],
  },
];
