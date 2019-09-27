const fs = require("fs");
const dir = require("node-dir");

const LATEST_VERSION = "v1";

function mkdb_v1() {
  return new Promise((resolve, reject) => {
    console.log("Info: Scanning for app manifests.\n");
    try {
      var apps_list = [];
      const files = dir.files("apps", {sync: true});
      for(var file of files) {
        if(file.split("\\").slice(-1)[0] == "manifest.webapp") {
          console.log("Info: Found manifest: "+file);
          data = fs.readFileSync(file);
          const manifest = JSON.parse(data);
          const app_info = {"app_name": manifest["name"],
                            "app_version": manifest["version"]};
          if(manifest["developer"]["name"]) {
            app_info["app_author"] = manifest["developer"]["name"];
          }
          if(manifest["description"]) {
            app_info["app_description"] = manifest["description"];
          }
          apps_list.push(app_info);
        }
      }
      resolve(apps_list);
    } catch (err) {
      reject(err);
    }
  });
}

console.log("[AlterStore app database generator - (C) jkelol111 2019]");

console.log("\nInfo: Attempting to read AlterStore manifest.");
fs.readFile("ALTERSTORE.json", (err, data) => {
  try {
    if(err) throw err;
    const compatVersion = JSON.parse(data)["compat_client_version"];
    if(compatVersion == LATEST_VERSION) {
      console.log("\nInfo: Making app database for version: %s.", LATEST_VERSION);
      mkdb_v1().then((list) => {
        fs.writeFileSync("apps/apps.json", JSON.stringify(list));
      }).catch((err) => {
        throw err;
      });
    } else if(compatVersion == "v1") {
      mkdb_v1().then((list) => {
        fs.writeFileSync("apps/apps.json", JSON.stringify(list));
      }).catch((err) => {
        throw err;
      });
    }
    console.log("\nInfo: App database generated successfully.")
  } catch(err) {
    console.error("\n"+err);
    process.exit();
  }
});
