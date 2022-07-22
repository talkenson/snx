import { User, userPrimaryKey } from "@/models/User.model";
import { useTable } from "@/store/store";
import { PrimaryKeyFillStrategy } from "@/base/types";

export const userStore = useTable<User, typeof userPrimaryKey>(
  "users",
  userPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement }
);

export default userStore;
