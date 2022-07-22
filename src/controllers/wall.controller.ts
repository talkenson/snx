import { wallStore } from "@/store/wall.store";
import { Controller } from "@/types";
import { createController } from "@/common/createController";
import { WallPost } from "@/models/Wall.model";

export const registerWallController: Controller = createController({
  scope: "wall",
  requireAuth: true,
  transport: ["rest", "ws"],
  register: (addListener) => {
    addListener<WallPost>(
      "createPost",
      (resolve, reject, context) => (item) => {
        const result = wallStore.create(item);
        resolve(result);
      },
      ["rest"]
    );

    addListener(
      "get",
      (resolve, reject, context) =>
        ({ target }: { target: number }) => {
          resolve({ content: wallStore.get(target), context });
        }
    );

    addListener("list", (resolve, reject, context) => () => {
      resolve(wallStore.dumpToArray());
    });
  },
});
