# Prompt Tool

A bare-bones LLM prompt tool meant to explore the [LangChain](https://js.langchain.com/docs/get_started/introduction) Javascript library with a real world example. Initial functionality will loosely cover the ChatGPT Plus UI functionality, but allow historical memory of conversations stored in Firebase (using FirestoreChatMessageHistory). In addition to memory, there will be specific chat types supported using the template language built into LangChain.

## Project Stack

- [SvelteKit](https://kit.svelte.dev/)
- [LangChain](https://js.langchain.com/docs/get_started/introduction)
- [Firebase](https://firebase.google.com/)

## Configuration

Copy or rename the .env-example file to .env and set all of the variables to the appropriate values. The .env file is ignored by git, so you can safely store your secrets there.
## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
