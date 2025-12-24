# **App Name**: MultiPostFlow

## Core Features:

- Content Input: Allows users to input base text, upload an image, and select a tone of voice for content generation.
- AI Content Generation: Uses Genkit to generate structured content for web and social media based on input text and selected tone.
- Draft Generation: Uses Genkit to generate a quick draft, suggesting fields for the form based on the idea and selected tone, functioning as a tool for content creation.
- Form Validation and Submission: Validates the form using Zod and submits the data.
- Publishing Options: Allows users to choose between publishing immediately or scheduling for a later time. This can happen via interaction with an external webhook.
- Save Draft: Saves content drafts to Firestore, including title, base text, tone, image URL, publish mode, and status, so the app is capturing content that will eventually get published to an external webhook.
- Webhook Integration: Sends a payload to an external webhook (Make) for content publication or scheduling.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to evoke a sense of structure and organization.
- Background color: Very light indigo (#F0F2FA), providing a neutral backdrop for content.
- Accent color: Bright teal (#00BCD4) to highlight key actions and elements, adding a modern touch.
- Body and headline font: 'Inter', a sans-serif font that gives a modern and neutral feel.
- Code font: 'Source Code Pro' for displaying code snippets.
- Simple, clear icons from a set like Material Design Icons.
- Clean, modular layout using Tailwind CSS for easy maintenance and responsiveness.