# 🎬 Hackathon Submission & 3-Minute Video Script

> **Crucial Rule Reminder from Hackathon Guidelines:**
> *"Your project has to use AWS, and your demo video has to show it. Naming AWS in the writeup alone is not enough. Video must be under 3 minutes and uploaded to YouTube (Unlisted/Public)."*

---

## ⏱️ Exact 3-Minute Video Recording Timeline

| Time | What to Show on Screen | What to Say (Voiceover Script) |
| :--- | :--- | :--- |
| **0:00 - 0:35** | **Slide / Title Screen + Problem Statement**<br>Show `skillo-app` Home screen on browser or mobile. | *"Hello judges! This is Skillo — an on-the-go hyperlocal skill and emergency dispatch network. When an emergency strikes — like a vehicle breakdown or a sudden medical distress — help is often sitting in a car 500 meters away: a travelling doctor, a mechanic, or an electrician. Traditional apps fail here because they rely on static shops and 30% commission. Skillo connects people in distress with roaming, verified helpers in expanding radius rings."* |
| **0:35 - 1:15** | **Live Seeker Flow & 2km $\to$ 4km $\to$ 6km Scan**<br>Click **"Doctor / Medical Emergency"**, tap **"Broadcast Now"**, show the **Searching Radar screen**. | *"Let's demonstrate a live request. A citizen needs an emergency doctor. They tap 'Broadcast Now'. Our system kicks off our progressive radius search — scanning within 2 km, automatically expanding to 4 km and 6 km if needed. Instantly, it discovers available verified helpers: Dr. Aarav Mehta, 0.22 km away, rated 4.9 stars with an Aadhaar-verified badge!"* |
| **1:15 - 1:50** | **Instant Handshake & Direct Settlement**<br>Click **"Request & Instant Handshake"** to open `matched` screen. Show Call, WhatsApp, and Rating stars. | *"Once connected, an instant handshake occurs! Both parties unlock direct phone call and WhatsApp access. Payment is direct peer-to-peer with zero platform commission. After the service, the seeker gives a 5-star rating, which dynamically updates the helper's score in our backend database."* |
| **1:50 - 2:20** | **Helper Mode & Aadhaar Verification**<br>Switch to the **Helper Mode tab (`/explore`)**. Show the duty switch, ₹49 subscription badge, and demo Aadhaar OTP verification. | *"For service providers, helpers toggle their roaming duty mode on or off. They subscribe for a minimal ₹49/month platform fee. To guarantee safety, helpers undergo Aadhaar e-KYC verification. Entering an Aadhaar number and OTP immediately awards the UIDAI verified badge, ensuring 100% trust during roadside or medical emergencies."* |
| **2:20 - 2:55** | **Show AWS Architecture in Action (Mandatory Requirement!)**<br>Switch to VS Code showing `template.yaml` and terminal with `python dev_server.py` / `sam local start-api` logs. | *"Here is where AWS fits: Our backend is built completely on AWS Serverless with AWS SAM. We define our architecture as code in template.yaml with AWS Lambda running Python 3.12, Amazon API Gateway, and Amazon DynamoDB tables for Users and Requests. Lambda computes our Haversine geospatial radius expansion with zero idle cost. We tested this locally using SAM CLI and LocalStack."* |
| **2:55 - 3:00** | **Closing** | *"Skillo: Saving lives and providing instant help on the go powered by AWS. Thank you!"* |

---

## 📝 Short Writeup for Submission Form (Copy-Paste Ready)

### Problem
In critical roadside vehicle breakdowns or medical emergencies, immediate help is often nearby (travelling mechanics, doctors, electricians, or people willing to provide 1-hour manual assistance), but there is no mechanism to locate or dispatch mobile professionals on the go. Traditional service apps are centralized, require days of booking, and take high platform fees.

### The Build
We built **Skillo**, a mobile application using **React Native (Expo)**, **OpenStreetMap**, and **Python 3.12**. It features:
- Multi-skill emergency selector (Doctor, Roadside Mechanic, 1-Hour Manual Help, Electrician, Plumber).
- Progressive 2km $\to$ 4km $\to$ 6km geospatial radius dispatch.
- Direct peer-to-peer settlement (0% commission).
- UIDAI Aadhaar e-KYC verification sandbox and mutual 5-star rating scores.
- Minimal ₹49/month helper subscription model.

### Where AWS Fits
- **AWS SAM (Serverless Application Model)**: Manages our serverless infrastructure as code.
- **AWS Lambda**: Powers our stateless API microservices and progressive Haversine geospatial radius computation engine.
- **Amazon DynamoDB**: Stores roaming helper coordinates, active distress requests, and dynamic rating scores with single-digit millisecond latency.
- **Amazon API Gateway**: Routes client requests with CORS support to Lambda functions.
- **LocalStack & SAM CLI**: Allowed us to develop, emulate, and test our AWS cloud services locally with zero cloud bill.
