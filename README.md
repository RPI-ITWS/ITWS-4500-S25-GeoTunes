# ITWS-4500-S25-GeoTunes
# GeoTunes


**GeoTunes** is a dynamic web application that lets users explore global cities through the lens of music, events, and culture. Using geolocation and city search, GeoTunes delivers a curated Spotify playlist, localized event listings, and fun facts for any city. Users can create accounts, save their favorite events, and maintain personalized profiles.

[Live App](https://team4156208.eastus.cloudapp.azure.com/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [User Endpoints](#user-endpoints)
  - [City & Event Endpoints](#city--event-endpoints)

---

## Features

- Spotify integration for city-based music playlists
- Interactive map with reverse geolocation and manual city search
- City-specific event listings with “Save” functionality
- User authentication (signup/login/logout)
- Personalized profiles with saved events and account management
- City info facts pulled from a custom database
- Add new songs and leave city-based reviews

---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla + React for dynamic rendering)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **External APIs**: Spotify API, Leaflet.js

---


## Configuration

GeoTunes uses environment variables for sensitive data like MongoDB URI and JWT secret.

To run the server simply start the Azure VM and go to the base URL. This will automatically start the server.

Base URL: https://team4156208.eastus.cloudapp.azure.com/

---

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` – Create a new user
- `POST /api/auth/login` – Log in a user

### User Endpoints

- `GET /api/user/profile` – Retrieve user profile
- `PUT /api/user/profile` – Update user profile
- `DELETE /api/user/profile` – Delete user account
- `GET /api/user/events` – Get saved events
- `POST /api/user/events` – Save an event
- `DELETE /api/user/events/:id` – Remove a saved event

### City & Event Endpoints

- `GET /playlist?city=CityName` – Get city playlist
- `GET /info?city=CityName` – Get city information
- `GET /events?city=CityName` – Get city events

### Team
Created by Harry Hargreaves, Izik Bakhshiyev, Isaac Lee, Dure Mehmood, and Cooper Kelly in ITWS-4500 Web Science Systems Development

[Scrum Log](/miscWork/GeoTunes%20Scrum%20Backlog.pdf)

