<script lang="ts">
	import { onDestroy } from 'svelte';

	import GameView, { state, menuOn } from './GameView.js';
	import GameLogger from './GameLogger';
	const { debugMsg, errorMsg } = GameLogger;
	import GameModel from './GameModel';
    import GameController from './GameController';
	import GameSound from './GameSound';
	import Game from "./Game.svelte";
	import Menu from "./Menu.svelte";
	import Gear from "./Gear.svelte";
    import MainStatus from './MainStatus.svelte';

	let toPlaySounds = false;
	let toPlayMusic = false;

	
	let control: GameController;
    const model = new GameModel();
	const sound = new GameSound();
	const view = new GameView(model);
    model.loadGameData().then(() => {
        if (model.err) {
            if (model.state != 1)
				errorMsg(`app: ${model.errMsg}`);
            else
				debugMsg(`app: ${model.errMsg}`);
        }
        control = new GameController(model, sound, view);
    });

	$: sound && sound.setSound(toPlaySounds);
	$: sound && sound.setMusic(toPlayMusic);
	$: debugMsg(`app: Model state is ${$state}`);
	$: model.state = $state;
	$: debugMsg(`app: Menu is ${$menuOn ? 'on' : 'off'}`);

	$: isMainStatusOn = [0, 4, 6, 7].indexOf($state) > -1; // INIT, WAIT or GAME OVER
	$: mainStatusClass = $state == 6 ? // GAME OVER
        'msg-err' : 'msg-ok';

	onDestroy( () => {
			control && control.kill();
			sound && sound.kill();
		}
	);
</script>


<svelte:document on:keydown={control.keyListener} />

<main class="main">
	{#if model && control}
		<Game 
			{model}
			on:click={control.gameAreaClick}
			on:keydown={control.keyListener} 
			on:mousedown={control.mouseDown}
			on:mousemove={control.mouseMove}
			on:mouseup={control.mouseUp}
			on:touchstart={control.mouseDown}
			on:touchmove={control.mouseMove}
			on:touchend={control.mouseUp}
		/>
		<Gear 
			on:click={control.showControls} 
			on:keydown={control.keyListener} 
		/>
		{#if isMainStatusOn}
			<MainStatus 
				text={model.statusTitle} 
				classes={mainStatusClass}
			/>
		{/if}
		{#if $menuOn}
			<Menu 
				bind:toPlaySounds={toPlaySounds} 
				bind:toPlayMusic={toPlayMusic} 
				on:doneBtnClick={control.showControls}
				on:newBtnClick={control.newGameClick}
				on:nextBtnClick={control.nextLevelClick}
			/>
		{/if}
	{/if}
</main>


<style>
	main {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
</style>