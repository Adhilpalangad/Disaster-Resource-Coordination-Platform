# PROJECT CONTEXT

# Project Name

Disaster Resource Coordination Platform (Working Title)

---

# Project Overview

This project is a production-ready MERN web application built for a hackathon.

The goal is to improve disaster response by connecting affected citizens, NGOs, volunteers, shelters, donors, and administrators through a single coordinated platform.

The platform is not designed to predict or prevent disasters.

Its purpose is to coordinate relief efforts after a disaster has occurred.

The application should be designed as if it will eventually serve thousands of users during real disaster situations.

---

# Problem Statement

During floods, landslides, earthquakes, cyclones and other disasters, information becomes scattered across multiple platforms such as WhatsApp, Facebook, phone calls and local community groups.

Victims struggle to find help.

NGOs struggle to identify genuine requests.

Volunteers cannot efficiently coordinate.

Shelter availability changes rapidly.

Resource tracking becomes difficult.

The platform centralizes these operations into one coordinated system.

---

# Target Users

## Citizen

People affected by disasters.

They can

- View active disasters
- Submit relief requests
- Track request status
- Receive notifications

---

## NGO

Organizations providing relief.

They can

- Verify requests
- Accept requests
- Manage inventory
- Assign volunteers
- Update delivery progress

---

## Volunteer

Individuals helping NGOs.

They can

- View assigned tasks
- Accept assignments
- Update delivery status
- Mark tasks completed

---

## Administrator

System administrators.

They can

- Create disasters
- Manage users
- Verify NGOs
- Monitor platform activity
- View analytics

---

# Core Features

## Authentication

- Register
- Login
- JWT Authentication
- Role Based Access
- Logout

---

## Disaster Management

Administrators create disasters.

Each disaster contains

- Title
- Type
- Severity
- Status
- Location
- Description

---

## Relief Request

Citizens submit requests for assistance.

A request belongs to one disaster.

Every request contains

- Category
- Description
- Priority
- Location
- Image
- Contact Number
- Status

Default Status

Pending Verification

---

## Verification

NGOs or Administrators verify requests.

Possible Status

Pending

Verified

Rejected

Only verified requests continue through the workflow.

---

## Shelter Management

Shelters contain

- Name
- Capacity
- Current Occupancy
- Available Resources

---

## Inventory

NGOs manage

- Food
- Water
- Medicine
- Clothing
- Rescue Equipment

Inventory updates automatically after resource allocation.

---

## Volunteer Management

Volunteers receive tasks from NGOs.

Task Status

Assigned

Accepted

In Progress

Completed

---

## Assignment System

Verified Requests

↓

NGO Accepts

↓

Volunteer Assigned

↓

Resources Delivered

↓

Request Closed

---

## Dashboard

Dashboard displays

- Active Disasters
- Pending Requests
- Verified Requests
- Available Volunteers
- Shelter Capacity
- Resource Inventory

---

# Tech Stack

Frontend

- React
- TypeScript
- Vite
- React Router
- Axios

Backend

- Express
- TypeScript
- MongoDB Atlas
- JWT

Cloud

- Cloudinary

Containerization

- Docker
- Docker Compose

Version Control

- Git
- GitHub

---

# Project Architecture

Feature-based architecture.

Every backend feature contains

controller

service

routes

model

validation

Example

src/features/requests/

controller.ts

service.ts

routes.ts

model.ts

validation.ts

---

Frontend Architecture

src/

components/

layouts/

pages/

hooks/

services/

types/

utils/

features/

Each feature owns its own pages, hooks, API calls and components whenever possible.

Avoid placing feature-specific code inside shared folders.

---

# Design Principles

The application should resemble a professional SaaS dashboard.

Avoid creating portfolio-style landing pages.

Avoid oversized hero sections.

Avoid excessive gradients.

Avoid random cards.

Prioritize

- Simplicity
- Accessibility
- Readability
- Mobile Responsiveness
- Consistency

---

# Color Palette

Primary

Reliable Blue

Secondary

Slate Gray

Success

Green

Warning

Amber

Danger

Red

Background

Light Gray

Cards

White

---

# Coding Standards

Use TypeScript.

Avoid using any.

Use reusable components.

Avoid duplicated logic.

Prefer composition over repetition.

Use meaningful variable names.

Keep functions small.

Write scalable code.

---

# API Standards

Every API response should follow this format.

Success

{
  "success": true,
  "message": "",
  "data": {}
}

Failure

{
  "success": false,
  "message": "",
  "errors": []
}

---

# Current Development Phase

The project is under active development.

Core architecture is established.

Individual modules are being developed independently.

Developers should never redesign the entire application while implementing one feature.

Implement only the assigned module.

---

# Instructions For AI

Before generating any code

Understand the existing architecture.

Understand future scalability.

Never generate isolated demo components.

Never redesign unrelated pages.

Do not change folder structure.

Do not remove existing functionality.

Generate production-quality code.

When implementing a feature

1. Explain your approach.

2. List files to be created or modified.

3. Wait for confirmation if architectural changes are required.

4. Generate code only for the requested feature.

Always assume additional modules will be added later.

Maintain consistency throughout the application.