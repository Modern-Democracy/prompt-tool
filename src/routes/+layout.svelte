<script lang='ts'>
	import { setContext } from 'svelte';
	import { writable} from 'svelte/store';

	// Create a store and update it when necessary...
	const userState = writable();
	// ...and add it to the context for child components to access
	setContext('user', userState);

	// Subscribe to the store and update the token and isLoggedIn variables when it changes
	$: userState.subscribe((userState) => {
		if (userState) {

			displayName = userState?.user?.displayName;
			token = userState?.token;
			isLoggedIn = true;
		} else {
			displayName = '';
			token = null;
			isLoggedIn = false;
		}
	});

	let displayName = '';
	let token = null;
	let isLoggedIn = false;
</script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

<style>
    body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: Arial, sans-serif; /* Open font similar to the example */
    }

    .container {
        display: flex;
        height: 100vh;
    }

    .left-panel {
        background-color: #000;
        width: 20%;
        color: #FFF;
    }

    .menu-toggle {
        text-align: right;
        padding: 1em;
    }

    .chat-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

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

    .hover-icons {
        float: right;
    }

    .user-panel {
        position: absolute;
        bottom: 0;
        width: 100%;
        background-color: #111;
        color: #FFF;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1em;
    }

    input[type="text"] {
        flex-grow: 1;
        border: 1px solid #CCC;
    }
</style>

<div class="container">
    <!-- Left Menu Panel -->
    <div class="left-panel">
        <div class="menu-toggle">
            <span class="material-symbols-outlined">person</span>
        </div>
        <ul class="chat-list">
            <li class="active">
                <span>Conversation 1</span>
                <div class="hover-icons">
                    <span class="material-symbols-outlined">edit</span>
                    <span class="material-symbols-outlined">delete</span>
                </div>
            </li>
            <li><span>Conversation 2</span></li>
        </ul>
        <div class="user-panel">
            <span class="material-symbols-outlined">person</span>
            <span>Username</span>
            <span class="material-symbols-outlined">person</span>
        </div>
    </div>
    <slot/>
</div>
