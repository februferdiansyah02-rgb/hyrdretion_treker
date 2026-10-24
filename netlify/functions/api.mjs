 
import "dotenv";
import "@supabase/supabase-js";
import { requireAuth } from "../../backend/middleware/auth.js";
import drinks from "../../backend/controlers/drinkcontroler.js";
import notes from "../../backend/controlers/notescontroler.js";
import reminders from "../../backend/controlers/remindcontroler.js";
import push from "../../backend/controlers/pushcontroller.js";
 
process.env.DEV_AUTH_BYPASS = "false";
 
const routes = [
  ["GET", "/api/drinks", drinks.getDrinks],
  ["POST", "/api/drinks", drinks.addDrink],
  ["DELETE", "/api/drinks/:id", drinks.deleteDrink],

  ["GET", "/api/notes", notes.getNotes],

  ["GET", "/api/reminders/due", reminders.getDueReminders],
  ["GET", "/api/reminders/history", reminders.getHistory],
  ["GET", "/api/reminders/auto", reminders.getAutoReminder],
  ["PUT", "/api/reminders/auto", reminders.updateAutoReminder],
  ["POST", "/api/reminders/reset/:id", reminders.resetReminderFired],
  ["GET", "/api/reminders", reminders.getReminders],
  ["POST", "/api/reminders", reminders.createReminder],
  ["PUT", "/api/reminders/:id", reminders.updateReminder],
  ["DELETE", "/api/reminders/:id", reminders.deleteReminder],

  ["GET", "/api/push/vapid-public-key", push.getVapidPublicKey],
  ["POST", "/api/push/subscribe", push.saveSubscription],
  ["POST", "/api/push/test", push.testPush],
];
 
const matchPath = (pattern, pathname) => {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");
  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
};
 
const createResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res.body = body;
      return res;
    },
  };
  return res;
};

const toResponse = (res) => Response.json(res.body ?? {}, { status: res.statusCode });

export default async (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  let handler;
  let params = {};
  for (const [method, pattern, routeHandler] of routes) {
    if (method !== request.method) continue;
    const match = matchPath(pattern, pathname);
    if (match) {
      handler = routeHandler;
      params = match;
      break;
    }
  }

  if (!handler) {
    return Response.json({ message: "Endpoint tidak ditemukan" }, { status: 404 });
  }

  const body = ["POST", "PUT"].includes(request.method)
    ? await request.json().catch(() => ({}))
    : {};

  const req = {
    headers: { authorization: request.headers.get("authorization") || "" },
    params,
    query: Object.fromEntries(url.searchParams),
    body,
  };
  const res = createResponse();

  try {
    let authorized = false;
    await requireAuth(req, res, () => {
      authorized = true;
    });
    if (!authorized) return toResponse(res);

    await handler(req, res);
    return toResponse(res);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
};

export const config = {
  path: "/api/*",
};
