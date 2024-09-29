<script lang="ts">
    import { ballX, ballY, xScale, yScale } from './GameView.js';
    
    export let radius: number;
</script>
  

<circle
    id='ball'
    cx={$xScale($ballX)}
    cy={$yScale($ballY)}
    r={$xScale(radius)}
></circle>


<style>
    #ball {
        fill: darkolivegreen;
        transition: transform 0.1s linear;
        will-change: transform;
    }
</style>
  