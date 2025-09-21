# Skill-Konnect

Skill-Konnect is a web application designed to connect individuals seeking mentorship with experienced professionals. Users can create profiles, showcase their skills, and search for mentors or mentees based on specific expertise. The platform facilitates communication and collaboration through a built-in messaging system.

## Features

*   **User Authentication:** Secure user registration and login using Firebase Authentication.
*   **User Profiles:** Create and manage user profiles with details such as a profile picture, bio, skills, and title.
*   **Skill-Based Search:** Find users with specific skills to connect with for mentorship.
*   **Mentorship Requests:** Send, receive, and manage mentorship requests.
*   **Real-time Messaging:** Engage in one-on-one conversations with connections.
*   **Task Management:** Create and track tasks within a mentorship engagement.
*   **User Ratings:** Rate mentors and mentees to build a reputation system.

## Tech Stack

*   **Frontend:** React, TypeScript, Redux, Tailwind CSS
*   **Backend:** Firebase (Firestore, Authentication, Storage, Functions)
*   **Build Tool:** Vite

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (or yarn)
*   A Firebase project

### Installation

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/akshay0dkd/Skill-konnect.git
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   In your Firebase project, create a new web app.
    *   Copy your Firebase configuration object and paste it into a new file at `src/firebase.ts`. The file should look like this:

    ```typescript
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    import { getStorage } from "firebase/storage";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);

    export const auth = getAuth(app);
    export const db = getFirestore(app);
    export const storage = getStorage(app);
    ```

### Running the Application

```sh
npm run dev
```

This will start the Vite development server, and you can view the application in your browser at `http://localhost:5173`.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in the development mode.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the code using ESLint.
*   `npm run preview`: Serves the production build locally.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
