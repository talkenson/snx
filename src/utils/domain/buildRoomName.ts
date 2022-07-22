const roomPrefix = "room";
export const buildRoomName = (roomId: number | string) =>
  `${roomPrefix}:${roomId}`;
