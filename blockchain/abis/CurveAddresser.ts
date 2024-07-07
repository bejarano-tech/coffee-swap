export const CurveAddresserABI = [
  {
    "name": "NewEntry",
    "inputs": [
      { "name": "id", "type": "uint256", "indexed": true },
      { "name": "addr", "type": "address", "indexed": false },
      { "name": "description", "type": "string", "indexed": false }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "EntryModified",
    "inputs": [
      { "name": "id", "type": "uint256", "indexed": true },
      { "name": "version", "type": "uint256", "indexed": false }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "EntryRemoved",
    "inputs": [{ "name": "id", "type": "uint256", "indexed": true }],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "CommitNewAdmin",
    "inputs": [{ "name": "admin", "type": "address", "indexed": true }],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "NewAdmin",
    "inputs": [{ "name": "admin", "type": "address", "indexed": true }],
    "anonymous": false,
    "type": "event"
  },
  {
    "stateMutability": "nonpayable",
    "type": "constructor",
    "inputs": [],
    "outputs": []
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "ids",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "get_address",
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "address" }]
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "add_new_id",
    "inputs": [
      { "name": "_id", "type": "uint256" },
      { "name": "_address", "type": "address" },
      { "name": "_description", "type": "string" }
    ],
    "outputs": []
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "add_new_ids",
    "inputs": [
      { "name": "_ids", "type": "uint256[]" },
      { "name": "_addresses", "type": "address[]" },
      { "name": "_descriptions", "type": "string[]" }
    ],
    "outputs": []
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "update_id",
    "inputs": [
      { "name": "_id", "type": "uint256" },
      { "name": "_new_address", "type": "address" },
      { "name": "_new_description", "type": "string" }
    ],
    "outputs": []
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "update_address",
    "inputs": [
      { "name": "_id", "type": "uint256" },
      { "name": "_address", "type": "address" }
    ],
    "outputs": []
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "update_description",
    "inputs": [
      { "name": "_id", "type": "uint256" },
      { "name": "_description", "type": "string" }
    ],
    "outputs": []
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "remove_id",
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "remove_ids",
    "inputs": [{ "name": "_ids", "type": "uint256[]" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "commit_transfer_ownership",
    "inputs": [{ "name": "_new_admin", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "apply_transfer_ownership",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "revert_transfer_ownership",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "admin",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "future_admin",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "num_entries",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "check_id_exists",
    "inputs": [{ "name": "arg0", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "get_id_info",
    "inputs": [{ "name": "arg0", "type": "uint256" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "addr", "type": "address" },
          { "name": "description", "type": "string" },
          { "name": "version", "type": "uint256" },
          { "name": "last_modified", "type": "uint256" }
        ]
      }
    ]
  }
]