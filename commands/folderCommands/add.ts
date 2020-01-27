import { Message } from "discord.js";
import RoleBot from "../../src/bot";
import { rolesByFolderId, giveFolderId } from "../../src/setup_table";

export default {
  desc: "Delete a folder. EG: `@RoleBot folder -add 3 1,2,3,4`",
  name: "-add",
  args: "<folder id> <list of role id's>",
  type: "reaction",
  run: (message: Message, args: string[], client: RoleBot): void => {
    if (!message.guild || !message.member!.hasPermission(["MANAGE_ROLES"])) {
      message.react("❌");
      return;
    }
    const GUILD_ID = message.guild.id;

    if(!args.length) return;

    const FOLDERS = client.guildFolders.get(GUILD_ID);
    const FOLDER_ID = Number(args[0]);

    if(!FOLDERS) {
      message.channel.send("No folders to add to.").then(m => setTimeout(() => m.delete(), 5000));
      return;
    }

    if (Number.isNaN(FOLDER_ID) || FOLDER_ID < 0 || FOLDER_ID >= FOLDERS.length) {
      message.channel.send("Incorrect folder ID given. Try running `@RoleBot folders`").then(m => setTimeout(() => m.delete(), 5000));
      return;
    }

    args.shift();

    const folder = client.folderContents.get(FOLDERS[FOLDER_ID].id);

    if(!folder) throw new Error("Folder not found, cannot add roles");

    const FOLDERLESS_ROLES = rolesByFolderId(GUILD_ID, null);
    const SIZE = FOLDERLESS_ROLES.length;

    // join them together
    let role_ids = args.join("").split(",").map(n => Number(n));

    if(!role_ids) {
      message.channel.send("No role ID's given.");
      return;
    }

    // Filter out all the bad shit
    let ids = role_ids.filter(n => ((n < SIZE && n >= 0) && !Number.isNaN(n)));

    ids = [...new Set(ids)]; // remove duplicates

    if(!ids.length) {
      message.channel.send("No correct ID's given.");
      return;
    }


    for(const id of ids) {
      const role = FOLDERLESS_ROLES[id];
      folder.roles.push(role);
      giveFolderId(role.role_id, folder.id);
    }

    message.channel.send(
      `Added roles${ids.map(i => ` \`${FOLDERLESS_ROLES[i].role_name}\``)} to folder \`${folder.label}\``
    )
  }
};