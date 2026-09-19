# ⚡ SKILLO
### Hyperlocal On-the-Go Emergency & Skill Dispatch Network
> Built with **React Native (Expo)**, **AWS Serverless (SAM + Lambda + DynamoDB)**, and **Open-Source Tools**.

---

## 📌 1. The Problem
When a roadside breakdown, medical distress, or urgent manual situation occurs:
- Help is often sitting in a car, train, or cafe just **500 meters away** (a travelling doctor, an off-duty mechanic, an emergency electrician, or someone available for quick 1-hour physical help).
- Traditional gig platforms force static vendor locations, high 20–30% platform commissions, and delayed scheduling.
- **There is no real-time way to ping and dispatch travelling, verified skilled responders nearby in expanding radius rings.**

---

## 💡 2. The Solution
**Skillo** turns travelling skilled individuals into a roaming safety net:
1. **Multi-Skill Emergency & Task Support:**
   - 🩺 **Doctor / Medical Emergency**: CPR, accident triage, first-aid.
   - 🔧 **Roadside Mechanic**: Flat tyres, battery jumps, engine stalling, towing.
   - ⏱️ **Quick Manual Help (1-hour)**: Emergency luggage moving, short-duration lifting/shifting.
   - ⚡ **Electrician / 🚰 Plumber**: Emergency short-circuit or pipe burst.
2. **Progressive Geo-Scan (2km $\to$ 4km $\to$ 6km):**
   - Automatically scans within **2 km**. If no responder accepts within 20 seconds, the radius seamlessly expands to **4 km**, then **6 km**.
3. **Instant Handshake & Zero Commission:**
   - The first available responder to accept unlocks direct phone contact, WhatsApp messaging, and live location coordinates.
   - Seekers pay responders directly (Cash / UPI QR) with **0% platform commission**.
4. **Trust & Verification:**
   - Aadhaar e-KYC verified badges (`UIDAI_GOV_VERIFIED`).
   - Mutual 1–5 ⭐ rating score recorded in AWS DynamoDB for both Seekers and Helpers.
   - Minimal ₹49/mo platform subscription model for helpers.

---

## ☁️ 3. Where AWS Fits (Architecture)

```mermaid
flowchart TD
    A["📱 Skillo Mobile App (React Native / Expo)"] -->|"REST HTTPS / API Requests"| B["🌐 AWS API Gateway"]
    B -->|"Event Trigger"| C["⚡ AWS Lambda (Python 3.12 Serverless Handler)"]
    C -->|"CRUD & Geo Queries"| D[("🗄️ Amazon DynamoDB")]
    
    subgraph DynamoDB Tables
        D1["Table: SkilloUsers (Helpers, Skills, Ratings, Aadhaar)"]
        D2["Table: SkilloRequests (Seeker GPS, Radius 2-4-6km, Status)"]
    end

    D --> D1
    D --> D2
    C -->|"Progressive Haversine Ring Calculation"| E["📡 2km ➔ 4km ➔ 6km Dispatch Engine"]
    E -->|"Instant Handshake Response"| A
```

- **AWS SAM (Serverless Application Model)**: Defines Infrastructure as Code (`template.yaml`).
- **AWS Lambda (Python 3.12)**: Handles stateless request routing, Haversine geospatial radius computation, and Aadhaar OTP verification.
- **Amazon DynamoDB**: Low-latency NoSQL database storing roaming helper coordinates, active request lifecycle, and mutual rating scores.
- **LocalStack / SAM CLI**: Enables local zero-cost cloud emulation on Windows/Linux without AWS billing.

---

## 🛠️ 4. Open-Source Tools Used
- **React Native (Expo)**: Cross-platform mobile client for Android, iOS, and Web.
- **OpenStreetMap / MapLibre**: Open-source, zero-cost map tiles and location visualization.
- **AWS SAM CLI & LocalStack**: Open-source tooling for running and testing serverless AWS infrastructure locally.
- **Python 3.12 Standard Library**: Math/Haversine calculations without heavy external GIS dependencies.

---

## 🚀 5. Quick Start Guide

### Step 1: Start the AWS Serverless Backend
```bash
cd skillo-backend
python dev_server.py
```
*(Runs at `http://localhost:3000`. You can also run `sam local start-api` with Docker).*

### Step 2: Start the Mobile App
```bash
cd skillo-app
npm install
npm run web
```
- Press **`w`** in the terminal to view in your browser.
- Or install the **Expo Go** app on your phone and scan the terminal QR code.

---

## 🧪 6. Testing Key Flows

1. **Broadcast Request (Seeker Mode)**:
   - On the Home screen (`/`), select **"Doctor / Medical Emergency"** or **"Quick Manual Help"**.
   - Tap **"Broadcast Now"**.
   - Watch the radar scan ring 1 (2 km) and find travelling responders with ratings and Aadhaar badges.
2. **Instant Handshake**:
   - Tap **"Request & Instant Handshake"**.
   - View direct responder contact details, Call / WhatsApp buttons, and peer-to-peer payment notice.
   - Submit a **5-Star Rating** to update the AWS database score.
3. **Helper & Aadhaar Verification (`/explore`)**:
   - Toggle **Duty Mode (Online/Offline)**.
   - Enter a 12-digit Aadhaar number and test OTP `123456` to receive the official `UIDAI_GOV_VERIFIED` badge.
