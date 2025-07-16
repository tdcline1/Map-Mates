# 🌎 MapMates

A full-stack web application that allows users to share and discover travel destinations on an interactive Mapbox GL map. Built with a React frontend and a Django REST Framework (DRF) backend.

***

## ✨ Features

* **Interactive Map:** A dynamic MapboxGL map that displays all user-submitted travel destinations.
* **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
* **Create & Share:** Authenticated users can add and edit places, including descriptions and images.
* **Explore Destinations:** Clicking on a map marker opens a detailed modal view of the location with a gallery of images.

***

<img width="1457" alt="image" src="https://github.com/user-attachments/assets/defe6935-d7b6-4568-9842-6eaca77e0124" />

## 🎥 Demo
Watch a [demo video](https://www.linkedin.com/feed/update/urn:li:activity:7350335637318787072/?updateEntityUrn=urn%3Ali%3Afs_feedUpdate%3A%28V2%2Curn%3Ali%3Aactivity%3A7350335637318787072%29) showcasing the interactive map, place creation, and authentication features.

***

## 🛠️ Technical Implementation

### 1. Authentication & Authorization: JWT-based security

* **Backend:** `djangorestframework-simplejwt`
* **Frontend:** 
  - React Context as single source of truth for authentication, distribute state and eliminate prop drilling. 
  - Attach tokens and handle request failure token refresh via Axios interceptors.
  - Proactive token refresh to maintain seamless user sessions.

### 2. Interactive Map with Mapbox GL

Interactive map powered by [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/)

* **Performance:** The map component remains mounted in the background to prevent re-initialization, delivering a smooth user experience and limiting api usage costs.
* **Dynamic Markers:** Markers on the map are dynamically generated from location data fetched from the backend. Clicking a marker triggers a modal with detailed information and images.

### 3. Backend API & Data Handling

The backend was built to handle complex data relationships, especially between places and their associated images.

* **Nested Serializers:** for the `Place` and `PlaceImage` models.
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

## ✅ Testing & Reliability

A GitHub Actions CI/CD workflow has been implemented to lint and test the most vital functionality, specifically the Edit Place workflow, using Factory Boy, APIClient, and pytest to ensure consistent code quality and functionality.

***

## 💻 Tech Stack

* **Frontend:** React
* **Backend:** Django, Django REST Framework
* **Database:** PostgreSQL
* **Mapping:** Mapbox GL
* **Authentication:** djangorestframework-simplejwt
* **CI/CD**: GitHub Actions
* **Testing**: pytest, Factory Boy, DRF APITestCase

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
