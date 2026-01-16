#!/usr/bin/env node

import "dotenv/config";
import React from "react";
import { render } from "ink";
import { App } from "./App.js";

// Clear screen and render app
console.clear();

const { waitUntilExit } = render(<App />);

waitUntilExit().then(() => {
  console.log("\n👋 Thanks for using Bankr CLI!\n");
});
