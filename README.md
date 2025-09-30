# SignFlix

SignFlix is an accessible video streaming platform with integrated sign language interpretation for the deaf and hard-of-hearing community.

## Project Structure

The project is a monorepo containing two main applications:

- `site`: A Next.js application that serves as the frontend for SignFlix. It includes user authentication, video streaming, and a creator studio for uploading and managing videos.
- `conversion2`: A Node.js application responsible for processing uploaded videos. It converts English captions to ASL, generates pose data for sign language simulation, and manages the video processing queue.

## Technologies Used

### Frontend (`site`)

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

### Backend (`conversion2`)

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Cloud Storage**: [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)
- **Queueing**: [Azure Queue Storage](https://azure.microsoft.com/en-us/services/storage/queues/)
- **AI**: [Google Gemini API](https://ai.google.dev/)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- An Azure account with Storage (Blob and Queue) services enabled.
- A Google account with access to the Gemini API.

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jtuluve/SignFlix
   cd SignFlix
   ```

2. **Configure the `site` application:**

   - Navigate to the `site` directory: `cd site`
   - Install dependencies: `npm install`
   - Create a `.env` file and add the following environment variables:

     ```
     DATABASE_URL="your_database_url"
     AZURE_STORAGE_ACCOUNT="your_azure_storage_account"
     AZURE_BLOB_SAS_TOKEN="your_azure_blob_sas_token"
     AZURE_QUEUE_CONNECTION_STRING="your_azure_queue_connection_string"
     QUEUE_API_URL="your_queue_api_url"
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="your_nextauth_secret"
     ```

3. **Configure the `conversion2` application:**

   - Navigate to the `conversion2` directory: `cd ../conversion2`
   - Install dependencies: `npm install`
   - Create a `.env` file and add the following environment variables:

     ```
     GEMINI_API_KEY="your_gemini_api_key"
     AZURE_QUEUE_CONNECTION_STRING="your_azure_queue_connection_string"
     VIDEO_QUEUE_NAME="your_video_queue_name"
     ```

### Running the Application

1. **Start the `site` application:**

   - Navigate to the `site` directory.
   - Run the development server:

     ```bash
     npm run dev
     ```

   The application will be available at `http://localhost:3000`.

2. **Start the `conversion2` application:**

   - Navigate to the `conversion2` directory.
   - Build the application: `npm run build`
   - Start the server:

     ```bash
     npm start
     ```

   The conversion service will be running and listening for requests.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.