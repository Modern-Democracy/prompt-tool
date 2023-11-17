
<!-- src/routes/+page.svelte -->
<script>
    import { useChat } from 'ai/svelte';
    import {getContext, onMount} from "svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    const userState = getContext('user');
    const { input, handleSubmit, messages } = useChat({
        api: '/api/memory-chat',
        headers: {
            'Authorization': `Bearer ${$userState?.token}`,
            'Session': data?.slug,
        },
        initialMessages: data?.conversation?.messages,
    });
</script>

<div>
    <ul>
        {#if $messages}
            {#each $messages as message}
                <li>{message.role}: {message.content}</li>
            {/each}
        {/if}
    </ul>
    <form on:submit={handleSubmit}>
        <input bind:value={$input} />
        <button type="submit">Send</button>
    </form>
</div>
	
