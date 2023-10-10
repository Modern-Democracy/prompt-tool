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

<slot />
