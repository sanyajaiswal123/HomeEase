# Product Requirement Document (PRD)

## Project Name: HomeEase

---

## 1. Problem Statement

Finding trusted, high-quality household help (electricians, plumbers, maids, AC technicians, carpenters, painters, and cleaners) remains highly fragmented. The current marketplace suffers from several critical pain points:

1. **Lack of Trust**: Customers are hesitant to invite unverified technicians into their homes due to safety concerns and variable quality.
2. **Opaque Pricing**: Absence of clear, upfront rate cards leading to haggling, sudden price hikes, or unexpected post-service charges.
3. **Imprecise Issue Identification**: Customers often lack the technical terminology to describe their issues, resulting in booking the wrong service category or technicians arriving under-equipped.
4. **Poor Tracking**: Lack of real-time ETA updates forces customers to wait at home indefinitely for the provider to arrive.

---

## 2. Goals & Objectives

HomeEase aims to establish a trusted, AI-powered on-demand household service platform modeled after leading services like Urban Company, with advanced AI assistance and location-tracking systems:

- **Establish Absolute Trust**: All service providers are background-checked and must pass administrative validation before entering the marketplace.
- **Transparent Flat Pricing**: Implement upfront base rates and clear add-on menus to eliminate pricing disputes.
- **AI-Guided Problem Diagnostics**: Leverage Large Language Models (LLMs) to help customers describe, categorize, and diagnose household issues prior to booking.
- **Real-Time Job Syncing**: Provide live location updates on a map interface, creating a transparent, Uber-like arrival experience.

---

## 3. Target User Personas

### 3.1 Customer (End User)

- **Profile**: Busy professionals, homeowners, or tenants requiring quick, dependable fixes.
- **Needs**: Accurate cost estimates, clear safety instructions, prompt arrivals, and easy payments.
- **Key Pain Point**: Anxious about safety and overcharging.

### 3.2 Service Provider (Technician)

- **Profile**: Local tradespeople (electricians, cleaners, painters, etc.) seeking steady job requests.
- **Needs**: Simplified scheduling, job board notifications, routing tracking help, and transparent payout ledger sheets.
- **Key Pain Point**: Irregular income and poor communication.

### 3.3 Platform Administrator (Admin)

- **Profile**: Internal operations personnel.
- **Needs**: Complete dashboard auditing platform metrics, provider application verification queues, and service management panels.

---

## 4. Key Platform Features

| Feature Module                  | Description                                                                                                                                    |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Onboarding & RBAC**      | Custom signup panels separating customer roles from provider requirements (experience, rates, service category). Secured by JSON Web Tokens.   |
| **Service Discovery & Search**  | Highly responsive, visual cards showcasing primary service sectors with dynamic keyword filters.                                               |
| **AI Diagnostic Chatbot**       | Persistence console analyzing user descriptions (powered by Gemini AI) to suggest correct categories, emergency precautions, and price ranges. |
| **Stepper Checkout Engine**     | 3-step checkout flow (Add-ons Select $\rightarrow$ Schedule Slot $\rightarrow$ Mock Sandbox Payments checkout).                                |
| **Live Leaflet Tracking Radar** | Interactive map rendering customer coordinate anchor points and dynamically moving provider icons via WebSockets.                              |
| **Technician Job Board**        | Open board list where nearby certified providers can view details and claim pending orders.                                                    |
| **Aggregate Review Compiler**   | Reviews form parsing comments to calculate overall provider rating stars and compile automated text summaries.                                 |
| **Commissions Dashboard**       | Aggregates income ratios (80/20 platform cut ledger) for administrators and providers.                                                         |

---

## 5. Functional Requirements

### 5.1 Authentication & Profile Module

- **FR-AUTH-01**: Users must register with Name, Email, Password, Phone, and Address.
- **FR-AUTH-02**: Providers must choose a primary service speciality, input experience years, and upload documentation.
- **FR-AUTH-03**: Password storage must be secured via bcrypt hashing on save pre-hooks.
- **FR-AUTH-04**: Role-Based Access Control must block customers, providers, and admins from accessing mismatched panels.

### 5.2 Service & Booking Engine

- **FR-BOOK-01**: Customers must choose service packages and optionally check sub-service add-ons with automated cost aggregation.
- **FR-BOOK-02**: System must generate a unique 4-digit start OTP upon booking validation.
- **FR-BOOK-03**: The booking workflow states must transition as follows: `pending` $\rightarrow$ `accepted` $\rightarrow$ `in_progress` $\rightarrow$ `completed` or `cancelled`.
- **FR-BOOK-04**: Provider must input the correct customer OTP to shift status to `in_progress`.

### 5.3 AI Diagnostics (Gemini Integration)

- **FR-AI-01**: System must accept natural language problem descriptions and request structured JSON output from Gemini models.
- **FR-AI-02**: If the Gemini API is offline/unreachable, system must trigger a regex keyword fallback parser.
- **FR-AI-03**: Gemini must analyze review comment texts to identify sentiment (positive, neutral, negative).
- **FR-AI-04**: Gemini must automatically summarize recent technician reviews to populate a bio statement.

### 5.4 Live Coordinates WebSocket Radar

- **FR-MAP-01**: The tracking page must load OpenStreetMap tile renders utilizing Leaflet container wrappers.
- **FR-MAP-02**: Providers in `in_progress` state must automatically emit coordinate updates to the server socket.
- **FR-MAP-03**: The server must broadcast location coordinates to all connected clients in the corresponding booking room.

### 5.5 Admin Control Panels

- **FR-ADM-01**: Admins must have an application verification queue.
- **FR-ADM-02**: Verify action must shift `isVerified` to `true`, making the provider visible in customer queries.

---

## 6. Non-Functional Requirements

### 6.1 Security

- **NFR-SEC-01**: JWT authorization tokens must be sent via Bearer headers on all requests.
- **NFR-SEC-02**: Express error handlers must sanitize stack traces in production logs.

### 6.2 Performance & Scalability

- **NFR-PERF-01**: Service search queries must return results under 200ms.
- **NFR-PERF-02**: WebSocket state syncing latency must be lower than 500ms.
- **NFR-PERF-03**: Frontend single page application assets must bundle in an optimized bundle footprint.

### 6.3 Usability & Theme Aesthetics

- **NFR-UI-01**: The client interface must support responsive scaling on mobile, tablet, and desktops.
- **NFR-UI-02**: Colors and fonts must respect CSS variables (` Outfit`, `Plus Jakarta Sans`) supporting glassmorphic backdrops and micro-animations.

---

## 7. User Stories

### 7.1 Customer Journey

1. _As a customer whose kitchen pipe is leaking, I want to type my issue in my own words so I can find out what kind of repair I need and how much it will cost._
2. _As a customer, I want to track the technician on a map in real-time so I know exactly when they will arrive at my door._
3. _As a customer, I want to hand over an OTP only when the technician arrives, ensuring they cannot start the billing clock prematurely._

### 7.2 Service Provider Journey

1. _As an electrician, I want to view unassigned electrical bookings in my city so that I can accept jobs matching my schedule._
2. _As a plumber, I want to track my gross earnings and commission cuts in a consolidated payout table so I can review my monthly income._

### 7.3 Admin Journey

1. _As a platform administrator, I want to review submitted document profiles of new applicant providers so I can approve and verify them for customer hire._

---

## 8. Key Success Metrics

- **Marketplace Conversions**: Percentage of page visits translating to completed services.
- **AI Diagnostics Precision**: Success rate of matching user descriptions to the correct category (targeted at >90%).
- **Technician Verification Cycle**: Time taken for an administrator to approve new technician credentials (target: <24 hours).
- **Customer Satisfaction (CSAT)**: Percentage of positive sentiment reviews compiled by the AI engine.

---

## 9. Key Risks & Mitigations

| Risk Identified                      | Criticality | Mitigation Strategy                                                                                                                        |
| :----------------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **API Limit Caps (Gemini Key)**      | High        | Implementation of a robust keyword fallback engine that parses text string tokens locally if the Gemini server returns errors or timeouts. |
| **Map Asset Broken Renders**         | Medium      | Overriding default PNG pins with Leaflet HTML-customized `divIcon` pins to avoid Vite loader resolution issues.                            |
| **Simulated Movement Interruptions** | Low         | Utilizing isolated WebSocket room bindings so location streams do not cross-talk or flood unassigned users.                                |

---

## 10. Future Project Scope

- **Real Payment Gateways**: Integration of production Stripe or Razorpay API interfaces with real-time webhooks.
- **Mobile Native GPS Integration**: Deployment of React Native packages accessing actual hardware geolocations instead of mock math simulations.
- **Technician Routing Optimizations**: Implementing pathfinding algorithms (such as Dijkstra or A*) to assign incoming requests to the absolute closest provider based on street grid traffic data.
