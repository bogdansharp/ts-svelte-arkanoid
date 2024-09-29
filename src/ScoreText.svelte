<script lang="ts">
    import { score, coefX, coefY } from './GameView';

    export let xPos: number;
    export let yPos: number;
    
    let scoreText = 'Score: 0';
    $: scoreText = `Score: ${$score}`;
</script>


<text 
    id="score"
    class="unselectable"
    x={xPos} 
    y={yPos} 
    transform={`scale(${$coefX}, ${$coefY})`}
>
    {scoreText}
</text>


<style>
    #score {
        fill: black;
        opacity: 0.9;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }
</style>
  