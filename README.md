# SoundSync

## Play. Feel. Enjoy.

SoundSync is a full-stack interactive music application designed to make music listening more engaging, expressive, and enjoyable, especially when sharing music with friends. The project was built around a simple but distinctive idea: the most memorable part of a song is often its hook, and that moment should feel different from ordinary playback.

Rather than focusing on becoming another feature-heavy music streaming platform, SoundSync concentrates on the listening experience itself. Users can add their own songs, play them directly from the application, save songs they like as favorites, search their music collection, and experiment with basic DJ-style controls. The central feature of the application is the **LET'S GO** interaction, which creates a special effect during the most exciting part of a song.

When the hook or a favorite moment arrives, the user can press and hold the **LET'S GO** button on a mobile device. On a computer, the same action can be performed by holding the **SPACEBAR**. While the control is being held, the music volume temporarily drops to 15%. As soon as the user releases the button or key, the previous volume is restored. This simple interaction is the core identity of SoundSync and is intended to create a fun shared experience while listening to music with friends.

## The Idea Behind SoundSync

Traditional music players primarily focus on playing, pausing, organizing, and managing songs. SoundSync takes a slightly different approach by focusing on a specific emotional moment within a song.

The concept can be represented as:

    Song Playing
          ↓
      Hook Arrives
          ↓
    Hold LET'S GO
          ↓
     Volume → 15%
          ↓
    Enjoy the Moment
          ↓
        Release
          ↓
    Previous Volume Returns

This interaction is intentionally simple. The user does not need to navigate through multiple screens or configure complicated settings. The experience is designed to happen naturally while a song is already playing.

## Core Features

### Interactive LET'S GO Effect

The LET'S GO feature is the main concept behind SoundSync. It allows users to temporarily reduce the playback volume to 15% while holding the control.

On mobile devices, this is achieved through the on-screen LET'S GO button. On desktop systems, the SPACEBAR provides the same functionality.

The application stores the user's previous volume level and restores it when the control is released.

### Personal Song Library

SoundSync allows users to add their own local audio files to the application. Uploaded songs are processed by the Spring Boot backend, while song information is stored in the MySQL database.

Users can then view their songs through the application and play them whenever they want.

### Music Playback

The built-in player provides the fundamental controls required for everyday listening, including:

- Play and Pause
- Previous and Next
- Progress Seeking
- Volume Control
- Mute
- Shuffle
- Repeat

The player remains available while navigating through the main sections of the application.

### Favorites

SoundSync includes a Favorites feature that allows users to save songs they especially enjoy.

Favorites are not stored only in the browser. The frontend communicates with the Spring Boot REST API, which stores favorite relationships in MySQL. As a result, favorites remain available after the application is refreshed.

The flow is:

    User selects Favorite
             ↓
       Frontend Request
             ↓
        Spring Boot
             ↓
            MySQL

### Search

The application provides a search feature for quickly finding songs in the user's collection. The search interface filters the available music based on the stored song information.

### DJ Mode

SoundSync also includes a lightweight DJ Mode for users who want to experiment with playback and sound.

The current DJ controls include:

- Playback Speed
- Bass
- Treble
- Volume

The values displayed beside the controls update dynamically while the sliders are being adjusted.

The audio effects are handled on the client side using the Web Audio API.

### Song Deletion

Users can remove songs from the application when they are no longer needed. The backend handles both the stored song record and the associated audio file.

This keeps the music library manageable without requiring manual database operations.

## Technology and Architecture

SoundSync follows a simple full-stack architecture that separates the frontend, backend, database, and audio storage responsibilities.

The frontend is built using HTML, CSS, and JavaScript. It provides the user interface, music controls, navigation, search, favorites, and interactive LET'S GO behavior.

The backend is implemented using Java and Spring Boot. It exposes REST APIs for song management, audio streaming, and favorites. Spring Data JPA and Hibernate are used to communicate with the MySQL database.

The database stores the persistent application data, including song metadata and favorite relationships. Uploaded audio files are maintained by the backend in local storage.

The overall architecture is:

    ┌───────────────────────────┐
    │         Frontend         │
    │                           │
    │ HTML • CSS • JavaScript  │
    │ Web Audio API            │
    └─────────────┬─────────────┘
                  │
                  │ REST API
                  ▼
    ┌───────────────────────────┐
    │          Backend          │
    │                           │
    │ Java • Spring Boot       │
    │ Spring Web MVC           │
    │ Spring Data JPA          │
    └─────────────┬─────────────┘
                  │
                  │ JPA
                  ▼
    ┌───────────────────────────┐
    │           MySQL           │
    │                           │
    │ Songs • Favorites        │
    └───────────────────────────┘

The backend also manages locally stored audio files that are streamed to the browser when a user plays a song.

## Technology Stack

### Frontend

SoundSync uses HTML5 for the application structure, CSS3 for styling and responsive design, and JavaScript for application behavior and interaction.

The Web Audio API is used for client-side audio processing and DJ-related effects. Font Awesome is used for interface icons.

### Backend

The backend uses Java 21 and Spring Boot.

Spring Web MVC is used to build the REST API, while Spring Data JPA and Hibernate provide persistence and object-relational mapping. Maven manages the project dependencies and build configuration.

### Database

MySQL is used as the relational database for persistent application data.

The primary entities are:

    Song
    ├── id
    ├── songName
    ├── fileName
    ├── filePath
    └── createdAt

    Favorite
    ├── id
    ├── song
    └── createdAt

A Favorite references a Song through the song relationship.

## REST API

The backend exposes REST endpoints for the major application operations.

### Song APIs

    GET    /api/songs

Retrieves the available songs.

    GET    /api/songs/{id}

Retrieves a specific song.

    POST   /api/songs/upload

Uploads a new audio file.

    GET    /api/songs/{id}/audio

Streams the selected audio file.

    DELETE /api/songs/{id}

Deletes the selected song.

### Favorite APIs

    GET    /api/favorites

Retrieves saved favorites.

    POST   /api/favorites/{songId}

Adds a song to Favorites.

    DELETE /api/favorites/{songId}

Removes a song from Favorites.

    GET    /api/favorites/{songId}/check

Checks whether a song is currently marked as a favorite.

## Project Structure

    Music fun/
    │
    ├── .gitignore
    ├── README.md
    │
    ├── Frontend/
    │   ├── index.html
    │   │
    │   ├── assets/
    │   │   └── images/
    │   │       ├── soundsync-cover.png
    │   │       └── soundsync-hero.png
    │   │
    │   ├── css/
    │   │   └── style.css
    │   │
    │   └── js/
    │       ├── api.js
    │       ├── app.js
    │       ├── favorites.js
    │       ├── player.js
    │       └── search.js
    │
    └── soundsyncbackend/
        │
        ├── pom.xml
        │
        └── src/
            └── main/
                ├── java/
                │   └── com/
                │       └── soundsync/
                │           └── soundsyncbackend/
                │               │
                │               ├── SoundsyncbackendApplication.java
                │               │
                │               ├── controller/
                │               │   ├── SongController.java
                │               │   └── FavoriteController.java
                │               │
                │               ├── entity/
                │               │   ├── Song.java
                │               │   └── Favorite.java
                │               │
                │               ├── repository/
                │               │   ├── SongRepository.java
                │               │   └── FavoriteRepository.java
                │               │
                │               └── service/
                │                   ├── SongService.java
                │                   └── FavoriteService.java
                │
                └── resources/
                    └── application.properties

## Running the Project

### Prerequisites

The following software is required to run SoundSync locally:

- Java 21
- Maven 3.9+
- MySQL 8+
- Visual Studio Code or another Java development environment
- A modern web browser

### Database Setup

Create the SoundSync database in MySQL:

    CREATE DATABASE soundsync;

Configure the database connection inside:

    soundsyncbackend/src/main/resources/application.properties

Example configuration:

    spring.datasource.url=jdbc:mysql://localhost:3306/soundsync
    spring.datasource.username=root
    spring.datasource.password=YOUR_PASSWORD

    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true

    server.port=8080

Replace YOUR_PASSWORD with the password configured for the local MySQL installation.

### Start the Backend

Open a terminal inside the Spring Boot project directory:

    soundsyncbackend/soundsyncbackend

Run:

    & "C:\Program Files\apache-maven-3.9.11\bin\mvn.cmd" spring-boot:run

The backend will start on:

    AWS backend URL for documentation
### Start the Frontend

Open the Frontend folder in Visual Studio Code and run index.html using Live Server.

The frontend will normally be available at:

    http://localhost:5500

## How SoundSync Works

A typical user session follows this flow:

    Start SoundSync
          ↓
    Add Local Songs
          ↓
    Songs Stored Through Backend
          ↓
    Select a Song
          ↓
       Start Playing
          ↓
    Hook / Favourite Moment
          ↓
    Hold LET'S GO or SPACEBAR
          ↓
      Volume Drops to 15%
          ↓
         Release
          ↓
    Previous Volume Restored

At the same time, users can search their collection, mark songs as favorites, use DJ controls, and remove songs they no longer want.

## Design Philosophy

The design of SoundSync follows a simple principle:

> Less management. More music. More moments.

The project intentionally avoids unnecessary music-management features that are not central to its purpose. Instead, the application keeps its focus on the user's own songs and the interactive listening experience.

The core product idea can be summarized as:

    Your Music
        +
    Simple Playback
        +
    Favorites
        +
    DJ Controls
        +
    LET'S GO
        =
    SoundSync

## What I Learned from the Project

Developing SoundSync provided practical experience across both frontend and backend development.

The project involved building a responsive user interface, connecting JavaScript to REST APIs, handling multipart audio uploads, streaming media through Spring Boot, working with MySQL persistence, creating JPA entities and repositories, implementing relationships between entities, handling CORS between frontend and backend ports, and working with browser-based audio processing.

The project also required debugging issues across multiple layers of the application, including database constraints, API responses, file paths, audio streaming, and frontend-backend communication.

This made SoundSync more than a user-interface project; it became a practical full-stack application involving multiple technologies working together.

## Future Enhancements

The current version focuses on the core SoundSync experience. Possible future improvements include:

- Real-time listening rooms
- Synchronized playback between friends
- Shared music sessions
- Advanced DJ effects
- Visual audio waveforms
- Cloud-based music storage
- Authentication and user accounts
- Mobile application support
- Cloud deployment

These enhancements are potential future directions and are not required for the current core version.

## Current Project Status

The core SoundSync application is complete and functional.

    Song Upload          ✅
    Song Storage         ✅
    Song Playback        ✅
    Search               ✅
    Favorites            ✅
    Song Deletion        ✅
    DJ Mode              ✅
    Bass Control         ✅
    Treble Control       ✅
    Playback Speed       ✅
    Volume Control       ✅
    LET'S GO             ✅
    SPACEBAR Support     ✅
    MySQL Persistence    ✅
    Spring Boot API      ✅
    Responsive UI        ✅

## Conclusion

SoundSync was developed with a simple goal: make music listening feel more interactive.

The project combines a familiar music-player experience with a distinctive hook-based interaction. The **LET'S GO** feature is the central concept, allowing users to transform the most exciting part of a song into a small shared experience with friends.

From a technical perspective, the project demonstrates how a modern web frontend can communicate with a Java Spring Boot backend, persist data using MySQL, manage local audio files, and perform real-time browser-side audio processing.

From a product perspective, SoundSync demonstrates that a small, focused interaction can give a familiar application a unique identity.

## SoundSync

### Play. Feel. Enjoy.

**Feel the hook. Own the moment.**


<img width="1910" height="918" alt="image" src="https://github.com/user-attachments/assets/fc94b48f-83cd-47d4-9e10-c875d88269db" />

