import { defineMcp } from "@lovable.dev/mcp-js";
import listPostsTool from "./tools/list-posts";
import getPostTool from "./tools/get-post";
import listCategoriesTool from "./tools/list-categories";

export default defineMcp({
  name: "freigeist-kongress-mcp",
  title: "Freigeist Kongress MCP",
  version: "0.1.0",
  instructions:
    "Read-only access to published articles on the Freigeist Kongress site. Use `list_categories` to see topics, `list_posts` to browse or search articles (optionally by category), and `get_post` to fetch the full body of a single article by id or slug.",
  tools: [listPostsTool, getPostTool, listCategoriesTool],
});
