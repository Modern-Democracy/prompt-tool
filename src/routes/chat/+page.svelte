
<!-- src/routes/+page.svelte -->
<script>
    import {goto} from "$app/navigation";
    import {generateSlug} from "$lib/util/slug";
    import {getContext, onMount} from "svelte";

    function createChat() {
        const slug = generateSlug();
        goto(`/chat/${slug}`);
    }

    const userState = getContext('user');

    onMount(async () => {
        // fetch("/api/history", {
        //     headers: {Authorization: `Bearer ${$userState?.token}`},
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //     }).catch(error => {
        //     console.log(error);
        //     return [];
        // });
    });
</script>
<style>

    .chat-list li {
        padding: 1em;
        cursor: pointer;
    }

    .chat-list li.active, .chat-list li:hover {
        background-color: #333;
    }

    .chat-list li:hover .hover-icons, .chat-list li.active .hover-icons {
        display: inline;
    }

    .main-panel {
        flex-grow: 1;
        background-color: #FFF;
        overflow-y: auto;
    }

    .message {
        display: flex;
        align-items: flex-start;
        padding: 1em;
    }

    .user-message {
        background-color: #F1F1F1;
    }

    .assistant-message {
        background-color: #DDD;
    }

    .message-content {
        flex-grow: 1;
    }

    .input-container {
        position: fixed;
        bottom: 0;
        width: 80%;
        background-color: #FFF;
        display: flex;
        padding: 1em;
    }

    input[type="text"] {
        flex-grow: 1;
        border: 1px solid #CCC;
    }
</style>

<!-- Main Panel -->
<div class="main-panel">
    <button on:click={createChat}><span class="material-symbols-outlined">new</span></button>
    <div class="message user-message">
        <span class="material-symbols-outlined">person</span>
        <div class="message-content">User Message</div>
        <span class="material-symbols-outlined">edit</span>
    </div>
    <div class="message assistant-message">
        <span class="material-symbols-outlined">smart_toy</span>
        <div class="message-content">Assistant Message</div>
        <span class="material-symbols-outlined">edit</span>
    </div>
    <div class="input-container">
        <input type="text">
        <span class="material-symbols-outlined">send</span>
    </div>
</div>

