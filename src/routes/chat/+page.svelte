
<!-- src/routes/+page.svelte -->
<script>
    import { useChat } from 'ai/svelte';
    import {getContext} from "svelte";

    const userState = getContext('user');
    const { input, handleSubmit, messages } = useChat({
        api: 'api/chat',
        headers: { 'Authorization': `Bearer ${$userState?.token}` }
    });
</script>

<div>
    <ul>
        {#each $messages as message}
            <li>{message.role}: {message.content}</li>
        {/each}
    </ul>
    <form on:submit={handleSubmit}>
        <input bind:value={$input} />
        <button type="submit">Send</button>
    </form>
</div>
	
