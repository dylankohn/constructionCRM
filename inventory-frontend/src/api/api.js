// src/api/api.js
const BASE_URL = "http://localhost:3000";

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const addUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const getInventory = async (userId) => {
  const res = await fetch(`${BASE_URL}/inventory/${userId}`);
  return res.json();
};

export const addInventory = async (user_id, item_name, quantity) => {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, item_name, quantity }),
  });
  return res.json();
};
