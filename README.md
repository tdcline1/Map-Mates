# 🌎 MapMates

## Overview

MapMates is a full-stack web application that allows authenticated users to share and discover travel destinations. Built with a React frontend and a Django REST Framework (DRF) backend, the app features an interactive Mapbox GL map at its core. The user interface is designed with a clean, modal-first approach, creating a seamless experience for exploring and adding new locations.

***

## ✨ Features

* **Interactive Map:** A dynamic Mapbox map that displays all user-submitted travel destinations.
* **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
* **Create & Share:** Authenticated users can add new places, including descriptions and images.
* **Explore Destinations:** Clicking on a map marker opens a detailed modal view of the location with a gallery of images.
* **Seamless UI:** A modal-based interface layered on top of the map for an uninterrupted user flow.

***

## 🛠️ Technical Implementation

### 1. Authentication & Authorization

Authentication is handled via token-based security using `djangorestframework-simplejwt`.

* **Backend:** The DRF backend provides endpoints for user registration, login, and logout, built upon a `CustomUser` model for future scalability.
* **Frontend:** The React application centralizes authentication state management using **React Context**. This approach avoids prop drilling and provides a single source of truth for the user's authentication status. The context manages:
    * JWT token storage and validation.
    * An automatic token refresh mechanism using an Axios interceptor. When an access token expires, the interceptor seamlessly requests a new one with the refresh token.
    * A periodic interval to proactively refresh tokens before they expire.

### 2. Interactive Map with Mapbox GL

The core of MapMates is its interactive map, powered by **Mapbox GL**.

* **Performance:** The map component remains mounted in the background to prevent re-initialization, delivering a smooth user experience and limiting api usage costs.
* **Security:** The Mapbox API token is securely managed using environment variables, and the tokens are scoped to only allow requests from trusted domains.
* **Dynamic Markers:** Markers on the map are dynamically generated from location data fetched from the backend. Clicking a marker triggers a modal with detailed information and images.

### 3. Backend API & Data Handling

The backend was built to handle complex data relationships, especially between places and their associated images.

* **Nested Serializers:** The most intricate part of the backend involves nested serializers for the `Place` and `PlaceImage` models.
    * For **read operations**, places are serialized into **GeoJSON** format, which is optimized for rendering on Mapbox. This includes essential popup information like the title and a thumbnail image.
    * For **write operations** (create/update), the application accepts `multipart/FormData` to handle image file uploads alongside textual data. A custom `.update()` method in the `PlaceDetailView` was implemented to correctly process this data, distinguishing between new, existing, and removed images.

* **Database Optimization:** To prevent N+1 query problems and improve performance, database queries are optimized using Django's `select_related` and `prefetch_related` methods. This allows related `author` and `images` data to be fetched in a minimal number of queries.

    ```python
    # Efficiently fetches a Place with its author and all related images
    queryset = Place.objects.select_related("author").prefetch_related("images")
    ```
    * `select_related("author")`: Uses a SQL `JOIN` to fetch the related author in the same database query.
    * `prefetch_related("images")`: Performs a separate query for the related images and joins them in Python, which is ideal for many-to-one relationships.

### 4. Frontend Form Management

The React frontend includes robust form handling to accommodate both creating new places and editing existing ones. The logic correctly assembles the `FormData` payload, managing image states to align with the backend's expectations for create and update operations.

***

## 🚀 Performance & Optimization

* **Efficient Database Queries:** The use of `select_related` and `prefetch_related` significantly reduces the database load.
* **Optimized Map Rendering:** By keeping the Mapbox map persistently mounted, the application avoids the performance cost of frequent re-initializations.
* **Minimal Dependencies:** A deliberate choice to use a minimal number of third-party libraries helps maintain control over performance and bundle size.

***

## ✅ Testing & Reliability

The backend's reliability is ensured through a suite of unit and integration tests written using Django's `TestCase` and DRF's `APITestCase`. These tests cover:

* Model creation and validation.
* API view responses and HTTP status codes.
* Serializer logic, including nested create and update operations.

***

## 💻 Tech Stack

* **Frontend:** React
* **Backend:** Django, Django REST Framework
* **Database:** PostgreSQL
* **Mapping:** Mapbox GL
* **Authentication:** djangorestframework-simplejwt

***

## 🚀 Getting Started

### 1. Prerequisites

* Python 3.x
* Node.js and npm
* PostgreSQL

### 2. Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/mapmates.git](https://github.com/your-username/mapmates.git)
    cd mapmates
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    # Install dependencies
    pip install -r requirements.txt
    # Run database migrations
    python manage.py migrate
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    # Install dependencies
    npm install
    ```

### 3. Running the Application

1.  **Run the backend server:**
    ```bash
    # From the 'backend' directory
    python manage.py runserver
    ```

2.  **Run the frontend development server:**
    ```bash
    # From the 'frontend' directory
    npm run dev
    ```

The application will be accessible at the development URL provided by the React development server (usually `http://localhost:3000`).
