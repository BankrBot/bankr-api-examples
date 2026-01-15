import "dotenv/config";
import { loadConfig } from "../config";
import { createTelegramClient } from "../telegram";
import { registerCommand } from "../cli";

console.log("[DEBUG] list-groups.ts: Module loaded, registering command...");

async function listGroups(): Promise<void> {
  const config = loadConfig();
  const client = createTelegramClient(config.telegram);

  console.log("Connecting to Telegram...\n");

  await client.start({
    phone: () => prompt("Enter phone number: "),
    code: () => prompt("Enter auth code: "),
    password: () => prompt("Enter 2FA password: "),
  });

  const me = await client.getMe();
  console.log(`Logged in as: ${me.firstName} (@${me.username || "no username"})\n`);

  console.log("Fetching chats...\n");

  const groups: { id: number; title: string; type: string }[] = [];

  // Iterate through dialogs
  let debugShown = false;
  for await (const dialog of client.iterDialogs()) {
    // Show first dialog structure for debugging
    if (!debugShown && process.env.DEBUG) {
      console.log("Dialog structure:", JSON.stringify(dialog, null, 2).slice(0, 1000));
      debugShown = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = dialog as any;

    // mtcute Dialog has a `peer` property that is the Chat/User/Channel object
    const peer = d.peer;
    if (!peer) continue;

    // Check the peer's type - it's a Chat subclass
    const peerType = peer.chatType || peer._;

    const isGroup = peerType === "group" || peerType === "supergroup";
    const isChannel = peerType === "channel";

    if (isGroup || isChannel) {
      // peer.id is the chat ID (already in correct format for mtcute)
      const chatId = peer.id;
      const title = peer.title || peer.name || "Untitled";
      const type = peerType;

      groups.push({ id: chatId, title, type });
    }
  }

  if (groups.length === 0) {
    console.log("No groups or channels found.");
  } else {
    console.log("Groups and Channels:\n");
    console.log("ID".padEnd(20) + "Type".padEnd(12) + "Title");
    console.log("-".repeat(60));

    for (const group of groups) {
      console.log(
        group.id.toString().padEnd(20) +
        group.type.padEnd(12) +
        group.title
      );
    }

    console.log(`\nTotal: ${groups.length} group(s)/channel(s)`);
  }

  process.exit(0);
}

function prompt(message: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

registerCommand({
  name: "list-groups",
  description: "List all groups/channels you're in with their IDs",
  run: listGroups,
});

console.log("[DEBUG] list-groups.ts: Command registered successfully");
