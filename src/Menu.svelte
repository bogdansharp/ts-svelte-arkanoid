<script lang="ts">
    import { createEventDispatcher } from 'svelte'; // svelte

    export let toPlaySounds = false;
    export let toPlayMusic = false;

    const dispatch = createEventDispatcher();
    const doneBtnClick = () => dispatch('doneBtnClick');
    const newBtnClick = () => dispatch('newBtnClick');
    const nextBtnClick = () => dispatch('nextBtnClick');
</script>


<div id="controls">
    <h3>Settings</h3>
    <button id="new" on:click={newBtnClick}>
        New Game
    </button>
    <br/>
    <button id="next" on:click={nextBtnClick}>
        Next Level (cheat)
    </button>
    <br/>
    <fieldset>
        <legend>Sounds</legend>
        <label for="sound" class="checkboxblock unselectable">
            <span>Effects</span>
            <input type="checkbox" id="sound" class="oneandahalf" bind:checked={toPlaySounds} />
        </label>
        <label for="music" class="checkboxblock unselectable">
            <span>Music</span>
            <input type="checkbox" id="music" class="oneandahalf" bind:checked={toPlayMusic}/>
        </label>
    </fieldset>
    <button id="done" on:click={doneBtnClick}>
        Return to Game
    </button>
</div>


<style>
    #controls{
        position: absolute;
        z-index: 5;
        /* top: 40px; */
        width: 200px;
        /* margin-left: calc((100% - 216px)/2); */
        padding-bottom: 5px;
        text-align: center;
        background-color: white;
        box-shadow: 5px 5px 10px gray;
        /*display: none;*/
    }

    #controls h3{
        color: white;
        background-color: cornflowerblue;
        padding: 10px 5px;
        margin-top: 0px;
        margin-bottom: 5px;
    }

    #controls button /*, #controls select */
    {
        border: 1px black solid;
        margin: 5px;
        padding: 5px;
        min-width: 100px;
        font-size: medium;
        cursor: pointer;
    }

    #controls fieldset{
        text-align: left;
        width: 70%;
        margin: 5px auto;
    }

    #controls input[type='checkbox'] {
        vertical-align: middle;
        cursor: pointer;
    }

    .checkboxblock {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        margin-top: 5px;
        margin-bottom: 5px;
    }

    .unselectable {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .oneandahalf {
        transform: scale(1.5);
        -ms-transform: scale(1.5);
        -webkit-transform: scale(1.5);
        -o-transform: scale(1.5);
        -moz-transform: scale(1.5);
        transform-origin: 0 0;
        -ms-transform-origin: 0 0;
        -webkit-transform-origin: 0 0;
        -o-transform-origin: 0 0;
        -moz-transform-origin: 0 0;
    }
</style>
  