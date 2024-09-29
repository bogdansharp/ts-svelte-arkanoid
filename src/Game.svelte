<script lang="ts">
    import { onMount } from 'svelte'; // svelte

    import { 
        frame, state, dragMode, gameAreaShiftX, gameAreaShiftY, coefX, coefY
    } from './GameView';
    import GameModel from './GameModel';
    import Bricks from './Bricks.svelte';
    import Paddle from './Paddle.svelte';
    import Ball from './Ball.svelte';
    import ScoreText from './ScoreText.svelte';
    import StatusText from './StatusText.svelte';

    export let model: GameModel;

    let gameArea;
    let width: number, height: number;
    let ballVisible = false;
    let paddleVisible = false;
    let bricksVisible = false;
    let mainStatusVisible = false;
    let gameClasses = '';

    const xPosScoreText = 10;
    const yPosScoreText = model.height - 15;
    const xPosStatusText = model.width - 40;
    const yPosStatusText = model.height - 15;

    onMount(() => {
        const gameElement = document.getElementById("game");
        document.title = model.title;
        if (gameElement) {
            gameElement.style.width = `${model.height ? 100 * model.width / model.height : 0}vh`;
            gameElement.style.maxHeight = `${model.width ? 100 * model.height / model.width : 0}vw`;
        }
        updateAreaShift();
    });

        // import { scaleLinear } from 'd3'; // D3
        // $: xScale = scaleLinear()
        // 	.domain([0, model.width])
        // 	.range([0, width]);
        // $: yScale = scaleLinear()
        // 	.domain([0, model.height])
        // 	.range([0, height]);

    $: coefX.set(width && model.width ? width / model.width : 1);
        // Horizontal scaling factor
    $: coefY.set(height && model.height ? height / model.height : 1);
        // Vertical scaling factor

    const updateAreaShift = () => {
        const rect = gameArea && gameArea.getBoundingClientRect();
        if (rect) {
            gameAreaShiftX.set(rect.left);
            gameAreaShiftY.set(rect.top);
        }
    }
    const onWindowResize = (e) => { updateAreaShift(); }

    $: ballVisible = paddleVisible = bricksVisible = mainStatusVisible =
        [1, 3, 6, 7].indexOf($state) > -1;  // ACTIVE, BALL MISSED, GAME OVER, VICTORY

    $: gameClasses = $dragMode ? 'cursor-pointer' : '';
</script>


<svelte:window on:resize={onWindowResize} />

<div id="game" data-frame={$frame} class={gameClasses}
    bind:this={gameArea}
    bind:clientWidth={width} bind:clientHeight={height}
    on:click on:keydown on:mousedown on:mousemove on:mouseup
    on:touchstart on:touchmove on:touchend
>
    <svg {width} {height} >
		<!-- Only start when our window is initialised -->
		{#if width && height}
            {#if bricksVisible}
                <Bricks {model}/>
            {/if}
            {#if paddleVisible}
                <Paddle
                    top={model.paddleTop} 
                    width={model.paddleWidth} 
                    height={model.paddleHeight}
                />
            {/if}
            {#if ballVisible}
                <Ball radius={model.ballRadius} />
            {/if}
            <ScoreText xPos={xPosScoreText} yPos={yPosScoreText} />
            {#if mainStatusVisible}
                <StatusText xPos={xPosStatusText} yPos={yPosStatusText} />    
            {/if}
		{/if}
	</svg>
</div>
  

<style>
    :global(#game) {
        /* background-color: gainsboro; */
        /* border: 1px black solid; */
    
        /* Maintain aspect ratio */
        width: calc(100% * 666 / 666); 
        height: 100%; 
        background-color: #dcdcdc; /* Example background color */

        /* Fallback if window ratio is lower */
        max-width: 100%;
        max-height: calc(100vw * 666 / 666);
    }

    svg {
        background: #dcdcdc;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
    }
</style>
  