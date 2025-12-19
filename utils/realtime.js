// utils/realtime.js
// Simple in-memory SSE connections: userId -> Set(res)

const clients = new Map();

export const addClient = (userId, res) => {
  const id = Number(userId);
  if (!clients.has(id)) clients.set(id, new Set());
  clients.get(id).add(res);
};

export const removeClient = (userId, res) => {
  const id = Number(userId);
  const set = clients.get(id);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(id);
};

export const pushToUser = (userId, event, data) => {
  const id = Number(userId);
  const set = clients.get(id);
  if (!set) return;

  const payload =
    `event: ${event}\n` +
    `data: ${JSON.stringify(data)}\n\n`;

  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      // ignore broken connections
    }
  }
};
