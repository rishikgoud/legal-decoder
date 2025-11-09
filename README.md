# ⚖️ Legal Decoder

## 🧠 Overview

Legal Decoder is an AI-powered application designed to simplify complex legal documents into easy-to-understand language. It bridges the gap between legal professionals and everyday users by decoding jargon-heavy legal content into clear, concise summaries — helping users make informed decisions without needing advanced legal knowledge.

### The Problem It Solves

Legal documents are often filled with complicated terminology that most people struggle to understand. Legal Decoder solves this by:

-   Translating dense legal text into plain English.
-   Highlighting key clauses, obligations, and risks.
-   Saving time and reducing dependency on legal professionals for basic comprehension.

### The Idea

The main idea behind Legal Decoder is to make legal transparency accessible to everyone. Whether you’re signing a rental agreement, understanding a privacy policy, or reading contract terms — Legal Decoder ensures you know exactly what you’re agreeing to.

## ✨ Key Features

-   **Smart Contract Analysis**: Upload contracts (PDF, DOCX) or paste text to automatically identify clauses, get plain-English summaries, and receive risk scores (High, Medium, Low).
-   **Interactive Analysis Dashboard**: A visual dashboard with charts showing risk distribution and a detailed breakdown of every identified clause.
-   **AI Legal Chat**: Ask specific, natural language questions about your uploaded contract and receive instant, context-aware answers.
-   **Contract Comparison Tool**: Quickly spot the differences between two versions of a contract, with the AI highlighting what was added, removed, or changed.
-   **Clause Explorer**: An educational hub to learn about the most common legal clauses, their purpose, and their standard wording.
-   **Secure User Authentication**: User accounts and data are managed securely, ensuring that all contract analyses are private.

## 🧰 Technology Stack

| Category         | Tools / Technologies                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| **Frontend**     | [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN/UI](https://ui.shadcn.com/) |
| **Generative AI**| [Genkit](https://firebase.google.com/docs/genkit), [Google Gemini](https://deepmind.google/technologies/gemini/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL Database & Authentication)            |
| **Animations**   | [Framer Motion](https://www.framer.com/motion/), [Vanta.js](https://www.vantajs.com/) (for 3D background), [Lottie](https://lottiefiles.com/) |
| **File Parsing** | [pdf.js](https://mozilla.github.io/pdf.js/) (Client-side PDF text extraction)         |
| **Deployment**   | [Firebase App Hosting](https://firebase.google.com/docs/hosting)                    |
| **Version Control**| Git & GitHub                                                                        |

## ⚙️ How It Works

1.  **Upload or Paste Legal Text**: Users can upload a contract (PDF/DOCX) or paste the text directly.
2.  **AI Processing**: The text is sent to the Google Gemini model via a Genkit flow for decoding, clause detection, and summarization.
3.  **Simplified Output**: The system returns a structured report with plain-language explanations, risk scores, and recommendations.
4.  **User Interaction**: Users can explore the interactive dashboard or ask follow-up questions using the AI Legal Chat.

## 🚀 Product Demo

-   **Live Demo / Prototype**: [Insert your hosted app link here]
-   **Demo Video**: [Insert video link — YouTube, Loom, or Google Drive]
-   **Presentation Deck**: [Insert link to Google Slides or PDF presentation]

## 🧑‍💻 Installation & Setup

1.  **Clone the Repository**

    ```sh
    git clone https://github.com/your-username/legal-decoder.git
    cd legal-decoder
    ```

2.  **Install Dependencies**

    ```sh
    npm install
    ```

3.  **Create an Environment File**
    Create a `.env` file in the root directory and add your Supabase project credentials. You can find these in your Supabase project settings under "API".

    ```env
    NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Run the Development Server**

    ```sh
    npm run dev
    ```

5.  **Access the App**
    Open [http://localhost:9002](http://localhost:9002) to view it in your browser.

## 📂 Folder Structure

```
legal-decoder/
│
├── src/
│   ├── app/                # Next.js App Router pages (e.g., dashboard, compare)
│   ├── components/         # Reusable UI components (e.g., Header, Dashboard)
│   ├── ai/                 # Genkit flows and AI logic
│   │   ├── flows/
│   │   └── schemas/
│   ├── lib/                # Helper functions, Supabase client, types
│   └── firebase/           # Firebase configuration and hooks
│
├── public/               # Static assets (images, fonts)
├── .env                  # Environment variables
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── README.md
```

## 🔒 Security & Ethics

Legal Decoder does not store user documents. Text processing is transient, and all analysis data saved to the database is protected and tied to the user's secure account. The AI-generated summaries are for educational and informational purposes only and do not constitute legal advice. Always consult with a qualified professional for critical matters.

## 🧠 Future Improvements

-   **Multi-language support** for international legal documents.
-   **Enhanced document comparison** to show line-by-line text differences.
-   **Personalized user profiles** with analysis history and preferences.
-   **Deeper integration with legal datasets** for more robust risk analysis.

## 👥 Team & Contributions

Contributions are welcome! Feel free to fork the repo and submit pull requests.

**Developed by**: [Team CodeQuest - Rishik & Rishab ]
