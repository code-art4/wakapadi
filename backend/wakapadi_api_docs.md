
# 🧾 Wakapadi Backend API Documentation

## 🔐 Authentication API

### `POST /auth/register`
Registers a new user.

- **Public**: ✅  
- **Request Body** (`RegisterDto`)
```json
{
  "email": "user@example.com",
  "username": "exampleUser",
  "password": "password123"
}
```
- **Responses**:
  - `201 Created`: User registered successfully.
  - `400 Bad Request`: Validation error.

---

### `POST /auth/login`
Logs in an existing user and returns a JWT token.

- **Public**: ✅  
- **Throttle**: 5 reqs/min
- **Request Body** (`LoginDto`)
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response** (`AuthResponseDto`)
```json
{
  "access_token": "JWT_TOKEN",
  "user": {
    "id": "userId123",
    "email": "user@example.com",
    "username": "exampleUser"
  }
}
```

---

### `GET /auth/me`
Returns authenticated user’s profile.

- **Auth Required**: ✅  
- **Response**
```json
{
  "id": "userId123",
  "email": "user@example.com",
  "lastActive": "2025-05-25T15:00:00Z"
}
```

---

## 🗨️ Whois Chat API

**All endpoints require Bearer authentication**

### `POST /whois/chat/send`
Sends a message to another user.

- **Request Body** (`SendMessageDto`)
```json
{
  "fromUserId": "userId1",
  "toUserId": "userId2",
  "message": "Hello!"
}
```
- **Response**: Message object from database.

---

### `GET /whois/chat/thread/:userId`
Retrieves chat thread with a user.

- **Params**: `userId` — the ID of the other user  
- **Query** (`GetThreadQueryDto`)
```json
{
  "userId": "userId1",
  "targetUserId": "userId2",
  "page": 1,
  "limit": 20
}
```
- **Response**: Array of messages.

---

### `DELETE /whois/chat/thread/:userId`
Deletes chat thread between authenticated user and target user.

- **Response**
```json
{ "message": "Thread cleared successfully" }
```

---

### `GET /whois/chat/unread-count`
Returns the number of unread messages for the authenticated user.

- **Response**
```json
{ "count": 5 }
```

---

## 🌍 Whois Presence API

### `POST /whois/ping`
Ping to update presence and geolocation.

- **Auth Required**: ✅  
- **Request Body** (`PingPresenceDto`)
```json
{
  "city": "Berlin",
  "coordinates": { "lat": 52.52, "lng": 13.405 },
  "visible": true
}
```
- **Response**: Presence updated confirmation.

---

### `DELETE /whois`
Hides user presence.

- **Auth Required**: ✅  
- **Response**
```json
{ "message": "Presence hidden successfully" }
```

---

### `GET /whois/nearby?city=Berlin`
Returns nearby users in the given city.

- **Auth Optional**: ✅  
- **Query** (`NearbyQueryDto`)
```json
{
  "city": "Berlin",
  "radius": 10
}
```
- **Response** (`NearbyUserResult[]`)
```json
[
  {
    "id": "userId123",
    "city": "Berlin",
    "coordinates": { "lat": 52.52, "lng": 13.405 },
    "lastSeen": "2025-05-25T13:00:00Z",
    "anonymous": false,
    "user": {
      "username": "JaneDoe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "socials": { "instagram": "@janedoe" }
    }
  }
]
```

---

## 🔌 WebSocket Events

| Event               | Direction | Description                              | Payload Example |
|--------------------|-----------|------------------------------------------|-----------------|
| `presence:update`  | → Server  | User updates online status               | `{ city, isOnline }` |
| `message:typing`   | → Server  | Indicates typing                         | `{ toUserId }` |
| `userTyping`       | ← Client  | Recipient notified someone is typing     | `{ userId }` |
| `userStoppedTyping`| ← Client  | Stops typing indication                  | `{ userId }` |
| `message:read`     | → Server  | Marks messages as read                   | `{ messageIds: string[] }` |
| `messagesRead`     | ← Client  | Sender is notified messages were read    | `{ readerId, messageIds }` |
| `userOnline`       | ← Client  | Notifies that a user is now online       | `userId` |
| `userOffline`      | ← Client  | Notifies that a user went offline        | `userId` |

---

## 🛡️ Auth Guard Details

### AuthGuard
- Checks for `Bearer` token in the header.
- Decodes token using JWT.
- Throws `401 Unauthorized` if token is invalid.

### OptionalAuthGuard
- Extends `AuthGuard`.
- Returns `true` even if token is missing or invalid.
