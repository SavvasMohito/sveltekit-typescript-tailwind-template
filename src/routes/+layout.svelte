<script lang="ts">
	import '../app.css';
	// import Navbar from './Navbar.svelte';
</script>

<div class="min-h-full dark">
	<!-- <Navbar /> -->

	<header class="bg-white dark:bg-gray-900 shadow">
		<div class="py-2 px-4 flex justify-between">
			<h1
				class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200 py-4 sm:px-2 lg:px-4"
			>
				ORANOS Map Viewer
			</h1>
			<img
				class="w-40 max-w-xs bg-white my-auto mx-4"
				src="https://logos-download.com/wp-content/uploads/2016/12/University_of_Bristol_logo.png"
				alt="University of Bristol Logo"
			/>
		</div>
	</header>
	<main>
		<slot />
	</main>
</div>
